import { describe, it, expect, vi } from "vitest";
import { formatPrice, getTherapyTypeLabel } from "./pricing";

describe("pricing helpers", () => {
  describe("formatPrice", () => {
    it("should format price for CAD correctly", () => {
      // In Intl.NumberFormat with en-CA, it should be $120
      // Note: white spaces might be tricky, so we use a fuzzy check or check parts
      const formatted = formatPrice(120, "CAD");
      expect(formatted).toContain("$120");
    });

    it("should handle custom currency", () => {
      const formatted = formatPrice(50, "USD");
      expect(formatted).toContain("US$50");
    });
  });

  describe("getTherapyTypeLabel", () => {
    it("should return correct label for each type", () => {
      expect(getTherapyTypeLabel("solo")).toBe("Individual Therapy");
      expect(getTherapyTypeLabel("couple")).toBe("Couple Therapy");
      expect(getTherapyTypeLabel("group")).toBe("Group Therapy");
    });
  });
});
