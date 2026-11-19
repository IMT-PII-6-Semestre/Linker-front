import {
  Failure,
  NetworkFailure,
  ServerFailure,
  UnauthorizedFailure,
  UnexpectedFailure,
  ConflictFailure,
} from "../error/failure";
import { err, ok, Result } from "../error/result";

const BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export async function request<T>(
  url: string,
  options?: RequestInit,
  token?: string,
): Promise<Result<T>> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
        // {token ? `Bearer ${token}` : '',}
      },
    });
  } catch {
    return err(NetworkFailure());
  }
  if (response.ok) {
    if (response.status === 204) return ok(undefined as T);
    return ok((await response.json()) as T);
  }

  const body = await response.json().catch(() => null);
  return err(toFailure(response.status, body?.erro));
}

function toFailure(status: number, message?: string): Failure {
  if (status === 401) return UnauthorizedFailure(message);
  if (status === 409) return ConflictFailure(message);
  if (status >= 500) return ServerFailure(status);
  return UnexpectedFailure(message);
}
