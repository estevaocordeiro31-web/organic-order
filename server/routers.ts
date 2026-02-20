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
} from "./db";
import { notifyOwner } from "./_core/notification";

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

  // ===== PUBLIC MENU ROUTES =====
  menu: router({
    categories: publicProcedure.query(async () => {
      return getActiveCategories();
    }),

    items: publicProcedure.query(async () => {
      return getAvailableMenuItems();
    }),

    itemsByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return getMenuItemsByCategory(input.categoryId);
      }),

    tables: publicProcedure.query(async () => {
      return getActiveTables();
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
  }),
});

export type AppRouter = typeof appRouter;
