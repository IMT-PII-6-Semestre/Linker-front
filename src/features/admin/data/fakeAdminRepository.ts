import { UnauthorizedFailure } from '@/core/error/failure';
import { err, ok, type Result } from '@/core/error/result';
import type { Session } from '@/features/auth/domain/session';

import type { AdminRepository } from '../domain/adminRepository';
import { computeMetrics, type AdminMetrics, type PlatformSnapshot } from '../domain/metrics';

/**
 * Métricas de exemplo, enquanto a API não existe. A base é gerada com
 * semente fixa — os números são sempre os mesmos (bons para teste e demo).
 * Só `admin` acessa; outros papéis recebem UnauthorizedFailure.
 */
export class FakeAdminRepository implements AdminRepository {
  constructor(
    private readonly latencyMs: number = 700,
    private readonly snapshot: () => PlatformSnapshot = demoSnapshot,
  ) {}

  async metrics(session: Session): Promise<Result<AdminMetrics>> {
    await delay(this.latencyMs);
    if (session.role !== 'admin') {
      return err(UnauthorizedFailure('Acesso restrito à equipe Linker.'));
    }
    return ok(computeMetrics(this.snapshot()));
  }
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoSnapshot(now: number = Date.now()): PlatformSnapshot {
  const rand = seeded(2026);
  // Idades concentradas entre 18 e 40, com cauda até 62.
  const candidatoAges = Array.from({ length: 1248 }, () => {
    const r = rand();
    if (r < 0.04) return 14 + Math.floor(rand() * 4);
    if (r < 0.9) return 18 + Math.floor(rand() * rand() * 30);
    return 40 + Math.floor(rand() * 23);
  });
  const vagasPorEmpresa = Array.from({ length: 186 }, () => 1 + Math.floor(rand() * rand() * 7));

  const week = 7 * 86_400_000;
  const base = [182, 205, 221, 198, 247, 268, 291, 319];
  const matchesPorSemana = base.map((matches, i) => ({
    inicio: now - (base.length - i) * week,
    matches,
  }));

  return {
    candidatoAges,
    vagasPorEmpresa,
    curtidas: 9870,
    matches: 2431,
    novosUltimos30d: 312,
    novos30dAnteriores: 268,
    matchesPorSemana,
    geradoEm: now,
  };
}
