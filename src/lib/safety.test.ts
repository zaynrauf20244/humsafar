import { describe, expect, it } from "vitest";
import {
  canPostWomenRoute,
  looksLikePkPhone,
  redactPhoneNumbers,
  riderBlockedFromWomenRoute,
  womenRouteDriverOk,
} from "./safety";

describe("chat phone hiding", () => {
  it("detects local and +92 numbers", () => {
    expect(looksLikePkPhone("call me 03001234567")).toBe(true);
    expect(looksLikePkPhone("whatsapp +92 3001234567")).toBe(true);
    expect(looksLikePkPhone("I'm at the gate")).toBe(false);
  });

  it("redacts numbers from messages", () => {
    expect(redactPhoneNumbers("meet at 03001234567 ok")).toBe(
      "meet at [number hidden] ok"
    );
  });
});

describe("women-only rules", () => {
  it("only approved women can post women routes", () => {
    expect(
      canPostWomenRoute({ gender: "female", cnicStatus: "approved" })
    ).toBe(true);
    expect(
      canPostWomenRoute({ gender: "female", cnicStatus: "pending" })
    ).toBe(false);
    expect(
      canPostWomenRoute({ gender: "male", cnicStatus: "approved" })
    ).toBe(false);
  });

  it("blocks male riders from women routes", () => {
    expect(
      riderBlockedFromWomenRoute(
        { gender: "male", role: "passenger" },
        { category: "women", commuteType: "women" }
      )
    ).toBe(true);
    expect(
      riderBlockedFromWomenRoute(
        { gender: "female", role: "passenger" },
        { category: "women", commuteType: "women" }
      )
    ).toBe(false);
  });

  it("hides women listings from unapproved / male drivers in filter", () => {
    expect(
      womenRouteDriverOk({
        gender: "female",
        cnicStatus: "approved",
      })
    ).toBe(true);
    expect(
      womenRouteDriverOk({
        gender: "male",
        cnicStatus: "approved",
      })
    ).toBe(false);
  });
});
