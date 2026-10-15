import { describe, expect, it } from "vitest";
import { CPFS_EXEMPLO, nomeDemonstrativoPorDocumento } from "@/lib/consulta-exemplos";

describe("CPFs de exemplo para consulta", () => {
  it("disponibiliza os doze exemplos fornecidos, preservando zeros iniciais", () => {
    expect(CPFS_EXEMPLO).toEqual([
      "170.993.148-58", "066.254.498-65", "457.308.328-69",
      "268.671.838-24", "092.726.708-02", "942.600.038-01",
      "557.175.648-99", "910.564.928-56", "082.425.138-56",
      "472.471.698-34", "417.400.618-02", "547.018.618-04",
    ]);
  });
  it("associa um nome fictício a cada CPF consultado, com ou sem formatação", () => {
    const nomes = [
      "Mariana Costa", "Lucas Almeida", "Beatriz Santos", "Gabriel Oliveira",
      "Camila Ferreira", "Rafael Lima", "Juliana Martins", "Felipe Souza",
      "Larissa Rocha", "Bruno Ribeiro", "Amanda Pereira", "Diego Carvalho",
    ];
    CPFS_EXEMPLO.forEach((cpf, indice) => {
      expect(nomeDemonstrativoPorDocumento(cpf)).toBe(nomes[indice]);
      expect(nomeDemonstrativoPorDocumento(cpf.replace(/\D/g, ""))).toBe(nomes[indice]);
    });
  });
  it("não associa o nome de outro exemplo a um documento desconhecido", () => {
    expect(nomeDemonstrativoPorDocumento("00000000000")).toBe("Paciente demonstrativo");
  });
});