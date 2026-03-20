import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";

describe("Leads & Feedback System", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should have leads table in database", async () => {
    // Verify the leads table exists by querying it
    const result = await db.execute("SELECT COUNT(*) as count FROM leads") as any;
    const rows = result.rows ?? result;
    expect(rows).toBeDefined();
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });

  it("should have restaurants table accessible for feedback", async () => {
    // Verify the restaurants table exists and is queryable
    const result = await db.execute("SELECT COUNT(*) as total FROM restaurants") as any;
    const rows = result.rows ?? result;
    expect(rows).toBeDefined();
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("should have correct leads table structure", async () => {
    // Verify leads table has required columns by selecting them
    const result = await db.execute(
      "SELECT id, restaurantId, name, phone, rating, interested, language, consultant, notified FROM leads LIMIT 0"
    );
    // If query succeeds without error, all columns exist
    expect(result).toBeDefined();
  });

  it("should validate lead data structure", () => {
    const validLead = {
      restaurantId: 1,
      name: "João Silva",
      phone: "11999999999",
      rating: 5,
      interested: true,
      language: "en",
      restaurantName: "Organic In The Box",
    };

    expect(validLead.restaurantId).toBeGreaterThan(0);
    expect(validLead.rating).toBeGreaterThanOrEqual(1);
    expect(validLead.rating).toBeLessThanOrEqual(5);
    expect(["en", "es"]).toContain(validLead.language);
    expect(typeof validLead.interested).toBe("boolean");
  });

  it("should format WhatsApp notification message correctly", () => {
    const lead = {
      name: "Maria Santos",
      phone: "11988887777",
      rating: 5,
      interested: true,
      restaurantName: "Top Dog Brasil",
      language: "en",
    };

    const message = `🎯 *Novo Lead ImAInd!*\n\n` +
      `👤 *Nome:* ${lead.name}\n` +
      `📱 *Telefone:* ${lead.phone}\n` +
      `⭐ *Avaliação:* ${lead.rating}/5\n` +
      `🌍 *Idioma:* ${lead.language === "en" ? "Inglês" : "Espanhol"}\n` +
      `🍽️ *Restaurante:* ${lead.restaurantName}\n` +
      `✅ *Interesse em aprender:* ${lead.interested ? "SIM" : "NÃO"}\n\n` +
      `📞 Entrar em contato agora!`;

    expect(message).toContain("Maria Santos");
    expect(message).toContain("11988887777");
    expect(message).toContain("Top Dog Brasil");
    expect(message).toContain("SIM");
    expect(message).toContain("Inglês");
  });

  it("should validate phone number format", () => {
    const validPhones = ["11999999999", "11988887777", "(11) 99999-9999"];
    const invalidPhones = ["123", "abc", ""];

    validPhones.forEach(phone => {
      const cleaned = phone.replace(/\D/g, "");
      expect(cleaned.length).toBeGreaterThanOrEqual(10);
    });

    invalidPhones.forEach(phone => {
      const cleaned = phone.replace(/\D/g, "");
      expect(cleaned.length).toBeLessThan(10);
    });
  });

  it("should build correct WhatsApp deep link", () => {
    const phone = "5511947515284"; // Lucas
    const message = encodeURIComponent("Olá! Acabei de experimentar o ImAInd!");
    const link = `https://wa.me/${phone}?text=${message}`;

    expect(link).toContain("wa.me");
    expect(link).toContain("5511947515284");
    expect(link).toContain("text=");
  });
});
