import { describe, expect, it } from "vitest";
import { esperaEstimada, identificacaoPublica } from "@/lib/fila";
import { UNIDADES, distritoDe } from "@/lib/unidades";
describe("Cálculo e privacidade", () => {
  it("244 pessoas com 14 vagas/dia levam 18 dias", () => expect(esperaEstimada(244, 14)).toBe(18));
  it("mostra só iniciais e 3 dígitos do cartão SUS", () => expect(identificacaoPublica(5, "Mariana Costa")).toMatch(/^M\.C\. · SUS: \d{3}xxxxxxx$/));
  it("extrai o bairro do endereço", () => expect(distritoDe(UNIDADES.find(u => u.nome === "UBS Santo Amaro")!)).toBe("Santo Amaro"));
});
