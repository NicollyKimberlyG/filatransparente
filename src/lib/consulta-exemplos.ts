export const CPFS_EXEMPLO = [
  "170.993.148-58",
  "066.254.498-65",
  "457.308.328-69",
  "268.671.838-24",
  "092.726.708-02",
  "942.600.038-01",
  "557.175.648-99",
  "910.564.928-56",
  "082.425.138-56",
  "472.471.698-34",
  "417.400.618-02",
  "547.018.618-04",
] as const;

const NOMES_FICTICIOS = [
  "Mariana Costa", "Lucas Almeida", "Beatriz Santos", "Gabriel Oliveira",
  "Camila Ferreira", "Rafael Lima", "Juliana Martins", "Felipe Souza",
  "Larissa Rocha", "Bruno Ribeiro", "Amanda Pereira", "Diego Carvalho",
] as const;

export function nomeDemonstrativoPorDocumento(documento: string): string {
  const digitos = documento.replace(/\D/g, "");
  const indice = CPFS_EXEMPLO.findIndex((cpf) => cpf.replace(/\D/g, "") === digitos);
  return NOMES_FICTICIOS[indice] ?? "Paciente demonstrativo";
}