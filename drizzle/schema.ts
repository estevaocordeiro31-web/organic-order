import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Restaurants (multi-tenant partners)
 */
export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  nameEs: varchar("nameEs", { length: 200 }),
  cuisineType: varchar("cuisineType", { length: 100 }),
  tagline: text("tagline"),
  address: varchar("address", { length: 300 }),
  themeColor: varchar("themeColor", { length: 20 }).default("#1a2e1a"),
  accentColor: varchar("accentColor", { length: 20 }).default("#4ade80"),
  logoUrl: text("logoUrl"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;

/**
 * Restaurant staff / characters
 */
export const restaurantStaff = mysqlTable("restaurant_staff", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }),
  characterName: varchar("characterName", { length: 100 }),
  avatarUrl: text("avatarUrl"),
  language: mysqlEnum("language", ["en", "es"]).default("en").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RestaurantStaff = typeof restaurantStaff.$inferSelect;
export type InsertRestaurantStaff = typeof restaurantStaff.$inferInsert;

/**
 * Menu categories (Coffees, Toasts, Salads, etc.)
 */
export const menuCategories = mysqlTable("menu_categories", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").default(1).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  namePt: varchar("namePt", { length: 100 }).notNull(),
  nameEs: varchar("nameEs", { length: 100 }),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = typeof menuCategories.$inferInsert;

/**
 * Menu items with English name/description and Portuguese name for reference
 */
export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").default(1).notNull(),
  categoryId: int("categoryId").notNull(),
  nameEn: varchar("nameEn", { length: 200 }).notNull(),
  namePt: varchar("namePt", { length: 200 }).notNull(),
  nameEs: varchar("nameEs", { length: 200 }),
  descriptionEn: text("descriptionEn"),
  descriptionPt: text("descriptionPt"),
  descriptionEs: text("descriptionEs"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  available: boolean("available").default(true).notNull(),
  tags: varchar("tags", { length: 255 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Tables in the garden area
 */
export const tables = mysqlTable("tables", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").default(1).notNull(),
  number: int("number").notNull(),
  label: varchar("label", { length: 50 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Table = typeof tables.$inferSelect;
export type InsertTable = typeof tables.$inferInsert;

/**
 * Orders placed by students
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").default(1).notNull(),
  tableId: int("tableId").notNull(),
  studentName: varchar("studentName", { length: 200 }).notNull(),
  status: mysqlEnum("status", ["pending", "preparing", "ready", "delivered", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  // Payment fields
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending_verification", "paid", "refunded"]).default("unpaid").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  paymentProofUrl: text("paymentProofUrl"),
  // WhatsApp notification
  whatsappNotified: boolean("whatsappNotified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Individual items within an order
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Ordering expressions / chunks for language exercises
 * Used in the gamified ordering experience
 */
export const orderingExpressions = mysqlTable("ordering_expressions", {
  id: int("id").autoincrement().primaryKey(),
  language: mysqlEnum("language", ["en", "es"]).default("en").notNull(),
  category: mysqlEnum("category", ["greeting", "ordering", "asking", "thanking", "paying", "special_request", "response"]).notNull(),
  expression: varchar("expression", { length: 500 }).notNull(),
  translation: varchar("translation", { length: 500 }).notNull(),
  chunks: text("chunks"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("easy").notNull(),
  context: varchar("context", { length: 255 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderingExpression = typeof orderingExpressions.$inferSelect;
export type InsertOrderingExpression = typeof orderingExpressions.$inferInsert;

/**
 * Student game progress / scores
 */
export const gameScores = mysqlTable("game_scores", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").default(1).notNull(),
  studentName: varchar("studentName", { length: 200 }).notNull(),
  tableId: int("tableId"),
  gameType: mysqlEnum("gameType", ["voice_order", "phrase_builder", "qa_simulation"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("easy").notNull(),
  score: int("score").default(0).notNull(),
  totalQuestions: int("totalQuestions").default(0).notNull(),
  language: mysqlEnum("language", ["en", "es"]).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = typeof gameScores.$inferInsert;

/**
 * Partner users - login exclusivo por restaurante (sem OAuth)
 */
export const partnerUsers = mysqlTable("partner_users", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 200 }).notNull(),
  role: mysqlEnum("role", ["partner", "master"]).default("partner").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerUser = typeof partnerUsers.$inferSelect;
export type InsertPartnerUser = typeof partnerUsers.$inferInsert;

/**
 * App settings (Pix key, webhook URL, WhatsApp number, etc.)
 */
export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;

/**
 * Leads - captação de interessados inFlux via ImAInd
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  language: mysqlEnum("language", ["en", "es"]).default("en").notNull(),
  rating: int("rating"),
  interested: boolean("interested").default(false).notNull(),
  name: varchar("name", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  consultant: mysqlEnum("consultant", ["lucas", "vicky"]),
  consultantId: int("consultantId"),
  consultantName: varchar("consultantName", { length: 100 }),
  consultantWhatsapp: varchar("consultantWhatsapp", { length: 30 }),
  restaurantName: varchar("restaurantName", { length: 200 }),
  notified: boolean("notified").default(false).notNull(),
  consultantNotified: boolean("consultantNotified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Partner consultants - configurable per restaurant
 * Each partner can set their own consultants (name, role, photo, WhatsApp)
 * that appear in the ExperienceFeedback screen instead of the default Lucas & Vicky
 */
export const partnerConsultants = mysqlTable("partner_consultants", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 150 }),
  roleEs: varchar("roleEs", { length: 150 }),
  avatarUrl: text("avatarUrl"),
  whatsappNumber: varchar("whatsappNumber", { length: 30 }).notNull(),
  active: boolean("active").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerConsultant = typeof partnerConsultants.$inferSelect;
export type InsertPartnerConsultant = typeof partnerConsultants.$inferInsert;
