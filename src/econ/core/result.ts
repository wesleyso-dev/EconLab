/**
 * - `invalid-input`: the parameters do not describe a valid model (e.g. upward-sloping demand).
 * - `no-trade`: the model is valid but no positive quantity is exchanged.
 */
export type ErrorCode = 'invalid-input' | 'no-trade';

export interface ModelError {
  readonly code: ErrorCode;
  readonly message: string;
}

/**
 * Models return results instead of throwing, because invalid configurations are
 * expected while users drag curves around and should be shown, not crash the app.
 */
export type Result<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: ModelError };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail(code: ErrorCode, message: string): Result<never> {
  return { ok: false, error: { code, message } };
}

export function modelError(code: ErrorCode, message: string): ModelError {
  return { code, message };
}

export function allFinite(...values: number[]): boolean {
  return values.every(Number.isFinite);
}
