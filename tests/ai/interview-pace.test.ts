import { describe, expect, it } from "vitest";
import { phaseFor } from "../../worker/ai/interview";
import { plainText } from "../../worker/ai/provenance";

describe("interview pace", () => {
  it("moves through every phase by answer count", () => {
    expect([0, 1, 2, 4, 5, 6, 7].map(phaseFor)).toEqual(["founder", "founder", "problem", "problem", "product", "product", "improvements"]);
  });
});

describe("plainText", () => {
  it("removes bold and links but keeps the words", () => {
    expect(plainText("**fact** see [Frontline](https://x.com/a)  now")).toBe("fact see Frontline now");
  });
});
