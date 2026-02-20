import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@organic.com",
    name: "Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "student@influx.com",
    name: "Student",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("menu routes (public)", () => {
  it("returns categories list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const categories = await caller.menu.categories();
    expect(Array.isArray(categories)).toBe(true);
    // Should have seeded categories
    expect(categories.length).toBeGreaterThan(0);
    // Each category should have required fields
    const cat = categories[0];
    expect(cat).toHaveProperty("id");
    expect(cat).toHaveProperty("nameEn");
    expect(cat).toHaveProperty("namePt");
  });

  it("returns menu items list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const items = await caller.menu.items();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    const item = items[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("nameEn");
    expect(item).toHaveProperty("namePt");
    expect(item).toHaveProperty("price");
    expect(item).toHaveProperty("categoryId");
  });

  it("returns items filtered by category", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const categories = await caller.menu.categories();
    const firstCatId = categories[0].id;
    const items = await caller.menu.itemsByCategory({ categoryId: firstCatId });
    expect(Array.isArray(items)).toBe(true);
    // All items should belong to the requested category
    items.forEach((item) => {
      expect(item.categoryId).toBe(firstCatId);
    });
  });

  it("returns tables list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const tables = await caller.menu.tables();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBe(10);
    const table = tables[0];
    expect(table).toHaveProperty("id");
    expect(table).toHaveProperty("number");
  });
});

describe("order routes (public)", () => {
  it("creates an order successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Get items and tables to create a valid order
    const items = await caller.menu.items();
    const tables = await caller.menu.tables();

    const result = await caller.order.create({
      tableId: tables[0].id,
      studentName: "Test Student",
      items: [
        {
          menuItemId: items[0].id,
          quantity: 2,
          unitPrice: items[0].price,
        },
      ],
    });

    expect(result).toHaveProperty("orderId");
    expect(result).toHaveProperty("totalAmount");
    expect(typeof result.orderId).toBe("number");
    expect(parseFloat(result.totalAmount)).toBeGreaterThan(0);
  });

  it("rejects order with no items", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const tables = await caller.menu.tables();

    await expect(
      caller.order.create({
        tableId: tables[0].id,
        studentName: "Test Student",
        items: [],
      })
    ).rejects.toThrow();
  });

  it("rejects order with empty student name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const items = await caller.menu.items();
    const tables = await caller.menu.tables();

    await expect(
      caller.order.create({
        tableId: tables[0].id,
        studentName: "",
        items: [
          {
            menuItemId: items[0].id,
            quantity: 1,
            unitPrice: items[0].price,
          },
        ],
      })
    ).rejects.toThrow();
  });

  it("retrieves order status after creation", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const items = await caller.menu.items();
    const tables = await caller.menu.tables();

    const { orderId } = await caller.order.create({
      tableId: tables[0].id,
      studentName: "Status Test Student",
      items: [
        {
          menuItemId: items[0].id,
          quantity: 1,
          unitPrice: items[0].price,
        },
      ],
    });

    const order = await caller.order.status({ orderId });
    expect(order).toHaveProperty("id", orderId);
    expect(order).toHaveProperty("status", "pending");
    expect(order).toHaveProperty("studentName", "Status Test Student");
    expect(order.items.length).toBe(1);
  });
});

describe("admin routes (protected)", () => {
  it("rejects non-admin users from accessing orders", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.orders({})).rejects.toThrow("FORBIDDEN");
  });

  it("rejects unauthenticated users from accessing orders", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.orders({})).rejects.toThrow();
  });

  it("allows admin to list orders", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.admin.orders({});
    expect(Array.isArray(orders)).toBe(true);
  });

  it("allows admin to get stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.admin.stats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("pending");
    expect(stats).toHaveProperty("preparing");
    expect(stats).toHaveProperty("ready");
    expect(stats).toHaveProperty("delivered");
    expect(stats).toHaveProperty("revenue");
  });

  it("allows admin to update order status", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const items = await publicCaller.menu.items();
    const tables = await publicCaller.menu.tables();

    // Create an order first
    const { orderId } = await publicCaller.order.create({
      tableId: tables[0].id,
      studentName: "Admin Test",
      items: [
        {
          menuItemId: items[0].id,
          quantity: 1,
          unitPrice: items[0].price,
        },
      ],
    });

    // Admin updates status
    const adminCtx = createAdminContext();
    const adminCaller = appRouter.createCaller(adminCtx);

    const result = await adminCaller.admin.updateOrderStatus({
      orderId,
      status: "preparing",
    });
    expect(result).toEqual({ success: true });

    // Verify status changed
    const order = await publicCaller.order.status({ orderId });
    expect(order.status).toBe("preparing");
  });

  it("allows admin to list all menu items", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.admin.allMenuItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it("allows admin to toggle item availability", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.admin.allMenuItems();
    const firstItem = items[0];

    const result = await caller.admin.toggleItemAvailability({
      itemId: firstItem.id,
      available: false,
    });
    expect(result).toEqual({ success: true });

    // Restore availability
    await caller.admin.toggleItemAvailability({
      itemId: firstItem.id,
      available: true,
    });
  });
});
