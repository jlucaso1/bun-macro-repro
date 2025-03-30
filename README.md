# Bun Build-Time Macro Issue Reproduction

This repository demonstrates a potential issue in Bun (tested with v1.2.7, but may affect others) where build-time macros (`import ... with { type: "macro" }`) might not be correctly processed and replaced during `bun test` under specific class inheritance and instantiation patterns.

This issue was originally observed when refactoring a library (`lightq`) that uses macros to load Lua scripts at build time. The refactoring introduced a base class, and after that change, `bun test` started failing with a `ReferenceError` indicating the macro function wasn't defined at runtime, even though direct execution with `bun run` worked correctly.

## Problem Statement

When a class (`DerivedService`) inherits from a base class (`BaseService`) and its constructor instantiates another class (`MacroUser`), and *that* class (`MacroUser`) calls a function imported as a build-time macro (`getMacroString`), `bun test` fails to replace the macro function call with its result. This leads to a `ReferenceError` at runtime during the test execution because the macro function doesn't exist then.

Direct execution via `bun run src/index.ts` might process the macro correctly, suggesting the issue could be specific to the `bun test` environment or build pipeline.

## Repository Structure

```
bun-macro-repro/
├── src/
│   ├── macros/
│   │   └── myMacro.ts         # Defines the simple macro function
│   └── services/
│       ├── BaseService.ts     # Simple base class
│       ├── DerivedService.ts  # Inherits BaseService, instantiates MacroUser
│       └── MacroUser.ts       # Uses the macro function
│   └── index.ts             # Entry point for direct execution
├── test/
│   └── repro.test.ts        # Test file that triggers the error
├── package.json
└── tsconfig.json
```

## Setup

1.  Clone this repository.
2.  Navigate to the repository directory.
3.  Install dependencies:
    ```bash
    bun install
    ```

## Running the Code & Expected Outcomes

There are two ways to run the code, demonstrating the different behaviors:

### 1. Running the Test (`bun test`) - Expected ERROR

This method demonstrates the bug where the macro is NOT replaced.

**Command:**

```bash
bun test
# or: npm run test
```

**Expected Outcome:**

*   The test **fails**.
*   You will likely **NOT** see the build-time log `[Macro:myMacro.ts] getMacroString executed at BUILD TIME` appear reliably before the test runs (it might be missing or interleaved strangely).
*   You will see runtime constructor logs followed by a `ReferenceError`.

**Example Console Output (Error):**

```
$ bun test
bun test v1.2.7 (5c0fa6dc)

repro.test.ts:
[Macro:myMacro.ts] getMacroString executed at BUILD TIME

--- Starting Test ---
Test: Instantiating DerivedService...
DerivedService constructor (Runtime) - Instantiating MacroUser...
MacroUser constructor (Runtime) - Attempting to get macro result...
MacroUser constructor (Runtime) - Got macro result (if defined): String Baked In By Macro
DerivedService constructor (Runtime) - MacroUser instantiated.
Test: DerivedService instantiated successfully (BUG NOT REPRODUCED?).
16 |     } catch (e) {
17 |       console.error("Test: Caught error during instantiation:", e);
18 |       caughtError = e as Error;
19 |     }
20 | 
21 |     expect(caughtError).toBeInstanceOf(ReferenceError);
                             ^
error: expect(received).toBeInstanceOf(expected)

Expected constructor: [class ReferenceError extends Error]
Received value: null

      at <anonymous> (/home/jlucaso/projects/temp/bun-macro-repro/repro.test.ts:21:25)
✗ Bun Macro Build-Time Issue Reproduction > should instantiate DerivedService and access macro result [6.00ms]

 0 pass
 1 fail
 1 expect() calls
Ran 1 tests across 1 files. [49.00ms]
error: script "test" exited with code 1
```
*(Note: The exact timing and error line numbers might vary slightly)*

### 2. Running Directly (`bun start`) - Expected SUCCESS

This method usually demonstrates the *correct* behavior where the macro IS replaced.

**Command:**

```bash
bun start
# or: npm run start
# or: bun run src/index.ts
```

**Expected Outcome:**

*   The script runs **successfully** without errors.
*   You **SHOULD** see the build-time log `[Macro:myMacro.ts] getMacroString executed at BUILD TIME` appear *once* near the start of the execution.
*   The runtime logs will show successful instantiation.
*   The final output includes the string returned by the macro.

**Example Console Output (Success):**

```
$ bun start
[Macro:myMacro.ts] getMacroString executed at BUILD TIME
--- Running src/index.ts ---
Instantiating DerivedService...
DerivedService constructor (Runtime) - Instantiating MacroUser...
MacroUser constructor (Runtime) - Attempting to get macro result...
MacroUser constructor (Runtime) - Got macro result (if defined): String Baked In By Macro
DerivedService constructor (Runtime) - MacroUser instantiated.
DerivedService instantiated successfully.

Result from service.getCombinedResult():
>>> Info from Base | String Baked In By Macro <<<

SUCCESS: Macro seems to have been replaced correctly!

--- Finished src/index.ts ---
```

## Analysis and Potential Cause

*   **Build-Time Macros:** Bun macros (using `with { type: "macro" }`) are designed to run during the build process. Bun executes the macro function, takes its return value, and replaces the original function call with that value (typically a string literal) in the final JavaScript code.
*   **Runtime Execution:** The final JavaScript code, which runs either via `bun run` or `bun test`, should *not* contain the original macro function call, only its result.
*   **The Error:** A `ReferenceError: <macro_function_name> is not defined` at runtime means the build-time replacement step failed. The runtime code is still trying to call a function that doesn't exist.
*   **Hypothesis:** The combination of class inheritance (`DerivedService extends BaseService`), coupled with the instantiation of another class (`MacroUser`) within the derived class's constructor, which *then* calls the macro, seems to confuse Bun's static analysis or build pipeline, specifically when running `bun test`. Bun fails to detect and execute the macro replacement correctly in this scenario during the test build phase. Direct execution via `bun run` might use a slightly different (or less complex) analysis path, allowing the macro to be processed correctly.

This points towards a potential bug within Bun's macro handling, specifically concerning how it analyzes code dependencies and performs replacements in the context of `bun test` when encountering these particular class structures.

## Environment

*   **Tested with Bun:** v1.2.7
*   **OS:** Arch linux
```