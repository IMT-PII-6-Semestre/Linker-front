import { AppOrigin } from "@/app-shell/origin";
import { err, ok, Result } from "@/core/error/result";
import { AuthRepository } from "../domain/authRepository";
import { SignUpPayload } from "../domain/registration";
import { UserRole, Session } from "../domain/session";
import { InvalidCredentialsFailure } from "@/core/error/failure";
import { request } from "@/core/http/apiClient";

type AuthResponse = {
  usuario: { id: number; tipo: UserRole; nomeCompleto: string; email: string };
  token: string;
};

function toSession(data: AuthResponse, origin: AppOrigin): Session {
  return {
    userId: data.usuario.id.toString(),
    name: data.usuario.nomeCompleto,
    email: data.usuario.email,
    role: data.usuario.tipo,
    token: data.token,
    origin,
  };
}

export class ApiAuthRepository implements AuthRepository {
  async signIn(params: {
    email: string;
    password: string;
    origin: AppOrigin;
  }): Promise<Result<Session>> {
    const r = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        senha: params.password,
        origin: params.origin,
      }),
    });

    if (r.kind === "err" && r.failure.type === "unauthorized") {
      return err(InvalidCredentialsFailure());
    }

    if (r.kind === "err") {
      return r;
    }

    return ok(toSession(r.value, params.origin));
  }

  async signUp(params: {
    payload: SignUpPayload;
    origin: AppOrigin;
  }): Promise<Result<Session>> {
    const r = await request<AuthResponse>(
      `/auth/cadastro/${params.payload.role}`,
      {
        method: "POST",
        body: JSON.stringify(params.payload),
      },
    );

    if (r.kind === "err") {
      return r;
    }

    return ok(toSession(r.value, params.origin));
  }

  async restoreSession(): Promise<Session | null> {
    return null;
  }

  async signOut(): Promise<void> {
    // nada a fazer
  }
}
