import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getActiveCategories,
  getAllCategories,
  getAvailableMenuItems,
  getAllMenuItems,
  getMenuItemsByCategory,
  toggleMenuItemAvailability,
  getActiveTables,
  createOrder,
  getOrdersWithItems,
  updateOrderStatus,
  getTodayOrderStats,
  getExpressionsByLanguage,
  getExpressionsByCategory,
  saveGameScore,
  getStudentScores,
  getLeaderboard,
  updateOrderPayment,
  markOrderWhatsappNotified,
  getSetting,
  setSetting,
  getAllSettings,
  getRestaurantBySlug,
  getAllRestaurants,
  getPartnerUserByUsername,
  getPartnerUserById,
  getOrdersByRestaurant,
  getRestaurantStats,
  getAllRestaurantsWithStats,
  getConsultantsByRestaurant,
  getAllConsultantsByRestaurant,
  createConsultant,
  updateConsultant,
  deleteConsultant,
  getConsultantById,
  getLeadsFiltered,
  getAllStudentProgress,
  getStudentDetail,
} from "./db";
import * as crypto from "crypto";
import jwt from "jsonwebtoken";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { leads, restaurants as restaurantsTable } from "../drizzle/schema";
import { getDb } from "./db";
import { eq } from "drizzle-orm";

const PARTNER_JWT_SECRET = process.env.JWT_SECRET || "partner-secret-key";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "imaind-salt").digest("hex");
}

function signPartnerToken(payload: { id: number; restaurantId: number; role: string; username: string }): string {
  return jwt.sign(payload, PARTNER_JWT_SECRET, { expiresIn: "7d" });
}

function verifyPartnerToken(token: string): { id: number; restaurantId: number; role: string; username: string } | null {
  try {
    return jwt.verify(token, PARTNER_JWT_SECRET) as any;
  } catch {
    return null;
  }
}

const partnerProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Partner token required" });
  const payload = verifyPartnerToken(token);
  if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
  const partnerUser = await getPartnerUserById(payload.id);
  if (!partnerUser || !partnerUser.active) throw new TRPCError({ code: "UNAUTHORIZED", message: "Partner account not found" });
  return next({ ctx: { ...ctx, partner: partnerUser } });
});

