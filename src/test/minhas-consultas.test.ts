import { describe, expect, it } from "vitest";
import { consultasDaConta } from "@/lib/minhas-consultas";

describe("consultasDaConta", () => {
  it("gera 2 ou 3 consultas estáveis com espera = ⌈posição ÷ vagas⌉", () => {
    const a = consultasDaConta("170.993.148-58");
    expect(a).toEqual(consultasDaConta("17099314858"));
    expect(a.length).toBeGreaterThanOrEqual(2);
    expect(a.length).toBeLessThanOrEqual(3);
    for (const c of a) expect(c.espera).toBe(Math.max(1, Math.ceil(c.posicao / c.vagas)));
  });
});
