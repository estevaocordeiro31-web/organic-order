/**
 * Tests for restaurant voice data (vocabulary + Q&A pairs)
 * These are pure data validation tests — no DB or tRPC calls needed.
 */
import { describe, it, expect } from "vitest";
import {
  RESTAURANT_VOICE_CONFIGS,
  getRestaurantVoiceConfig,
} from "../client/src/lib/restaurantVoiceData";

const SLUGS = ["topdog", "laguapa", "elpatron", "cabana"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

describe("Restaurant Voice Data", () => {
  it("should have configs for all 4 partner restaurants", () => {
    for (const slug of SLUGS) {
      expect(RESTAURANT_VOICE_CONFIGS[slug]).toBeDefined();
    }
  });

  it("getRestaurantVoiceConfig should return config for valid slugs", () => {
    for (const slug of SLUGS) {
      const config = getRestaurantVoiceConfig(slug);
      expect(config).not.toBeNull();
    }
  });

  it("getRestaurantVoiceConfig should return null for unknown slug", () => {
    expect(getRestaurantVoiceConfig("unknown-restaurant")).toBeNull();
  });

  for (const slug of SLUGS) {
    describe(`${slug} config`, () => {
      const config = RESTAURANT_VOICE_CONFIGS[slug];

      it("should have required metadata fields", () => {
        expect(config.waiterEmoji).toBeTruthy();
        expect(config.waiterNameEn).toBeTruthy();
        expect(config.waiterNameEs).toBeTruthy();
        expect(config.welcomeEn).toBeTruthy();
        expect(config.welcomeEs).toBeTruthy();
        expect(config.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
        expect(config.bgColor).toMatch(/^#[0-9a-f]{6,7}$/i);
      });

      it("should have EN phrases for all 3 difficulty levels", () => {
        for (const diff of DIFFICULTIES) {
          const phrases = config.phrasesEn.filter(p => p.difficulty === diff);
          expect(phrases.length).toBeGreaterThanOrEqual(3);
        }
      });

      it("should have ES phrases for all 3 difficulty levels", () => {
        for (const diff of DIFFICULTIES) {
          const phrases = config.phrasesEs.filter(p => p.difficulty === diff);
          expect(phrases.length).toBeGreaterThanOrEqual(3);
        }
      });

      it("should have at least 5 Q&A pairs in EN", () => {
        expect(config.qaEn.length).toBeGreaterThanOrEqual(5);
      });

      it("should have at least 5 Q&A pairs in ES", () => {
        expect(config.qaEs.length).toBeGreaterThanOrEqual(5);
      });

      it("each EN Q&A pair should have all required fields", () => {
        for (const qa of config.qaEn) {
          expect(qa.question).toBeTruthy();
          expect(qa.expectedAnswer).toBeTruthy();
          expect(qa.translation).toBeTruthy();
          expect(qa.hint).toBeTruthy();
          expect(qa.keywords.length).toBeGreaterThanOrEqual(2);
        }
      });

      it("each ES Q&A pair should have all required fields", () => {
        for (const qa of config.qaEs) {
          expect(qa.question).toBeTruthy();
          expect(qa.expectedAnswer).toBeTruthy();
          expect(qa.translation).toBeTruthy();
          expect(qa.hint).toBeTruthy();
          expect(qa.keywords.length).toBeGreaterThanOrEqual(2);
        }
      });

      it("EN phrases should have unique IDs", () => {
        const ids = config.phrasesEn.map(p => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      it("ES phrases should have unique IDs", () => {
        const ids = config.phrasesEs.map(p => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      it("EN phrases should have non-empty expressions and translations", () => {
        for (const phrase of config.phrasesEn) {
          expect(phrase.expression).toBeTruthy();
          expect(phrase.translation).toBeTruthy();
          expect(phrase.context).toBeTruthy();
        }
      });
    });
  }
});
