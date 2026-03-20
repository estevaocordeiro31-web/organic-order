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
} from "./db";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";

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
      const pixName = await getSetting("pix_name") || "Organic In The Box";
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

    leaderboard: publicProcedure
      .input(z.object({
        gameType: z.string().optional(),
        language: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getLeaderboard(input?.gameType, input?.language);
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
