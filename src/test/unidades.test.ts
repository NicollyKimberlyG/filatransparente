import { describe, expect, it } from "vitest";
import { UNIDADES, correspondeUnidade } from "@/lib/unidades";

describe("Diretório informado", () => {
  it("inclui as 56 unidades fornecidas, sem repetir nomes", () => {
    expect(UNIDADES).toHaveLength(56);
    expect(new Set(UNIDADES.map(u => u.nome)).size).toBe(56);
    expect(UNIDADES.filter(u => u.tipo === "UBS")).toHaveLength(21);
    expect(UNIDADES.filter(u => u.tipo === "UPA 24h")).toHaveLength(12);
    expect(UNIDADES.filter(u => u.tipo === "Hospital")).toHaveLength(9);
  });
  it("preserva endereço e telefone da UBS República", () => {
    expect(UNIDADES.find(u => u.nome === "UBS República")).toMatchObject({
      bairro: "Centro", endereco: "Praça da Bandeira, 40 - Centro", telefone: "(11) 3241-5231",
    });
  });
  it("busca por nome sem acento, região e endereço", () => {
    const unidade = UNIDADES.find(u => u.nome === "UBS República");
    if (!unidade) throw new Error("Unidade ausente");
    expect(correspondeUnidade(unidade, "republica")).toBe(true);
    expect(correspondeUnidade(unidade, "Centro")).toBe(true);
    expect(correspondeUnidade(unidade, "Praça da Bandeira")).toBe(true);
    expect(correspondeUnidade(unidade, "Zona Norte")).toBe(false);
  });
});