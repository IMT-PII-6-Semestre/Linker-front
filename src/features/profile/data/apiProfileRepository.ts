import { type Result } from "@/core/error/result";
import { request } from "@/core/http/apiClient";
import type { Session } from "@/features/auth/domain/session";

import type { Profile } from "../domain/profile";
import type { ProfileRepository } from "../domain/profileRepository";

export class ApiProfileRepository implements ProfileRepository {
  private last: Profile | null = null;

  constructor(private readonly getToken: () => string | undefined) {}

  getProfile(session: Session): Promise<Result<Profile>> {
    return this.fetchProfile(session.token);
  }

  async saveProfile(profile: Profile): Promise<Result<Profile>> {
    const token = this.getToken();
    const r = await request<Profile>(
      "/perfil",
      {
        method: "PUT",
        body: JSON.stringify(profile),
      },
      token,
    );

    if (r.kind === "err") {
      return r;
    }

    if (profile.role === "empresa") {
      const antes = this.last?.role === "empresa" ? this.last.vagas : [];

      for (const anterior of antes) {
        const aindaExiste = profile.vagas.some((v) => v.id === anterior.id);
        if (!aindaExiste) {
          const d = await request(
            `/vagas/${anterior.id}`,
            { method: "DELETE" },
            token,
          );
          if (d.kind === "err") return d;
        }
      }

      for (const vaga of profile.vagas) {
        const { id: _id, ...info } = vaga;

        if (vaga.id.startsWith("vaga-")) {
          const r = await request(
            "/vagas",
            {
              method: "POST",
              body: JSON.stringify(info),
            },
            token,
          );
          if (r.kind === "err") return r;
        } else if (vaga !== antes.find((v) => v.id === vaga.id)) {
          const r = await request(
            "/vagas/" + vaga.id,
            {
              method: "PUT",
              body: JSON.stringify(info),
            },
            token,
          );
          if (r.kind === "err") return r;
        }
        // caso C (nenhum dos dois): não mudou, não faz nada
        // em A ou B: se a resposta for err, return
      }
    }

    // 4. busca de novo (atualiza o `last` e traz os ids reais das vagas novas)
    return this.fetchProfile(token);
  }

  private async fetchProfile(
    token: string | undefined,
  ): Promise<Result<Profile>> {
    const r = await request<Profile>("/perfil", { method: "GET" }, token);
    if (r.kind === "ok") {
      this.last = r.value;
    }
    return r;
  }
}
