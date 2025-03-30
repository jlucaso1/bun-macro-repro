import { getMacroString } from "../macros/myMacro" with { type: "macro" };

export class MacroUser {
  internalString: string;

  constructor() {
    console.log("MacroUser constructor (Runtime) - Attempting to get macro result...");
    this.internalString = getMacroString();
    console.log("MacroUser constructor (Runtime) - Got macro result (if defined):", this.internalString);
  }

  getResult(): string {
    return this.internalString;
  }
}