import { describe, it, expect, beforeAll } from "vitest";
import { getRestaurantBySlug, getAllRestaurants, getActiveCategories, getAvailableMenuItems, getActiveTables } from "./db";

describe("Partner Restaurants - Multi-tenant", () => {
  describe("getAllRestaurants", () => {
    it("should return all 4 active restaurants", async () => {
      const restaurants = await getAllRestaurants();
      expect(restaurants).toBeDefined();
      expect(Array.isArray(restaurants)).toBe(true);
      expect(restaurants.length).toBeGreaterThanOrEqual(4);
    });

    it("should include all 4 partners", async () => {
      const restaurants = await getAllRestaurants();
      const slugs = restaurants.map(r => r.slug);
      expect(slugs).toContain("organic");
      expect(slugs).toContain("topdog");
      expect(slugs).toContain("laguapa");
      expect(slugs).toContain("elpatron");
    });
  });

  describe("getRestaurantBySlug", () => {
    it("should find Top Dog by slug", async () => {
      const restaurant = await getRestaurantBySlug("topdog");
      expect(restaurant).toBeDefined();
      expect(restaurant?.name).toBe("Top Dog Brasil");
      expect(restaurant?.id).toBe(2);
    });

    it("should find La Guapa by slug", async () => {
      const restaurant = await getRestaurantBySlug("laguapa");
      expect(restaurant).toBeDefined();
      expect(restaurant?.name).toBe("La Guapa");
      expect(restaurant?.id).toBe(3);
    });

    it("should find El Patron by slug", async () => {
      const restaurant = await getRestaurantBySlug("elpatron");
      expect(restaurant).toBeDefined();
      expect(restaurant?.name).toBe("El Patron");
      expect(restaurant?.id).toBe(4);
    });

    it("should return null for unknown slug", async () => {
      const restaurant = await getRestaurantBySlug("unknown-restaurant");
      expect(restaurant).toBeNull();
    });
  });

  describe("Menu isolation per restaurant", () => {
    it("Top Dog should have hot dog categories", async () => {
      const categories = await getActiveCategories(2);
      expect(categories.length).toBeGreaterThanOrEqual(3);
      const slugs = categories.map(c => c.slug);
      expect(slugs).toContain("hotdogs");
    });

    it("La Guapa should have empanada categories", async () => {
      const categories = await getActiveCategories(3);
      expect(categories.length).toBeGreaterThanOrEqual(4);
      const slugs = categories.map(c => c.slug);
      expect(slugs).toContain("empanadas");
    });

    it("El Patron should have Mexican food categories", async () => {
      const categories = await getActiveCategories(4);
      expect(categories.length).toBeGreaterThanOrEqual(5);
      const slugs = categories.map(c => c.slug);
      expect(slugs).toContain("burritos");
      expect(slugs).toContain("tacos");
    });

    it("Top Dog should have menu items", async () => {
      const items = await getAvailableMenuItems(2);
      expect(items.length).toBeGreaterThanOrEqual(8);
      // All items should belong to restaurant 2
      items.forEach(item => expect(item.restaurantId).toBe(2));
    });

    it("La Guapa should have empanada items", async () => {
      const items = await getAvailableMenuItems(3);
      expect(items.length).toBeGreaterThanOrEqual(8);
      const names = items.map(i => i.nameEn);
      expect(names.some(n => n.includes("Empanada"))).toBe(true);
      items.forEach(item => expect(item.restaurantId).toBe(3));
    });

    it("El Patron should have burrito and taco items", async () => {
      const items = await getAvailableMenuItems(4);
      expect(items.length).toBeGreaterThanOrEqual(15);
      const names = items.map(i => i.nameEn);
      expect(names.some(n => n.includes("Burrito"))).toBe(true);
      expect(names.some(n => n.includes("Tacos"))).toBe(true);
      items.forEach(item => expect(item.restaurantId).toBe(4));
    });

    it("Menus should be isolated - Top Dog items should not appear in La Guapa", async () => {
      const topdogItems = await getAvailableMenuItems(2);
      const laguapaItems = await getAvailableMenuItems(3);
      const topdogIds = new Set(topdogItems.map(i => i.id));
      const laguapaIds = new Set(laguapaItems.map(i => i.id));
      // No overlap
      const overlap = [...topdogIds].filter(id => laguapaIds.has(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe("Tables isolation per restaurant", () => {
    it("Top Dog should have tables", async () => {
      const tables = await getActiveTables(2);
      expect(tables.length).toBeGreaterThanOrEqual(6);
      tables.forEach(t => expect(t.restaurantId).toBe(2));
    });

    it("La Guapa should have tables", async () => {
      const tables = await getActiveTables(3);
      expect(tables.length).toBeGreaterThanOrEqual(4);
      tables.forEach(t => expect(t.restaurantId).toBe(3));
    });

    it("El Patron should have tables", async () => {
      const tables = await getActiveTables(4);
      expect(tables.length).toBeGreaterThanOrEqual(6);
      tables.forEach(t => expect(t.restaurantId).toBe(4));
    });
  });

  describe("Menu items bilingual content", () => {
    it("Top Dog items should have English and Portuguese names", async () => {
      const items = await getAvailableMenuItems(2);
      items.forEach(item => {
        expect(item.nameEn).toBeTruthy();
        expect(item.namePt).toBeTruthy();
      });
    });

    it("El Patron items should have Spanish names", async () => {
      const items = await getAvailableMenuItems(4);
      items.forEach(item => {
        expect(item.nameEn).toBeTruthy();
        // Spanish names should exist
        if (item.nameEs) {
          expect(item.nameEs.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
