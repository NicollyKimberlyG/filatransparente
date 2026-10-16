import { UNIDADES } from "./unidades";
import { esperaEstimada } from "./fila";

export type MinhaConsulta = {
  especialidade: string; unidade: string; tipo: string; bairro: string;
  posicao: number; total: number; vagas: number; espera: number;
};

/** Example consultations derived deterministically from the account's CPF/CNS (2–3 per account). */
export function consultasDaConta(documento: string): MinhaConsulta[] {
  const d = documento.replace(/\D/g, "");
  let h = 7;
  for (const c of d) h = (h * 31 + c.charCodeAt(0)) % 1_000_003;
  const qtd = 2 + (h % 2);
  const usadas = new Set<string>();
  const out: MinhaConsulta[] = [];
  for (let i = 0; out.length < qtd && i < 50; i++) {
    const u = UNIDADES[(h + i * 17) % UNIDADES.length]!;
    const e = u.especialidades[(h + i) % u.especialidades.length]!;
    if (usadas.has(e.nome)) continue;
    usadas.add(e.nome);
    const posicao = 1 + ((h + i * 97) % e.naFila);
    out.push({ especialidade: e.nome, unidade: u.nome, tipo: u.tipo, bairro: u.bairro,
      posicao, total: e.naFila, vagas: e.vagas, espera: esperaEstimada(posicao, e.vagas) });
  }
  return out;
}
