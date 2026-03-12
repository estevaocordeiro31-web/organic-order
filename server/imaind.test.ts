import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { restaurants, restaurantStaff } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("ImAInd Multi-Tenant: Restaurants", () => {
  it("should have 4 restaurant partners in the database", async () => {
    const db = await getDb();
    if (!db) return; // skip if no DB connection in test env
    const result = await db.select().from(restaurants);
    expect(result.length).toBeGreaterThanOrEqual(4);
  });

  it("should have the Organic restaurant with slug 'organic'", async () => {
    const db = await getDb();
    if (!db) return;
    const result = await db.select().from(restaurants).where(eq(restaurants.slug, "organic"));
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Organic In The Box");
    expect(result[0].active).toBe(true);
  });

  it("should have Top Dog Brasil with slug 'topdog'", async () => {
    const db = await getDb();
    if (!db) return;
    const result = await db.select().from(restaurants).where(eq(restaurants.slug, "topdog"));
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Top Dog Brasil");
    expect(result[0].cuisineType).toBe("Cachorreria Prensada");
  });

  it("should have La Guapa with slug 'laguapa'", async () => {
    const db = await getDb();
    if (!db) return;
    const result = await db.select().from(restaurants).where(eq(restaurants.slug, "laguapa"));
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("La Guapa");
  });

  it("should have El Patron with slug 'elpatron'", async () => {
    const db = await getDb();
    if (!db) return;
    const result = await db.select().from(restaurants).where(eq(restaurants.slug, "elpatron"));
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("El Patron");
    expect(result[0].cuisineType).toBe("Comida Mexicana");
  });

  it("should have all restaurants with valid accent colors", async () => {
    const db = await getDb();
    if (!db) return;
    const result = await db.select().from(restaurants);
    for (const r of result) {
      if (r.accentColor) {
        expect(r.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  it("should have all restaurants with addresses", async () => {
    const db = await getDb();
    if (!db) return;
    const result = await db.select().from(restaurants);
    for (const r of result) {
      expect(r.address).toBeTruthy();
      expect(r.address).toContain("Jundiaí");
    }
  });
});

describe("ImAInd Multi-Tenant: Restaurant Staff Table", () => {
  it("should have the restaurant_staff table accessible", async () => {
    const db = await getDb();
    if (!db) return;
    // Just verify the table exists and is queryable
    const result = await db.select().from(restaurantStaff);
    expect(Array.isArray(result)).toBe(true);
  });
});
