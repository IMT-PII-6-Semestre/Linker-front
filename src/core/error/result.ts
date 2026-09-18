import type { Failure } from './failure';

/**
 * Sucesso ou Failure, como valor. O `switch` exaustivo obriga quem consome a
 * tratar o erro — diferente de exceção, que dá para esquecer.
 */
export interface Ok<T> {
  readonly kind: 'ok';
  readonly value: T;
}

export interface Err {
  readonly kind: 'err';
  readonly failure: Failure;
}

export type Result<T> = Ok<T> | Err;

export function ok<T>(value: T): Result<T> {
  return { kind: 'ok', value };
}

export function err(failure: Failure): Result<never> {
  return { kind: 'err', failure };
}

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable case: ${JSON.stringify(x)}`);
}
