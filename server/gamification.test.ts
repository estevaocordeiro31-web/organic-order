import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

function createAuthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "test-admin",
      email: "admin@test.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("menu routes", () => {
  it("returns categories list", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const categories = await caller.menu.categories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    if (categories.length > 0) {
      expect(categories[0]).toHaveProperty("id");
      expect(categories[0]).toHaveProperty("nameEn");
    }
  });

  it("returns menu items", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const items = await caller.menu.items();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    if (items.length > 0) {
      expect(items[0]).toHaveProperty("id");
      expect(items[0]).toHaveProperty("nameEn");
      expect(items[0]).toHaveProperty("price");
      expect(items[0]).toHaveProperty("categoryId");
    }
  });

  it("returns tables list", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const tables = await caller.menu.tables();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);
    if (tables.length > 0) {
      expect(tables[0]).toHaveProperty("id");
      expect(tables[0]).toHaveProperty("number");
    }
  });
});

describe("expressions routes", () => {
  it("returns expressions for English", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const expressions = await caller.expressions.byLanguage({ language: "en" });
    expect(Array.isArray(expressions)).toBe(true);
    expect(expressions.length).toBeGreaterThan(0);
    if (expressions.length > 0) {
      expect(expressions[0]).toHaveProperty("id");
      expect(expressions[0]).toHaveProperty("expression");
      expect(expressions[0]).toHaveProperty("chunks");
      expect(expressions[0]).toHaveProperty("difficulty");
      expect(expressions[0].language).toBe("en");
    }
  });

  it("returns expressions for Spanish", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const expressions = await caller.expressions.byLanguage({ language: "es" });
    expect(Array.isArray(expressions)).toBe(true);
    expect(expressions.length).toBeGreaterThan(0);
    if (expressions.length > 0) {
      expect(expressions[0].language).toBe("es");
    }
  });

  it("filters expressions by difficulty", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const easyExpressions = await caller.expressions.byLanguage({
      language: "en",
      difficulty: "easy",
    });
    expect(Array.isArray(easyExpressions)).toBe(true);
    if (easyExpressions.length > 0) {
      expect(easyExpressions.every((e: any) => e.difficulty === "easy")).toBe(true);
    }
  });
});

describe("order routes", () => {
  it("creates an order successfully", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Get a menu item first
    const items = await caller.menu.items();
    expect(items.length).toBeGreaterThan(0);

    const order = await caller.order.create({
      tableId: 1,
      studentName: "Test Student",
      items: [{ menuItemId: items[0].id, quantity: 1, unitPrice: items[0].price }],
    });

    expect(order).toHaveProperty("orderId");
    expect(typeof order.orderId).toBe("number");
  });

  it("retrieves order status", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Create an order first
    const items = await caller.menu.items();
    const { orderId } = await caller.order.create({
      tableId: 2,
      studentName: "Status Test",
      items: [{ menuItemId: items[0].id, quantity: 2, unitPrice: items[0].price }],
    });

    const status = await caller.order.status({ orderId });
    expect(status).toHaveProperty("id");
    expect(status).toHaveProperty("status");
    expect(status).toHaveProperty("studentName");
    expect(status!.studentName).toBe("Status Test");
    expect(status!.status).toBe("pending");
  });
});

describe("admin routes", () => {
  it("lists all orders for admin", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const orders = await caller.admin.orders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it("updates order status", async () => {
    const { ctx: publicCtx } = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);

    // Create an order
    const items = await publicCaller.menu.items();
    const { orderId } = await publicCaller.order.create({
      tableId: 3,
      studentName: "Admin Test",
      items: [{ menuItemId: items[0].id, quantity: 1, unitPrice: items[0].price }],
    });

    // Update as admin
    const { ctx: adminCtx } = createAuthContext();
    const adminCaller = appRouter.createCaller(adminCtx);
    const result = await adminCaller.admin.updateOrderStatus({
      orderId,
      status: "preparing",
    });
    expect(result.success).toBe(true);

    // Verify status changed
    const status = await publicCaller.order.status({ orderId });
    expect(status!.status).toBe("preparing");
  });
});

describe("game routes", () => {
  it("saves a game score", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.game.saveScore({
      studentName: "Test Student",
      gameType: "phrase_builder",
      difficulty: "easy",
      score: 8,
      totalQuestions: 10,
      language: "en",
    });
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("retrieves student scores", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Save a score first
    await caller.game.saveScore({
      studentName: "Score Test",
      gameType: "voice_order",
      difficulty: "medium",
      score: 5,
      totalQuestions: 8,
      language: "en",
    });

    const scores = await caller.game.studentScores({ studentName: "Score Test" });
    expect(Array.isArray(scores)).toBe(true);
    expect(scores.length).toBeGreaterThan(0);
  });

  it("retrieves leaderboard", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Save some scores first
    await caller.game.saveScore({
      studentName: "Leader 1",
      gameType: "phrase_builder",
      difficulty: "easy",
      score: 10,
      totalQuestions: 10,
      language: "en",
    });
    await caller.game.saveScore({
      studentName: "Leader 2",
      gameType: "voice_order",
      difficulty: "medium",
      score: 7,
      totalQuestions: 10,
      language: "en",
    });

    const leaderboard = await caller.game.leaderboard({ language: "en" });
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeGreaterThan(0);
    if (leaderboard.length > 0) {
      expect(leaderboard[0]).toHaveProperty("studentName");
      expect(leaderboard[0]).toHaveProperty("totalScore");
      expect(leaderboard[0]).toHaveProperty("totalQuestions");
      expect(leaderboard[0]).toHaveProperty("gamesPlayed");
      expect(leaderboard[0]).toHaveProperty("bestPercentage");
    }
  });
});
