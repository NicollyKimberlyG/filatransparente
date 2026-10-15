export type PacienteFila = { id: string; chegada: number; urgente: boolean };
// Urgency is assigned by clinical assessment, never by a patient-facing control.
export function organizarFila<T extends PacienteFila>(pacientes: readonly T[]): T[] {
  return [...pacientes].sort((a, b) => Number(b.urgente) - Number(a.urgente) || a.chegada - b.chegada);
}
export function criarFilaDemonstrativa(total: number): PacienteFila[] {
  return organizarFila(Array.from({ length: total }, (_, i) => ({
    id: `paciente-${i + 1}`, chegada: i + 1, urgente: i % 13 === 3,
  })));
}
export function pacientePorDocumento(documento: string, total: number) {
  let h = 0;
  for (const c of documento.replace(/\D/g, "")) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return `paciente-${(h % total) + 1}`;
}
