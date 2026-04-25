import { describe, it, expect } from "vitest";
import { 
  calculateAge, 
  isChild, 
  professionalTreatsAgeCategory,
  normalizeString,
  calculateRelevancyScore
} from "./appointment-routing";

describe("appointment-routing", () => {
  describe("calculateAge", () => {
    it("should calculate correct age", () => {
      const today = new Date();
      const thirtyYearsAgo = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
      expect(calculateAge(thirtyYearsAgo)).toBe(30);
    });

    it("should handle string dates", () => {
      const today = new Date();
      const birthStr = `${today.getFullYear() - 25}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
      expect(calculateAge(birthStr)).toBe(25);
    });
  });

  describe("isChild", () => {
    it("should return true for age < 18", () => {
      expect(isChild(17)).toBe(true);
      expect(isChild(5)).toBe(true);
    });

    it("should return false for age >= 18", () => {
      expect(isChild(18)).toBe(false);
      expect(isChild(30)).toBe(false);
    });
  });

  describe("professionalTreatsAgeCategory", () => {
    it("should return true if no categories specified", () => {
      expect(professionalTreatsAgeCategory(undefined, true)).toBe(true);
      expect(professionalTreatsAgeCategory([], false)).toBe(true);
    });

    it("should match child categories for children", () => {
      const categories = ["Children (0-12)", "Adolescents (13-17)"];
      expect(professionalTreatsAgeCategory(categories, true)).toBe(true);
      expect(professionalTreatsAgeCategory(categories, false)).toBe(false);
    });

    it("should match adult categories for adults", () => {
      const categories = ["Adults (18-64)", "Seniors (65+)"];
      expect(professionalTreatsAgeCategory(categories, false)).toBe(true);
      expect(professionalTreatsAgeCategory(categories, true)).toBe(false);
    });
  });

  describe("normalizeString", () => {
    it("should lowercase and remove accents", () => {
      expect(normalizeString("Anxiété")).toBe("anxiete");
      expect(normalizeString("  Dépression  ")).toBe("depression");
    });
  });

  describe("calculateRelevancyScore", () => {
    const mockProfile = {
      problematics: ["Anxiété", "Dépression", "Stress"],
      specialty: "Psychologue",
      ageCategories: ["Adultes (18-64)"],
      modalities: ["online", "inPerson"],
      sessionTypes: ["individual"],
    };

    const mockAppointment = {
      type: "video",
      therapyType: "solo",
      issueType: "Anxiété",
    };

    it("should give high score for exact problematics match", () => {
      const { score } = calculateRelevancyScore(mockProfile, mockAppointment);
      expect(score).toBeGreaterThanOrEqual(100);
    });

    it("should give bonus for matching language if provided", () => {
      const profileWithLang = { ...mockProfile, languages: ["Français", "Anglais"] };
      const medicalProfile = { languagePreference: "Français", primaryIssue: "Anxiété" };
      
      const { score } = calculateRelevancyScore(profileWithLang, mockAppointment, medicalProfile);
      // Base score for Anxiété + language bonus
      expect(score).toBeGreaterThan(100);
    });
  });
});
