import { describe, expect, it } from "vitest";
import { CPFS_EXEMPLO } from "@/lib/consulta-exemplos";

describe("CPFs de exemplo para consulta", () => {
  it("disponibiliza os doze exemplos fornecidos, preservando zeros iniciais", () => {
    expect(CPFS_EXEMPLO).toEqual([
      "170.993.148-58", "066.254.498-65", "457.308.328-69",
      "268.671.838-24", "092.726.708-02", "942.600.038-01",
      "557.175.648-99", "910.564.928-56", "082.425.138-56",
      "472.471.698-34", "417.400.618-02", "547.018.618-04",
    ]);
  });
});