const masterProcedure = partnerProcedure.use(({ ctx, next }) => {
  if ((ctx as any).partner.role !== "master") throw new TRPCError({ code: "FORBIDDEN", message: "Master access required" });
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== LEADS ROUTES (inFlux captação) =====
  leads: router({
    save: publicProcedure
      .input(z.object({
        restaurantId: z.number(),
        language: z.enum(["en", "es"]),
        rating: z.number().min(1).max(5).optional(),
        interested: z.boolean(),
        name: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        consultant: z.enum(["lucas", "vicky"]).nullable().optional(),
        consultantId: z.number().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        // Get restaurant name
        const [restaurant] = await db!.select().from(restaurantsTable).where(eq(restaurantsTable.id, input.restaurantId)).limit(1);

        // Resolve consultant info (custom or default Lucas/Vicky)
        let consultantName: string | null = null;
        let consultantWhatsapp: string | null = null;
        if (input.consultantId) {
          const { partnerConsultants } = await import("../drizzle/schema");
          const [consultant] = await db!.select().from(partnerConsultants)
            .where(eq(partnerConsultants.id, input.consultantId)).limit(1);
          if (consultant) {
            consultantName = consultant.name;
            consultantWhatsapp = consultant.whatsappNumber;
          }
        } else if (input.consultant === "lucas") {
          consultantName = "Lucas";
          consultantWhatsapp = "5511947515284";
        } else if (input.consultant === "vicky") {
          consultantName = "Vicky";
          consultantWhatsapp = "5511947515284";
        }

        await db!.insert(leads).values({
          restaurantId: input.restaurantId,
          language: input.language,
          rating: input.rating ?? null,
          interested: input.interested,
          name: input.name ?? null,
          phone: input.phone ?? null,
          consultant: input.consultant ?? null,
          consultantId: input.consultantId ?? null,
          consultantName,
          consultantWhatsapp,
          restaurantName: restaurant?.name ?? null,
          notified: false,
          consultantNotified: false,
        });

        // Notify owner via Manus notification
        if (input.interested && input.name) {
          const consultantLabel = consultantName ?? input.consultant ?? "não escolhido";
          await notifyOwner({
            title: `🎯 Novo Lead inFlux - ${restaurant?.name ?? "ImAInd"}`,
            content: `Nome: ${input.name}\nTelefone: ${input.phone ?? "não informado"}\nConsultor: ${consultantLabel}\nIdioma: ${input.language === "en" ? "Inglês" : "Espanhol"}\nNota: ${input.rating ?? "não avaliado"}/5\nRestaurante: ${restaurant?.name ?? input.restaurantId}`,
          });

          // Send WhatsApp to consultant via webhook if configured
          const webhookUrl = await getSetting("webhook_url");
          if (webhookUrl && consultantWhatsapp && input.name) {
            const langLabel = input.language === "en" ? "Inglês" : "Espanhol";
            const whatsappMsg =
              `🎯 *Novo Lead ImAInd!*\n\n` +
              `👤 Aluno: ${input.name}\n` +
              `📱 Telefone: ${input.phone ?? "não informado"}\n` +
              `🏫 Restaurante: ${restaurant?.name ?? "ImAInd"}\n` +
              `💬 Idioma: ${langLabel}\n` +
              `⭐ Nota: ${input.rating ?? "? "}/5\n\n` +
              `Este aluno demonstrou interesse em estudar ${langLabel} na inFlux! Entre em contato 😊`;
            try {
              await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phone: consultantWhatsapp,
                  message: whatsappMsg,
                  type: "lead_notification",
                  leadData: { name: input.name, phone: input.phone, restaurant: restaurant?.name, language: input.language, rating: input.rating },
                }),
              });
            } catch (err) {
              console.error("[WhatsApp Lead] Failed to send:", err);
            }
          }
        }
        return { success: true };
      }),
    list: protectedProcedure
      .query(async () => {
        const db = await getDb();
        const allLeads = await db!.select().from(leads).orderBy(leads.createdAt);
        return allLeads.reverse();
      }),
  }),
  // ===== RESTAURANT ROUTES =====
  restaurant: router({
    all: publicProcedure.query(async () => {
      return getAllRestaurants();
    }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getRestaurantBySlug(input.slug);
      }),

    menu: publicProcedure
      .input(z.object({ restaurantId: z.number() }))
      .query(async ({ input }) => {
        const [categories, items, restaurantTables] = await Promise.all([
          getActiveCategories(input.restaurantId),
          getAvailableMenuItems(input.restaurantId),
          getActiveTables(input.restaurantId),
        ]);
        return { categories, items, tables: restaurantTables };
      }),
  }),

  // ===== PUBLIC MENU ROUTES (Organic - restaurantId=1 default) =====
  menu: router({
    categories: publicProcedure.query(async () => {
      return getActiveCategories(1);
    }),

    items: publicProcedure.query(async () => {
      return getAvailableMenuItems(1);
    }),

    itemsByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return getMenuItemsByCategory(input.categoryId);
      }),

    tables: publicProcedure.query(async () => {
      return getActiveTables(1);
    }),
  }),

  // ===== ORDER ROUTES =====
  order: router({
    create: publicProcedure
      .input(z.object({
        tableId: z.number(),
        studentName: z.string().min(1),
        notes: z.string().optional(),
        items: z.array(z.object({
          menuItemId: z.number(),
          quantity: z.number().min(1),
          unitPrice: z.string(),
          notes: z.string().optional(),
        })).min(1),
      }))
      .mutation(async ({ input }) => {
        const totalAmount = input.items
          .reduce((sum, item) => sum + parseFloat(item.unitPrice) * item.quantity, 0)
          .toFixed(2);

        const orderId = await createOrder({
          tableId: input.tableId,
          studentName: input.studentName,
          totalAmount,
          notes: input.notes,
          items: input.items,
        });

        // Notify the café owner
        const itemsSummary = input.items.map(i => `${i.quantity}x item #${i.menuItemId}`).join(", ");
        await notifyOwner({
          title: `🍽️ New Order #${orderId}`,
          content: `Student: ${input.studentName}\nTable: ${input.tableId}\nTotal: R$ ${totalAmount}\nItems: ${itemsSummary}`,
        });

        return { orderId, totalAmount };
      }),

    // Get order status (public - for student tracking)
    status: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const allOrders = await getOrdersWithItems();
        const order = allOrders.find(o => o.id === input.orderId);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        return order;
      }),

    // Upload payment proof (public - student uploads comprovante)
    uploadPaymentProof: publicProcedure
      .input(z.object({
        orderId: z.number(),
        imageBase64: z.string(),
        mimeType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ input }) => {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.imageBase64, "base64");
        const ext = input.mimeType.includes("png") ? "png" : "jpg";
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `payment-proofs/order-${input.orderId}-${randomSuffix}.${ext}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Update order with payment proof
        await updateOrderPayment(input.orderId, {
          paymentStatus: "pending_verification",
          paymentMethod: "pix",
          paymentProofUrl: url,
        });

        // Send WhatsApp notification
        try {
          await sendWhatsAppOrderNotification(input.orderId);
        } catch (err) {
          console.error("[WhatsApp] Failed to send notification:", err);
        }

        return { success: true, proofUrl: url };
      }),

    // Get Pix payment info
    pixInfo: publicProcedure.query(async () => {
      const pixKey = await getSetting("pix_key") || "";
      const pixName = await getSetting("pix_name") || "ImAInd";
      const pixCity = await getSetting("pix_city") || "Jundiai";
      return { pixKey, pixName, pixCity };
    }),
  }),

  // ===== EXPRESSIONS & GAMES =====
  expressions: router({
    byLanguage: publicProcedure
      .input(z.object({
        language: z.enum(["en", "es"]),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      }))
      .query(async ({ input }) => {
        return getExpressionsByLanguage(input.language, input.difficulty);
      }),

    byCategory: publicProcedure
      .input(z.object({
        language: z.enum(["en", "es"]),
        category: z.string(),
      }))
      .query(async ({ input }) => {
        return getExpressionsByCategory(input.language, input.category);
      }),
  }),

  game: router({
    saveScore: publicProcedure
      .input(z.object({
        studentName: z.string().min(1),
        tableId: z.number().optional(),
        gameType: z.enum(["voice_order", "phrase_builder", "qa_simulation"]),
        difficulty: z.enum(["easy", "medium", "hard"]),
        score: z.number(),
        totalQuestions: z.number(),
        language: z.enum(["en", "es"]),
      }))
      .mutation(async ({ input }) => {
        const id = await saveGameScore(input);
        return { id };
      }),

    studentScores: publicProcedure
      .input(z.object({ studentName: z.string() }))
      .query(async ({ input }) => {
        return getStudentScores(input.studentName);
      }),

    publicProfile: publicProcedure
      .input(z.object({ studentName: z.string() }))
      .query(async ({ input }) => {
        return getStudentDetail(input.studentName);
      }),

    leaderboard: publicProcedure
      .input(z.object({
        gameType: z.string().optional(),
        language: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getLeaderboard(input?.gameType, input?.language);
      }),

    aiFeedback: publicProcedure
      .input(z.object({
        transcript: z.string().min(1),
        question: z.string().min(1),
        expectedAnswer: z.string().min(1),
        language: z.enum(["en", "es"]),
        isCorrect: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const { transcript, question, expectedAnswer, language, isCorrect } = input;
        const isEnglish = language === "en";

        const systemPrompt = isEnglish
          ? `You are an encouraging English language coach at a restaurant simulation app for Brazilian students. 
Give brief, warm feedback (2-3 sentences max) on the student's spoken response. 
Focus on: grammar accuracy, naturalness, vocabulary choice. 
If correct: celebrate and highlight what was great. 
If incorrect: gently point out the issue and give the correct form. 
Always end with a motivating tip or a more natural alternative phrase. 
Respond in English only. Be concise and friendly.`
          : `Eres un coach de español alentador en una app de simulación de restaurante para estudiantes brasileños. 
Da retroalimentación breve y cálida (máximo 2-3 oraciones) sobre la respuesta hablada del estudiante. 
Enfócate en: precisión gramatical, naturalidad, elección de vocabulario. 
Si es correcto: celebra y destaca lo que estuvo bien. 
Si es incorrecto: señala amablemente el problema y da la forma correcta. 
Siempre termina con un consejo motivador o una frase más natural. 
Responde solo en español. Sé conciso y amigable.`;

        const userMessage = isEnglish
          ? `Question asked: "${question}"
Expected answer: "${expectedAnswer}"
Student said: "${transcript}"
Result: ${isCorrect ? "Correct" : "Incorrect"}

Please give feedback on the student's response.`
          : `Pregunta hecha: "${question}"
Respuesta esperada: "${expectedAnswer}"
El estudiante dijo: "${transcript}"
Resultado: ${isCorrect ? "Correcto" : "Incorrecto"}

Por favor, da retroalimentación sobre la respuesta del estudiante.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          });
          const rawContent = response?.choices?.[0]?.message?.content;
          const feedback = typeof rawContent === "string" ? rawContent : "";
          return { feedback: feedback.trim() };
        } catch {
          return { feedback: isEnglish ? "Great effort! Keep practicing!" : "¡Buen esfuerzo! ¡Sigue practicando!" };
        }
      }),
  }),

  // ===== ADMIN ROUTES =====
  admin: router({
    orders: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getOrdersWithItems(input?.status);
      }),

    updateOrderStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "preparing", "ready", "delivered", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),

    updatePaymentStatus: adminProcedure
      .input(z.object({
        orderId: z.number(),
        paymentStatus: z.enum(["unpaid", "pending_verification", "paid", "refunded"]),
      }))
      .mutation(async ({ input }) => {
        await updateOrderPayment(input.orderId, { paymentStatus: input.paymentStatus });
        return { success: true };
      }),

    stats: adminProcedure.query(async () => {
      return getTodayOrderStats();
    }),

    allCategories: adminProcedure.query(async () => {
      return getAllCategories();
    }),

    allMenuItems: adminProcedure.query(async () => {
      return getAllMenuItems();
    }),

    toggleItemAvailability: adminProcedure
      .input(z.object({
        itemId: z.number(),
        available: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await toggleMenuItemAvailability(input.itemId, input.available);
        return { success: true };
      }),

    // Settings management
    getSettings: adminProcedure.query(async () => {
      return getAllSettings();
    }),

    updateSetting: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        await setSetting(input.key, input.value);
        return { success: true };
      }),
  }),

  // ===== PARTNER ROUTES (isolated per restaurant) =====
  partner: router({
    // Login sem OAuth - retorna JWT
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const user = await getPartnerUserByUsername(input.username);
        if (!user || !user.active) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }
        const expectedHash = hashPassword(input.password);
        if (user.passwordHash !== expectedHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }
        const token = signPartnerToken({
          id: user.id,
          restaurantId: user.restaurantId,
          role: user.role,
          username: user.username,
        });
        // Get restaurant info
        const allRestaurants = await getAllRestaurants();
        const restaurant = allRestaurants.find(r => r.id === user.restaurantId);
        return { token, user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role, restaurantId: user.restaurantId }, restaurant };
      }),

    // Get current partner info (validate token)
    me: partnerProcedure.query(async ({ ctx }) => {
      const partner = (ctx as any).partner;
      const allRestaurants = await getAllRestaurants();
      const restaurant = allRestaurants.find((r: any) => r.id === partner.restaurantId);
      return { partner, restaurant };
    }),

    // Get orders for this partner's restaurant only
    orders: partnerProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const partner = (ctx as any).partner;
        const restaurantId = partner.role === "master" ? undefined : partner.restaurantId;
        if (restaurantId) {
          return getOrdersByRestaurant(restaurantId, input?.status);
        }
        return getOrdersWithItems(input?.status);
      }),

    // Update order status (only own restaurant)
    updateOrderStatus: partnerProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "preparing", "ready", "delivered", "cancelled"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const partner = (ctx as any).partner;
        // Verify order belongs to this restaurant
        if (partner.role !== "master") {
          const restaurantOrders = await getOrdersByRestaurant(partner.restaurantId);
          const order = restaurantOrders.find((o: any) => o.id === input.orderId);
          if (!order) throw new TRPCError({ code: "FORBIDDEN", message: "Order not found in your restaurant" });
        }
        await updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),

    // Stats for this partner's restaurant
    stats: partnerProcedure.query(async ({ ctx }) => {
      const partner = (ctx as any).partner;
      return getRestaurantStats(partner.restaurantId);
    }),
  }),

  // ===== CONSULTANT ROUTES =====
  consultants: router({
    // Public: get active consultants for a restaurant (used in ExperienceFeedback)
    byRestaurant: publicProcedure
      .input(z.object({ restaurantId: z.number() }))
      .query(async ({ input }) => {
        return getConsultantsByRestaurant(input.restaurantId);
      }),

    // Partner: get all consultants (including inactive) for management
    list: partnerProcedure
      .query(async ({ ctx }) => {
        const partner = (ctx as any).partner;
        return getAllConsultantsByRestaurant(partner.restaurantId);
      }),

    // Partner: add a new consultant
    create: partnerProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        role: z.string().max(150).optional(),
        roleEs: z.string().max(150).optional(),
        whatsappNumber: z.string().min(8).max(30),
        avatarUrl: z.string().url().nullable().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const partner = (ctx as any).partner;
        const id = await createConsultant({
          restaurantId: partner.restaurantId,
          name: input.name,
          role: input.role ?? null,
          roleEs: input.roleEs ?? null,
          whatsappNumber: input.whatsappNumber,
          avatarUrl: input.avatarUrl ?? null,
          active: true,
          sortOrder: input.sortOrder ?? 0,
        });
        return { id };
      }),

    // Partner: update a consultant
    update: partnerProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        role: z.string().max(150).optional(),
        roleEs: z.string().max(150).optional(),
        whatsappNumber: z.string().min(8).max(30).optional(),
        avatarUrl: z.string().url().nullable().optional(),
        active: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const partner = (ctx as any).partner;
        // Verify consultant belongs to this restaurant
        const consultant = await getConsultantById(input.id);
        if (!consultant || (partner.role !== "master" && consultant.restaurantId !== partner.restaurantId)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Consultant not found in your restaurant" });
        }
        const { id, ...data } = input;
        await updateConsultant(id, data);
        return { success: true };
      }),

    // Partner: delete a consultant
    delete: partnerProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const partner = (ctx as any).partner;
        const consultant = await getConsultantById(input.id);
        if (!consultant || (partner.role !== "master" && consultant.restaurantId !== partner.restaurantId)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Consultant not found in your restaurant" });
        }
        await deleteConsultant(input.id);
        return { success: true };
      }),

    // Partner: upload avatar photo
    uploadAvatar: partnerProcedure
      .input(z.object({
        consultantId: z.number().optional(),
        imageBase64: z.string(),
        mimeType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ ctx, input }) => {
        const partner = (ctx as any).partner;
        const buffer = Buffer.from(input.imageBase64, "base64");
        const ext = input.mimeType.includes("png") ? "png" : "jpg";
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `consultant-avatars/r${partner.restaurantId}-${randomSuffix}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        // If consultantId provided, update the record immediately
        if (input.consultantId) {
          const consultant = await getConsultantById(input.consultantId);
          if (consultant && (partner.role === "master" || consultant.restaurantId === partner.restaurantId)) {
            await updateConsultant(input.consultantId, { avatarUrl: url });
          }
        }
        return { url };
      }),
  }),

  // ===== MASTER ROUTES (Estevão - sees all restaurants) =====
  master: router({
    // All restaurants with stats
    overview: masterProcedure.query(async () => {
      return getAllRestaurantsWithStats();
    }),

    // All orders across all restaurants
    allOrders: masterProcedure
      .input(z.object({ restaurantId: z.number().optional(), status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        if (input?.restaurantId) {
          return getOrdersByRestaurant(input.restaurantId, input.status);
        }
        return getOrdersWithItems(input?.status);
      }),

    // Leads with filters
    leads: masterProcedure
      .input(z.object({
        restaurantId: z.number().optional(),
        language: z.enum(["en", "es"]).optional(),
        interested: z.boolean().optional(),
        ratingMin: z.number().optional(),
        ratingMax: z.number().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getLeadsFiltered({
          restaurantId: input?.restaurantId,
          language: input?.language,
          interested: input?.interested,
          ratingMin: input?.ratingMin,
          ratingMax: input?.ratingMax,
          dateFrom: input?.dateFrom ? new Date(input.dateFrom) : undefined,
          dateTo: input?.dateTo ? new Date(input.dateTo) : undefined,
        });
      }),

    // Student progress
    studentProgress: masterProcedure
      .input(z.object({
        restaurantId: z.number().optional(),
        language: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getAllStudentProgress({
          restaurantId: input?.restaurantId,
          language: input?.language,
          dateFrom: input?.dateFrom ? new Date(input.dateFrom) : undefined,
          dateTo: input?.dateTo ? new Date(input.dateTo) : undefined,
        });
      }),

    // Student detail
    studentDetail: masterProcedure
      .input(z.object({
        studentName: z.string(),
        restaurantId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return getStudentDetail(input.studentName, input.restaurantId);
      }),
  }),
});

// ===== WHATSAPP NOTIFICATION HELPER =====

async function sendWhatsAppOrderNotification(orderId: number) {
  const whatsappNumber = await getSetting("whatsapp_number") || "5511947515284";
  const webhookUrl = await getSetting("webhook_url");

  // Get order details
  const allOrders = await getOrdersWithItems();
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  const tableName = order.table?.label || `Mesa ${order.tableId}`;
  const itemsList = order.items
    .map((item: any) => `  ${item.quantity}x ${item.namePt || item.nameEn} - R$ ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}`)
    .join("\n");

  const message = `🍽️ *NOVO PEDIDO #${orderId}*\n\n` +
    `👤 Aluno: ${order.studentName}\n` +
    `📍 ${tableName}\n` +
    `💰 Total: R$ ${parseFloat(order.totalAmount).toFixed(2)}\n\n` +
    `📋 *Itens:*\n${itemsList}\n\n` +
    `💳 Pagamento: ${order.paymentStatus === "pending_verification" ? "Comprovante enviado ✅" : "Pendente ⏳"}\n` +
    (order.paymentProofUrl ? `📎 Comprovante: ${order.paymentProofUrl}\n` : "") +
    (order.notes ? `📝 Obs: ${order.notes}\n` : "") +
    `\n⏰ ${new Date().toLocaleTimeString("pt-BR")}`;

  // If webhook URL is configured, send via webhook
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: whatsappNumber,
          message,
          orderId,
          orderData: {
            studentName: order.studentName,
            table: tableName,
            total: order.totalAmount,
            items: order.items,
            paymentStatus: order.paymentStatus,
            paymentProofUrl: order.paymentProofUrl,
          },
        }),
      });
      await markOrderWhatsappNotified(orderId);
    } catch (err) {
      console.error("[Webhook] Failed to send:", err);
    }
  }

  // Always notify the owner via Manus notification system
  await notifyOwner({
    title: `📱 Pedido #${orderId} - Comprovante Pix`,
    content: message,
  });

  await markOrderWhatsappNotified(orderId);
}

export type AppRouter = typeof appRouter;
