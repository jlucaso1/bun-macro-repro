import { describe, it, expect } from "bun:test";
import { DerivedService } from "./src/services/DerivedService";

describe("Bun Macro Build-Time Issue Reproduction", () => {
  it("should instantiate DerivedService and access macro result", () => {
    console.log("\n--- Starting Test ---");
    let service: DerivedService | null = null;
    let caughtError: Error | null = null;

    try {
      console.log("Test: Instantiating DerivedService...");
      service = new DerivedService();
      console.log(
        "Test: DerivedService instantiated successfully (BUG NOT REPRODUCED?)."
      );
    } catch (e) {
      console.error("Test: Caught error during instantiation:", e);
      caughtError = e as Error;
    }

    expect(caughtError).toBeInstanceOf(ReferenceError);
    expect(caughtError?.message).toContain("getMacroString is not defined");

    expect(service).toBeNull();

    console.log("--- Finished Test ---\n");
  });
});
