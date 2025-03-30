// src/macros/myMacro.ts
export function getMacroString(): string {
  // This log should appear during the 'bun test' build phase if the macro executes correctly
  console.log("[Macro:myMacro.ts] getMacroString executed at BUILD TIME");
  return "String Baked In By Macro";
}