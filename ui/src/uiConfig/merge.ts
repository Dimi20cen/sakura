import type { DeepPartial } from "./types.ts";

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function mergeConfig<T extends Record<string, unknown>>(
    base: T,
    overrides: DeepPartial<T>,
): T {
    const output: Record<string, unknown> = { ...base };

    Object.entries(overrides).forEach(([key, overrideValue]) => {
        if (overrideValue === undefined) {
            return;
        }

        const baseValue = output[key];
        output[key] =
            isPlainObject(baseValue) && isPlainObject(overrideValue)
                ? mergeConfig(
                      baseValue as Record<string, unknown>,
                      overrideValue as DeepPartial<Record<string, unknown>>,
                  )
                : overrideValue;
    });

    return output as T;
}
