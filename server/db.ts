import { eq, asc, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, menuCategories, menuItems, orders, orderItems, tables, orderingExpressions, gameScores } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== MENU CATEGORIES =====

export async function getActiveCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuCategories).where(eq(menuCategories.active, true)).orderBy(asc(menuCategories.sortOrder));
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder));
}

// ===== MENU ITEMS =====

export async function getAvailableMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.available, true)).orderBy(asc(menuItems.sortOrder));
}

export async function getAllMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));
}

export async function getMenuItemsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems)
    .where(and(eq(menuItems.categoryId, categoryId), eq(menuItems.available, true)))
    .orderBy(asc(menuItems.sortOrder));
}

export async function toggleMenuItemAvailability(itemId: number, available: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(menuItems).set({ available }).where(eq(menuItems.id, itemId));
}

// ===== TABLES =====

export async function getActiveTables() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tables).where(eq(tables.active, true)).orderBy(asc(tables.number));
}

// ===== ORDERS =====

export async function createOrder(data: {
  tableId: number;
  studentName: string;
  totalAmount: string;
  notes?: string;
  items: { menuItemId: number; quantity: number; unitPrice: string; notes?: string }[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [orderResult] = await db.insert(orders).values({
    tableId: data.tableId,
    studentName: data.studentName,
    totalAmount: data.totalAmount,
    notes: data.notes || null,
    status: "pending",
  }).$returningId();

  const orderId = orderResult.id;

  for (const item of data.items) {
    await db.insert(orderItems).values({
      orderId,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      notes: item.notes || null,
    });
  }

  return orderId;
}

export async function getOrdersWithItems(statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];

  let query;
  if (statusFilter && statusFilter !== "all") {
    query = db.select().from(orders)
      .where(eq(orders.status, statusFilter as any))
      .orderBy(desc(orders.createdAt));
  } else {
    query = db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  const orderList = await query;

  const result = [];
  for (const order of orderList) {
    const items = await db.select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      notes: orderItems.notes,
      menuItemId: orderItems.menuItemId,
      nameEn: menuItems.nameEn,
      namePt: menuItems.namePt,
    })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, order.id));

    // Get table info
    const tableInfo = await db.select().from(tables).where(eq(tables.id, order.tableId)).limit(1);

    result.push({
      ...order,
      table: tableInfo[0] || null,
      items,
    });
  }

  return result;
}

export async function updateOrderStatus(orderId: number, status: "pending" | "preparing" | "ready" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}

// ===== ORDERING EXPRESSIONS =====

export async function getExpressionsByLanguage(language: "en" | "es", difficulty?: "easy" | "medium" | "hard") {
  const db = await getDb();
  if (!db) return [];
  if (difficulty) {
    return db.select().from(orderingExpressions)
      .where(and(
        eq(orderingExpressions.language, language),
        eq(orderingExpressions.difficulty, difficulty),
        eq(orderingExpressions.active, true)
      ))
      .orderBy(asc(orderingExpressions.sortOrder));
  }
  return db.select().from(orderingExpressions)
    .where(and(
      eq(orderingExpressions.language, language),
      eq(orderingExpressions.active, true)
    ))
    .orderBy(asc(orderingExpressions.sortOrder));
}

export async function getExpressionsByCategory(language: "en" | "es", category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderingExpressions)
    .where(and(
      eq(orderingExpressions.language, language),
      eq(orderingExpressions.category, category as any),
      eq(orderingExpressions.active, true)
    ))
    .orderBy(asc(orderingExpressions.sortOrder));
}

// ===== GAME SCORES =====

export async function saveGameScore(data: {
  studentName: string;
  tableId?: number;
  gameType: "voice_order" | "phrase_builder" | "qa_simulation";
  difficulty: "easy" | "medium" | "hard";
  score: number;
  totalQuestions: number;
  language: "en" | "es";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(gameScores).values(data).$returningId();
  return result.id;
}

export async function getStudentScores(studentName: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gameScores)
    .where(eq(gameScores.studentName, studentName))
    .orderBy(desc(gameScores.createdAt));
}

export async function getTodayOrderStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, preparing: 0, ready: 0, delivered: 0, revenue: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allOrders = await db.select().from(orders);
  const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);

  return {
    total: todayOrders.length,
    pending: todayOrders.filter(o => o.status === "pending").length,
    preparing: todayOrders.filter(o => o.status === "preparing").length,
    ready: todayOrders.filter(o => o.status === "ready").length,
    delivered: todayOrders.filter(o => o.status === "delivered").length,
    revenue: todayOrders.filter(o => o.status === "delivered").reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
  };
}
