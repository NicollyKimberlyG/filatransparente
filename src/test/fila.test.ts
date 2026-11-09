import { describe, expect, it } from "vitest";
import { organizarFila, criarFila } from "@/lib/fila";
const normal = (id: string, chegada: number) => ({ id, chegada, urgente: false });
const urgente = (id: string, chegada: number) => ({ id, chegada, urgente: true });
describe("Ordem da fila", () => {
  it("atende pacientes comuns pela ordem de chegada", () => {
    expect(organizarFila([normal("terceiro", 3), normal("primeiro", 1), normal("segundo", 2)]).map(p => p.id)).toEqual(["primeiro", "segundo", "terceiro"]);
  });
  it("coloca a urgência à frente dos atendimentos comuns", () => {
    expect(organizarFila([normal("comum", 1), urgente("urgencia", 2)]).map(p => p.id)).toEqual(["urgencia", "comum"]);
  });
  it("coloca uma nova urgência após as prioridades já aguardando", () => {
    const fila = [urgente("prioridade-1", 2), urgente("prioridade-2", 4), normal("comum", 1)];
    expect(organizarFila([...fila, urgente("nova-prioridade", 5)]).map(p => p.id)).toEqual(["prioridade-1", "prioridade-2", "nova-prioridade", "comum"]);
  });
  it("mantém a fila de exemplo inteira na mesma regra", () => {
    const fila = criarFila(148);
    expect(fila).toHaveLength(148);
    expect(fila.filter(p => p.urgente).map(p => p.chegada).sort((a, b) => a - b)).toEqual([4,17,30,43,56,69,82,95,108,121,134,147]);
  });
  it("atende vermelho antes de laranja, amarelo, verde e azul", () => {
    const n = (id: string, chegada: number, nivel: "vermelho" | "laranja" | "amarelo" | "verde" | "azul") => ({ id, chegada, urgente: false, nivel });
    expect(organizarFila([n("azul", 1), n("verde", 2), n("amarelo", 3), n("laranja", 4), n("vermelho", 5)]).map(p => p.id)).toEqual(["vermelho", "laranja", "amarelo", "verde", "azul"]);
  });
  it("mantém a ordem de chegada dentro da mesma cor", () => {
    const fila = criarFila(148);
    expect(fila.slice(0, 12).every(p => p.urgente)).toBe(true);
    expect(fila[12]?.chegada).toBe(1);
  });
});
