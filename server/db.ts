import { eq, asc, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, menuCategories, menuItems, orders, orderItems, tables, orderingExpressions, gameScores, appSettings, restaurants, partnerUsers, partnerConsultants, InsertPartnerConsultant, leads } from "../drizzle/schema";
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
  // For JWT-based auth, openId can be empty (use email as identifier)
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }
  
  // Generate openId from email if not provided
  if (!user.openId && user.email) {
    user.openId = `email:${user.email}`;
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

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { eq } = await import('drizzle-orm');
    const result = await db.select().from(users).where(
      eq(users.email, email)
    ).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get user by email:", error);
    return null;
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

export async function getActiveCategories(restaurantId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (restaurantId) {
    return db.select().from(menuCategories)
      .where(and(eq(menuCategories.active, true), eq(menuCategories.restaurantId, restaurantId)))
      .orderBy(asc(menuCategories.sortOrder));
  }
  return db.select().from(menuCategories).where(eq(menuCategories.active, true)).orderBy(asc(menuCategories.sortOrder));
}

export async function getAllCategories(restaurantId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (restaurantId) {
    return db.select().from(menuCategories)
      .where(eq(menuCategories.restaurantId, restaurantId))
      .orderBy(asc(menuCategories.sortOrder));
  }
  return db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder));
}

// ===== MENU ITEMS =====

export async function getAvailableMenuItems(restaurantId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (restaurantId) {
    return db.select().from(menuItems)
      .where(and(eq(menuItems.available, true), eq(menuItems.restaurantId, restaurantId)))
      .orderBy(asc(menuItems.sortOrder));
  }
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

export async function getActiveTables(restaurantId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (restaurantId) {
    return db.select().from(tables)
      .where(and(eq(tables.active, true), eq(tables.restaurantId, restaurantId)))
      .orderBy(asc(tables.number));
  }
  return db.select().from(tables).where(eq(tables.active, true)).orderBy(asc(tables.number));
}

export async function getRestaurantBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(restaurants).where(and(eq(restaurants.slug, slug), eq(restaurants.active, true))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllRestaurants() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(restaurants).where(eq(restaurants.active, true));
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

export async function getLeaderboard(gameType?: string, language?: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all scores and aggregate in JS for flexibility
  const allScores = await db.select().from(gameScores).orderBy(desc(gameScores.createdAt));
  
  // Filter if needed
  let filtered = allScores;
  if (gameType && gameType !== 'all') {
    filtered = filtered.filter(s => s.gameType === gameType);
  }
  if (language && language !== 'all') {
    filtered = filtered.filter(s => s.language === language);
  }
  
  // Aggregate by student
  const studentMap = new Map<string, { studentName: string; totalScore: number; totalQuestions: number; gamesPlayed: number; bestPercentage: number }>();
  
  for (const score of filtered) {
    const existing = studentMap.get(score.studentName) || {
      studentName: score.studentName,
      totalScore: 0,
      totalQuestions: 0,
      gamesPlayed: 0,
      bestPercentage: 0,
    };
    existing.totalScore += score.score;
    existing.totalQuestions += score.totalQuestions;
    existing.gamesPlayed += 1;
    const pct = score.totalQuestions > 0 ? Math.round((score.score / score.totalQuestions) * 100) : 0;
    if (pct > existing.bestPercentage) existing.bestPercentage = pct;
    studentMap.set(score.studentName, existing);
  }
  
  return Array.from(studentMap.values())
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 50);
}

// ===== PAYMENT & SETTINGS =====

export async function updateOrderPayment(orderId: number, data: {
  paymentStatus: "unpaid" | "pending_verification" | "paid" | "refunded";
  paymentMethod?: string;
  paymentProofUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(data).where(eq(orders.id, orderId));
}

export async function markOrderWhatsappNotified(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ whatsappNotified: true }).where(eq(orders.id, orderId));
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appSettings).where(eq(appSettings.settingKey, key)).limit(1);
  return result.length > 0 ? (result[0].settingValue ?? null) : null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appSettings).values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appSettings);
}

