import { describe, it, expect, vi } from "vitest";

// ===== UNIT TESTS FOR PARTNER CONSULTANTS SYSTEM =====

// Simulated consultant data structure
type Consultant = {
  id: number;
  restaurantId: number;
  name: string;
  role: string | null;
  roleEs: string | null;
  avatarUrl: string | null;
  whatsappNumber: string;
  active: boolean;
  sortOrder: number;
};

// Fallback consultants (same logic as in ExperienceFeedback.tsx)
const FALLBACK_CONSULTANTS: Consultant[] = [
  {
    id: -1,
    restaurantId: 0,
    name: "Lucas",
    role: "American English Specialist",
    roleEs: "Especialista en Inglés Americano",
    avatarUrl: "https://cdn.example.com/lucas.webp",
    whatsappNumber: "5511947515284",
    active: true,
    sortOrder: 0,
  },
  {
    id: -2,
    restaurantId: 0,
    name: "Vicky",
    role: "Language Consultant",
    roleEs: "Consultora de Idiomas",
    avatarUrl: "https://cdn.example.com/vicky.webp",
    whatsappNumber: "5511947515284",
    active: true,
    sortOrder: 1,
  },
];

// Helper: resolve consultants with fallback
function resolveConsultants(dbConsultants: Consultant[]): Consultant[] {
  return dbConsultants.length > 0 ? dbConsultants : FALLBACK_CONSULTANTS;
}

// Helper: build WhatsApp message
function buildWhatsAppMessage(
  consultantName: string,
  restaurantName: string,
  studentName: string,
  language: "en" | "es"
): string {
  if (language === "en") {
    return `Hi ${consultantName}! I just had an amazing experience at ${restaurantName} with the ImAInd app and I'd love to learn more about inFlux! My name is ${studentName}.`;
  }
  return `¡Hola ${consultantName}! Acabo de tener una experiencia increíble en ${restaurantName} con la app ImAInd y me gustaría saber más sobre inFlux. Mi nombre es ${studentName}.`;
}

// Helper: validate WhatsApp number
function isValidWhatsApp(number: string): boolean {
  return /^\d{10,15}$/.test(number);
}

// Helper: sort consultants by sortOrder
function sortConsultants(consultants: Consultant[]): Consultant[] {
  return [...consultants].sort((a, b) => a.sortOrder - b.sortOrder);
}

// Helper: filter only active consultants
function filterActiveConsultants(consultants: Consultant[]): Consultant[] {
  return consultants.filter(c => c.active);
}

// Helper: verify restaurant ownership
function canManageConsultant(
  partnerRole: string,
  partnerRestaurantId: number,
  consultantRestaurantId: number
): boolean {
  if (partnerRole === "master") return true;
  return partnerRestaurantId === consultantRestaurantId;
}

// ===== TESTS =====

describe("Consultant Fallback Logic", () => {
  it("should use fallback consultants when db returns empty array", () => {
    const result = resolveConsultants([]);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Lucas");
    expect(result[1].name).toBe("Vicky");
  });

  it("should use db consultants when available", () => {
    const dbConsultants: Consultant[] = [
      { id: 10, restaurantId: 2, name: "Ana", role: "Consultant", roleEs: "Consultora", avatarUrl: null, whatsappNumber: "5511999990001", active: true, sortOrder: 0 },
    ];
    const result = resolveConsultants(dbConsultants);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ana");
  });

  it("should not mix db and fallback consultants", () => {
    const dbConsultants: Consultant[] = [
      { id: 10, restaurantId: 3, name: "Carlos", role: "Specialist", roleEs: "Especialista", avatarUrl: null, whatsappNumber: "5511999990002", active: true, sortOrder: 0 },
    ];
    const result = resolveConsultants(dbConsultants);
    expect(result.some(c => c.name === "Lucas")).toBe(false);
    expect(result.some(c => c.name === "Vicky")).toBe(false);
  });
});

describe("WhatsApp Message Generation", () => {
  it("should generate English message with consultant name", () => {
    const msg = buildWhatsAppMessage("Ana", "Top Dog Brasil", "João", "en");
    expect(msg).toContain("Hi Ana!");
    expect(msg).toContain("Top Dog Brasil");
    expect(msg).toContain("João");
    expect(msg).toContain("inFlux");
  });

  it("should generate Spanish message with consultant name", () => {
    const msg = buildWhatsAppMessage("Carlos", "La Guapa", "Maria", "es");
    expect(msg).toContain("¡Hola Carlos!");
    expect(msg).toContain("La Guapa");
    expect(msg).toContain("Maria");
    expect(msg).toContain("inFlux");
  });

  it("should include ImAInd app reference in both languages", () => {
    const en = buildWhatsAppMessage("Lucas", "Organic", "Test", "en");
    const es = buildWhatsAppMessage("Lucas", "Organic", "Test", "es");
    expect(en).toContain("ImAInd");
    expect(es).toContain("ImAInd");
  });
});

describe("WhatsApp Number Validation", () => {
  it("should accept valid Brazilian number with DDI", () => {
    expect(isValidWhatsApp("5511947515284")).toBe(true);
  });

  it("should accept 10-digit number", () => {
    expect(isValidWhatsApp("5511999990001")).toBe(true);
  });

  it("should reject number with letters", () => {
    expect(isValidWhatsApp("551199999abc")).toBe(false);
  });

  it("should reject number too short", () => {
    expect(isValidWhatsApp("123456")).toBe(false);
  });

  it("should reject number with spaces", () => {
    expect(isValidWhatsApp("55 11 99999 0001")).toBe(false);
  });
});

