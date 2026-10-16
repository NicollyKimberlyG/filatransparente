export type PacienteFila = { id: string; chegada: number; urgente: boolean };
// Urgency is assigned by clinical assessment, never by a patient-facing control.
export function organizarFila<T extends PacienteFila>(pacientes: readonly T[]): T[] {
  return [...pacientes].sort((a, b) => Number(b.urgente) - Number(a.urgente) || a.chegada - b.chegada);
}
export function criarFila(total: number): PacienteFila[] {
  return organizarFila(Array.from({ length: total }, (_, i) => ({
    id: `paciente-${i + 1}`, chegada: i + 1, urgente: i % 13 === 3,
  })));
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
