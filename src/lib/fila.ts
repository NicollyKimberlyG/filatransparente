export type NivelRisco = "vermelho" | "laranja" | "amarelo" | "verde" | "azul";
export const NIVEIS: { nivel: NivelRisco; rotulo: string; descricao: string; classe: string }[] = [
  { nivel: "vermelho", rotulo: "Emergência", descricao: "atendimento imediato", classe: "bg-tri-vermelho" },
  { nivel: "laranja", rotulo: "Muito urgente", descricao: "prioridade alta", classe: "bg-tri-laranja" },
  { nivel: "amarelo", rotulo: "Urgente", descricao: "prioridade", classe: "bg-tri-amarelo" },
  { nivel: "verde", rotulo: "Pouco urgente", descricao: "ordem de chegada", classe: "bg-tri-verde" },
  { nivel: "azul", rotulo: "Não urgente", descricao: "ordem de chegada", classe: "bg-tri-azul" },
];
export type PacienteFila = { id: string; chegada: number; urgente: boolean; nivel?: NivelRisco };
export function nivelDe(p: PacienteFila): NivelRisco {
  return p.nivel ?? (p.urgente ? "amarelo" : "azul");
}
const rank = (p: PacienteFila) => NIVEIS.findIndex(n => n.nivel === nivelDe(p));
// Risk level is assigned by clinical assessment, never by a patient-facing control.
// Higher risk first; within the same level, arrival order.
export function organizarFila<T extends PacienteFila>(pacientes: readonly T[]): T[] {
  return [...pacientes].sort((a, b) => rank(a) - rank(b) || a.chegada - b.chegada);
}
export function criarFila(total: number): PacienteFila[] {
  return organizarFila(Array.from({ length: total }, (_, i) => {
    const urgente = i % 13 === 3;
    const nivel: NivelRisco = urgente ? (i % 39 === 3 ? "vermelho" : i % 39 === 16 ? "laranja" : "amarelo") : i % 3 === 0 ? "verde" : "azul";
    return { id: `paciente-${i + 1}`, chegada: i + 1, urgente, nivel };
  }));
}
export function pacientePorDocumento(documento: string, total: number) {
  let h = 0;
  for (const c of documento.replace(/\D/g, "")) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return `paciente-${(h % total) + 1}`;
}

/** Espera estimada (dias) = ⌈pessoas à frente, incluindo você ÷ vagas por dia⌉. */
export function esperaEstimada(posicao: number, vagasPorDia: number): number {
  if (vagasPorDia <= 0) return 0;
  return Math.max(1, Math.ceil(posicao / vagasPorDia));
}

const INICIAIS = "ABCDEFGHIJLMNPRSTV";
/** LGPD: only initials + first 3 digits of a fictional CNS are ever shown. */
export function identificacaoPublica(seed: number, nome?: string) {
  const iniciais = nome
    ? nome.split(/\s+/).filter(Boolean).map(p => `${p[0]!.toUpperCase()}.`).join("")
    : Array.from({ length: 3 }, (_, i) => `${INICIAIS[(seed * (7 + i * 5) + i * 3) % INICIAIS.length]}.`).join("");
  const prefixo = String(100 + ((seed * 7919) % 900));
  return `${iniciais} · SUS: ${prefixo}xxxxxxx`;
}

/** Fictional seasonal demand index (Jan–Dec) for a specialty. */
export function sazonalidade(especialidade: string): number[] {
  const picos: Record<string, number[]> = {
    Dermatologia: [0, 1, 11], Pediatria: [4, 5, 6], Pneumologia: [5, 6, 7],
    Otorrinolaringologia: [5, 6], Infectologia: [1, 2, 3], Oftalmologia: [8, 9],
  };
  let h = 0;
  for (const c of especialidade) h = (h * 31 + c.charCodeAt(0)) % 997;
  const pico = picos[especialidade] ?? [h % 12, (h + 1) % 12];
  return Array.from({ length: 12 }, (_, m) => 50 + ((h + m * 13) % 20) + (pico.includes(m) ? 35 : 0));
}
