import { DerivedService } from "./services/DerivedService";

console.log("--- Running src/index.ts ---");

try {
  console.log("Instantiating DerivedService...");
  const service = new DerivedService();
  console.log("DerivedService instantiated successfully.");

  const result = service.getCombinedResult();
  console.log("\nResult from service.getCombinedResult():");
  console.log(`>>> ${result} <<<`);

  if (result.includes("String Baked In By Macro")) {
    console.log("\nSUCCESS: Macro seems to have been replaced correctly!");
  } else if (result.includes("undefined") || result.includes("Error")) {
    console.error(
      "\nERROR: Macro result is missing or indicates an error. Macro might not have run/replaced correctly."
    );
  } else {
    console.warn("\nUNKNOWN: Macro result seems unexpected. Check output.");
  }
} catch (error) {
  console.error("\n--- ERROR DURING EXECUTION ---");
  console.error(error);
  console.error(
    "\nThis ReferenceError indicates the macro was NOT replaced at build time."
  );
}

console.log("\n--- Finished src/index.ts ---");
