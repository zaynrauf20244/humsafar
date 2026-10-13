import { describe, expect, it } from "vitest";
import { isValidCnic, isValidPkPhone, normalizeCnic } from "./seed";

describe("auth CNIC + phone", () => {
  it("accepts 13-digit CNIC", () => {
    expect(isValidCnic("35202-1234567-1")).toBe(true);
    expect(normalizeCnic("35202-1234567-1")).toBe("3520212345671");
    expect(isValidCnic("123")).toBe(false);
  });

  it("accepts Pakistani mobiles", () => {
    expect(isValidPkPhone("03001234567")).toBe(true);
    expect(isValidPkPhone("3001234567")).toBe(false);
  });
});