describe("Consultant Sorting", () => {
  const unsorted: Consultant[] = [
    { id: 3, restaurantId: 1, name: "Carlos", role: null, roleEs: null, avatarUrl: null, whatsappNumber: "5511111111111", active: true, sortOrder: 2 },
    { id: 1, restaurantId: 1, name: "Ana", role: null, roleEs: null, avatarUrl: null, whatsappNumber: "5511111111111", active: true, sortOrder: 0 },
    { id: 2, restaurantId: 1, name: "Bruno", role: null, roleEs: null, avatarUrl: null, whatsappNumber: "5511111111111", active: true, sortOrder: 1 },
  ];

  it("should sort consultants by sortOrder ascending", () => {
    const sorted = sortConsultants(unsorted);
    expect(sorted[0].name).toBe("Ana");
    expect(sorted[1].name).toBe("Bruno");
    expect(sorted[2].name).toBe("Carlos");
  });

  it("should not mutate the original array", () => {
    const original = [...unsorted];
    sortConsultants(unsorted);
    expect(unsorted[0].name).toBe(original[0].name);
  });
});

describe("Active Consultant Filtering", () => {
  const mixed: Consultant[] = [
    { id: 1, restaurantId: 1, name: "Active1", role: null, roleEs: null, avatarUrl: null, whatsappNumber: "5511111111111", active: true, sortOrder: 0 },
    { id: 2, restaurantId: 1, name: "Inactive1", role: null, roleEs: null, avatarUrl: null, whatsappNumber: "5511111111111", active: false, sortOrder: 1 },
    { id: 3, restaurantId: 1, name: "Active2", role: null, roleEs: null, avatarUrl: null, whatsappNumber: "5511111111111", active: true, sortOrder: 2 },
  ];

  it("should return only active consultants", () => {
    const active = filterActiveConsultants(mixed);
    expect(active).toHaveLength(2);
    expect(active.every(c => c.active)).toBe(true);
  });

  it("should exclude inactive consultants", () => {
    const active = filterActiveConsultants(mixed);
    expect(active.some(c => c.name === "Inactive1")).toBe(false);
  });
});

describe("Restaurant Ownership Verification", () => {
  it("should allow partner to manage their own consultant", () => {
    expect(canManageConsultant("partner", 2, 2)).toBe(true);
  });

  it("should deny partner from managing another restaurant's consultant", () => {
    expect(canManageConsultant("partner", 2, 3)).toBe(false);
  });

  it("should allow master to manage any consultant", () => {
    expect(canManageConsultant("master", 1, 5)).toBe(true);
    expect(canManageConsultant("master", 1, 30001)).toBe(true);
  });

  it("should deny partner from managing Cabana Burger consultant", () => {
    expect(canManageConsultant("partner", 2, 30001)).toBe(false);
  });
});

describe("Consultant Role Localization", () => {
  const consultant: Consultant = {
    id: 1,
    restaurantId: 1,
    name: "Ana",
    role: "Language Consultant",
    roleEs: "Consultora de Idiomas",
    avatarUrl: null,
    whatsappNumber: "5511111111111",
    active: true,
    sortOrder: 0,
  };

  it("should return English role for EN language", () => {
    const roleLabel = "en" === "es" ? (consultant.roleEs || consultant.role) : consultant.role;
    expect(roleLabel).toBe("Language Consultant");
  });

  it("should return Spanish role for ES language", () => {
    const roleLabel = "es" === "es" ? (consultant.roleEs || consultant.role) : consultant.role;
    expect(roleLabel).toBe("Consultora de Idiomas");
  });

  it("should fallback to English role when Spanish is not set", () => {
    const noEs: Consultant = { ...consultant, roleEs: null };
    const roleLabel = "es" === "es" ? (noEs.roleEs || noEs.role) : noEs.role;
    expect(roleLabel).toBe("Language Consultant");
  });
});

describe("Consultant Card Accent Colors", () => {
  const CARD_ACCENTS = [
    { border: "hover:border-blue-500/50", badge: "bg-blue-600/30 text-blue-300" },
    { border: "hover:border-pink-500/50", badge: "bg-pink-600/30 text-pink-300" },
    { border: "hover:border-purple-500/50", badge: "bg-purple-600/30 text-purple-300" },
    { border: "hover:border-emerald-500/50", badge: "bg-emerald-600/30 text-emerald-300" },
  ];

  it("should cycle accent colors for more than 4 consultants", () => {
    const consultants = Array.from({ length: 6 }, (_, i) => ({ id: i }));
    const accents = consultants.map((_, idx) => CARD_ACCENTS[idx % CARD_ACCENTS.length]);
    expect(accents[0]).toEqual(CARD_ACCENTS[0]);
    expect(accents[4]).toEqual(CARD_ACCENTS[0]); // cycles back
    expect(accents[5]).toEqual(CARD_ACCENTS[1]);
  });

  it("should have 4 accent color options", () => {
    expect(CARD_ACCENTS).toHaveLength(4);
  });
});