// ===== PARTNER USERS =====

export async function createPartnerUser(data: {
  restaurantId: number;
  username: string;
  passwordHash: string;
  displayName: string;
  role?: "partner" | "master";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(partnerUsers).values(data).$returningId();
  return result.id;
}

export async function getPartnerUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(partnerUsers).where(eq(partnerUsers.username, username)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPartnerUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(partnerUsers).where(eq(partnerUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getOrdersByRestaurant(restaurantId: number, statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];

  let query;
  if (statusFilter && statusFilter !== "all") {
    query = db.select().from(orders)
      .where(and(
        eq(orders.restaurantId, restaurantId),
        eq(orders.status, statusFilter as any)
      ))
      .orderBy(desc(orders.createdAt));
  } else {
    query = db.select().from(orders)
      .where(eq(orders.restaurantId, restaurantId))
      .orderBy(desc(orders.createdAt));
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
    const tableInfo = await db.select().from(tables).where(eq(tables.id, order.tableId)).limit(1);
    result.push({ ...order, table: tableInfo[0] || null, items });
  }
  return result;
}

export async function getRestaurantStats(restaurantId: number) {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, preparing: 0, ready: 0, delivered: 0, revenue: 0 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allOrders = await db.select().from(orders).where(eq(orders.restaurantId, restaurantId));
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

export async function getAllRestaurantsWithStats() {
  const db = await getDb();
  if (!db) return [];
  const allRestaurants = await db.select().from(restaurants).where(eq(restaurants.active, true));
  const result = [];
  for (const restaurant of allRestaurants) {
    const stats = await getRestaurantStats(restaurant.id);
    result.push({ ...restaurant, stats });
  }
  return result;
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

// ===== PARTNER CONSULTANTS =====

export async function getConsultantsByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnerConsultants)
    .where(and(eq(partnerConsultants.restaurantId, restaurantId), eq(partnerConsultants.active, true)))
    .orderBy(asc(partnerConsultants.sortOrder));
}

export async function getAllConsultantsByRestaurant(restaurantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnerConsultants)
    .where(eq(partnerConsultants.restaurantId, restaurantId))
    .orderBy(asc(partnerConsultants.sortOrder));
}

export async function createConsultant(data: InsertPartnerConsultant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(partnerConsultants).values(data).$returningId();
  return result.id;
}

export async function updateConsultant(id: number, data: Partial<{
  name: string;
  role: string;
  roleEs: string;
  avatarUrl: string | null;
  whatsappNumber: string;
  active: boolean;
  sortOrder: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(partnerConsultants).set(data).where(eq(partnerConsultants.id, id));
}

export async function deleteConsultant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(partnerConsultants).where(eq(partnerConsultants.id, id));
}

export async function getConsultantById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(partnerConsultants).where(eq(partnerConsultants.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ===== LEADS (MASTER) =====

export async function getLeadsFiltered(filters?: {
  restaurantId?: number;
  language?: "en" | "es";
  interested?: boolean;
  ratingMin?: number;
  ratingMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const db = await getDb();
  if (!db) return [];
  const all = await db.select().from(leads).orderBy(desc(leads.createdAt));
  let result = all;
  if (filters?.restaurantId) result = result.filter(l => l.restaurantId === filters.restaurantId);
  if (filters?.language) result = result.filter(l => l.language === filters.language);
  if (filters?.interested !== undefined) result = result.filter(l => l.interested === filters.interested);
  if (filters?.ratingMin !== undefined) result = result.filter(l => l.rating !== null && l.rating! >= filters.ratingMin!);
  if (filters?.ratingMax !== undefined) result = result.filter(l => l.rating !== null && l.rating! <= filters.ratingMax!);
  if (filters?.dateFrom) result = result.filter(l => new Date(l.createdAt) >= filters.dateFrom!);
  if (filters?.dateTo) result = result.filter(l => new Date(l.createdAt) <= filters.dateTo!);
  return result;
}

// ===== STUDENT PROGRESS (MASTER) =====

export async function getAllStudentProgress(filters?: {
  restaurantId?: number;
  language?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const db = await getDb();
  if (!db) return [];
  const all = await db.select().from(gameScores).orderBy(desc(gameScores.createdAt));
  let filtered = all;
  if (filters?.restaurantId) filtered = filtered.filter(s => s.restaurantId === filters.restaurantId);
  if (filters?.language && filters.language !== "all") filtered = filtered.filter(s => s.language === filters.language);
  if (filters?.dateFrom) filtered = filtered.filter(s => new Date(s.createdAt) >= filters.dateFrom!);
  if (filters?.dateTo) filtered = filtered.filter(s => new Date(s.createdAt) <= filters.dateTo!);

  // Aggregate by student
  const studentMap = new Map<string, {
    studentName: string;
    restaurantId: number;
    totalXP: number;
    gamesPlayed: number;
    voiceOrderCount: number;
    qaSimulationCount: number;
    phraseBuilderCount: number;
    avgAccuracy: number;
    lastActivity: Date;
    sessions: typeof all;
  }>();

  for (const score of filtered) {
    const key = `${score.studentName}:${score.restaurantId}`;
    const existing = studentMap.get(key) || {
      studentName: score.studentName,
      restaurantId: score.restaurantId,
      totalXP: 0,
      gamesPlayed: 0,
      voiceOrderCount: 0,
      qaSimulationCount: 0,
      phraseBuilderCount: 0,
      avgAccuracy: 0,
      lastActivity: new Date(score.createdAt),
      sessions: [] as typeof all,
    };
    existing.totalXP += score.score;
    existing.gamesPlayed += 1;
    if (score.gameType === "voice_order") existing.voiceOrderCount += 1;
    if (score.gameType === "qa_simulation") existing.qaSimulationCount += 1;
    if (score.gameType === "phrase_builder") existing.phraseBuilderCount += 1;
    if (new Date(score.createdAt) > existing.lastActivity) existing.lastActivity = new Date(score.createdAt);
    existing.sessions.push(score);
    studentMap.set(key, existing);
  }

  // Calculate avg accuracy per student
  Array.from(studentMap.values()).forEach((student) => {
    const totalQ = student.sessions.reduce((s: number, r: { totalQuestions: number }) => s + r.totalQuestions, 0);
    const totalS = student.sessions.reduce((s: number, r: { score: number }) => s + r.score, 0);
    student.avgAccuracy = totalQ > 0 ? Math.round((totalS / totalQ) * 100) : 0;
  });

  return Array.from(studentMap.values()).sort((a, b) => b.totalXP - a.totalXP);
}

export async function getStudentDetail(studentName: string, restaurantId?: number) {
  const db = await getDb();
  if (!db) return null;
  let all = await db.select().from(gameScores)
    .where(eq(gameScores.studentName, studentName))
    .orderBy(asc(gameScores.createdAt));
  if (restaurantId) all = all.filter(s => s.restaurantId === restaurantId);

  const byType = {
    voice_order: all.filter(s => s.gameType === "voice_order"),
    qa_simulation: all.filter(s => s.gameType === "qa_simulation"),
    phrase_builder: all.filter(s => s.gameType === "phrase_builder"),
  };

  // XP over time (daily buckets)
  const xpByDay: Record<string, number> = {};
  for (const s of all) {
    const day = new Date(s.createdAt).toISOString().split("T")[0];
    xpByDay[day] = (xpByDay[day] || 0) + s.score;
  }

  return {
    studentName,
    sessions: all,
    byType,
    xpByDay,
    totalXP: all.reduce((s, r) => s + r.score, 0),
    totalGames: all.length,
    avgAccuracy: all.length > 0
      ? Math.round(all.reduce((s, r) => s + (r.totalQuestions > 0 ? r.score / r.totalQuestions : 0), 0) / all.length * 100)
      : 0,
  };
}
