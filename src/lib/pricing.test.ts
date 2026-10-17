import { describe, expect, it } from "vitest";
import {
  ownerKeeps,
  platformFee,
  priceTag,
  riderPays,
  suggestRate,
} from "./pricing";

describe("platformFee / riderPays", () => {
  it("takes 10% booking fee from rider, owner keeps full seat", () => {
    expect(platformFee(300, 10)).toBe(30);
    expect(riderPays(300, 10)).toEqual({ seat: 300, fee: 30, total: 330 });
    expect(ownerKeeps(300)).toBe(300);
  });

  it("rounds fee to nearest rupee", () => {
    expect(platformFee(255, 10)).toBe(26);
  });
});

describe("priceTag", () => {
  it("labels cheap / normal / expensive vs suggested band", () => {
    expect(priceTag(200, 200, 300)).toBe("cheap");
    expect(priceTag(250, 200, 300)).toBe("normal");
    expect(priceTag(290, 200, 300)).toBe("expensive");
  });
});

describe("suggestRate", () => {
  it("stays within admin suggestion bounds", () => {
    const s = suggestRate("Bahria", "Gulberg", { minRate: 50, maxRate: 5000 });
    expect(s.min).toBeGreaterThanOrEqual(50);
    expect(s.max).toBeLessThanOrEqual(5000);
    expect(s.mid).toBeGreaterThanOrEqual(s.min);
    expect(s.mid).toBeLessThanOrEqual(s.max);
  });

  it("uses known map km when provided", () => {
    const s = suggestRate(
      "A",
      "B",
      { minRate: 50, maxRate: 5000 },
      50,
      2,
      20
    );
    expect(s.km).toBe(20);
    expect(s.mid).toBe(500);
  });
});
