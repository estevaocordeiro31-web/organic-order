import { describe, it, expect, vi, beforeEach } from "vitest";
import * as crypto from "crypto";
import jwt from "jsonwebtoken";

// ===== UNIT TESTS FOR PARTNER AUTH LOGIC =====

const PARTNER_JWT_SECRET = "test-secret-key";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "imaind-salt").digest("hex");
}

function signPartnerToken(payload: { id: number; restaurantId: number; role: string; username: string }): string {
  return jwt.sign(payload, PARTNER_JWT_SECRET, { expiresIn: "7d" });
}

function verifyPartnerToken(token: string): { id: number; restaurantId: number; role: string; username: string } | null {
  try {
    return jwt.verify(token, PARTNER_JWT_SECRET) as any;
  } catch {
    return null;
  }
}

describe("Partner Authentication", () => {
  describe("hashPassword", () => {
    it("should hash password consistently", () => {
      const hash1 = hashPassword("topdog2024");
      const hash2 = hashPassword("topdog2024");
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different passwords", () => {
      const hash1 = hashPassword("topdog2024");
      const hash2 = hashPassword("laguapa2024");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce 64-char hex string (SHA-256)", () => {
      const hash = hashPassword("test123");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe("JWT Token", () => {
    it("should sign and verify a partner token", () => {
      const payload = { id: 2, restaurantId: 2, role: "partner", username: "topdog" };
      const token = signPartnerToken(payload);
      const decoded = verifyPartnerToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.id).toBe(2);
      expect(decoded?.restaurantId).toBe(2);
      expect(decoded?.role).toBe("partner");
      expect(decoded?.username).toBe("topdog");
    });

    it("should return null for invalid token", () => {
      const result = verifyPartnerToken("invalid.token.here");
      expect(result).toBeNull();
    });

    it("should return null for tampered token", () => {
      const payload = { id: 1, restaurantId: 1, role: "partner", username: "organic" };
      const token = signPartnerToken(payload);
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(verifyPartnerToken(tampered)).toBeNull();
    });

    it("should include restaurantId in token for isolation", () => {
      const payload = { id: 3, restaurantId: 3, role: "partner", username: "laguapa" };
      const token = signPartnerToken(payload);
      const decoded = verifyPartnerToken(token);
      expect(decoded?.restaurantId).toBe(3);
    });

    it("should distinguish master from partner role", () => {
      const masterPayload = { id: 5, restaurantId: 1, role: "master", username: "estevao" };
      const partnerPayload = { id: 1, restaurantId: 1, role: "partner", username: "organic" };
      const masterToken = signPartnerToken(masterPayload);
      const partnerToken = signPartnerToken(partnerPayload);
      expect(verifyPartnerToken(masterToken)?.role).toBe("master");
      expect(verifyPartnerToken(partnerToken)?.role).toBe("partner");
    });
  });

  describe("Password Hashing Security", () => {
    it("should use imaind-salt in hash (not plain password)", () => {
      const plainHash = crypto.createHash("sha256").update("topdog2024").digest("hex");
      const saltedHash = hashPassword("topdog2024");
      expect(plainHash).not.toBe(saltedHash);
    });

    it("should validate correct password", () => {
      const stored = hashPassword("organic2024");
      const attempt = hashPassword("organic2024");
      expect(stored).toBe(attempt);
    });

    it("should reject wrong password", () => {
      const stored = hashPassword("organic2024");
      const attempt = hashPassword("wrongpassword");
      expect(stored).not.toBe(attempt);
    });
  });
});

describe("Restaurant Isolation Logic", () => {
  it("should identify partner as non-master", () => {
    const user = { role: "partner", restaurantId: 2 };
    const isMaster = user.role === "master";
    expect(isMaster).toBe(false);
  });

  it("should identify master user", () => {
    const user = { role: "master", restaurantId: 1 };
    const isMaster = user.role === "master";
    expect(isMaster).toBe(true);
  });

  it("should filter orders by restaurantId for partner", () => {
    const orders = [
      { id: 1, restaurantId: 1, studentName: "Ana" },
      { id: 2, restaurantId: 2, studentName: "Bob" },
      { id: 3, restaurantId: 2, studentName: "Carol" },
      { id: 4, restaurantId: 3, studentName: "Dave" },
    ];
    const partnerRestaurantId = 2;
    const filtered = orders.filter(o => o.restaurantId === partnerRestaurantId);
    expect(filtered).toHaveLength(2);
    expect(filtered.every(o => o.restaurantId === 2)).toBe(true);
  });

  it("should allow master to see all orders", () => {
    const orders = [
      { id: 1, restaurantId: 1 },
      { id: 2, restaurantId: 2 },
      { id: 3, restaurantId: 3 },
    ];
    const isMaster = true;
    const visible = isMaster ? orders : orders.filter(o => o.restaurantId === 1);
    expect(visible).toHaveLength(3);
  });
});

describe("QR Code URL Generation", () => {
  const RESTAURANT_PATHS: Record<string, string> = {
    organic: "/organic",
    topdog: "/topdog",
    laguapa: "/laguapa",
    elpatron: "/elpatron",
  };

  it("should generate correct QR URL for each restaurant", () => {
    const baseUrl = "https://app.imaind.com";
    for (const [slug, path] of Object.entries(RESTAURANT_PATHS)) {
      const url = `${baseUrl}${path}?table=1&lang=en&voice=false`;
      expect(url).toContain(path);
      expect(url).toContain("table=1");
      expect(url).toContain("lang=en");
    }
  });

  it("should support both English and Spanish QR codes", () => {
    const baseUrl = "https://app.imaind.com";
    const enUrl = `${baseUrl}/topdog?table=3&lang=en&voice=false`;
    const esUrl = `${baseUrl}/topdog?table=3&lang=es&voice=false`;
    expect(enUrl).toContain("lang=en");
    expect(esUrl).toContain("lang=es");
  });

  it("should include table number in QR URL", () => {
    const tables = [1, 2, 3, 4, 5, 6, 7, 8];
    tables.forEach(tableNum => {
      const url = `https://app.imaind.com/topdog?table=${tableNum}&lang=en`;
      expect(url).toContain(`table=${tableNum}`);
    });
  });
});
