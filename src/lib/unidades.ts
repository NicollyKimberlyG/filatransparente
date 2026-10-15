export type Unidade = {
  nome: string;
  tipo: "UBS" | "UPA 24h" | "Hospital" | "AME" | "AMA Especialidades";
  bairro: string;
  endereco: string;
  telefone?: string | undefined;
  descricao?: string | undefined;
  especialidades: { nome: string; vagas: number; naFila: number; espera: number }[];
};

// Directory supplied by the user; contacts and locations have not been independently verified.
const diretorio = `UBS|Centro|UBS República|Praça da Bandeira, 40 - Centro|(11) 3241-5231
UBS|Centro|UBS Humaitá|Rua Humaitá, 520 - Bela Vista|(11) 4210-5615
UBS|Centro|UBS Cambuci|Av. Lacerda Franco, 795 - Cambuci|(11) 4210-5428
UBS|Centro|UBS Dr. Humberto Pascale (Santa Cecília)|Rua Vitorino Carmilo, 599 - Barra Funda|(11) 5193-0005
UBS|Zona Sul|UBS Vila Mariana|Rua Dr. Diogo de Faria, 623 - Vila Mariana|(11) 5084-2575
UBS|Zona Sul|UBS Jabaquara|Rua Genaro de Carvalho, 101 - Jabaquara|(11) 5021-3644
UBS|Zona Sul|UBS Santo Amaro|Rua Promotor Gabriel Nettuzzi Perez, 159 - Santo Amaro|(11) 5521-1748
UBS|Zona Sul|UBS Jardim Interlagos|Rua Guaiuba, 750 - Interlagos|(11) 5666-5120
UBS|Zona Leste|UBS Belenzinho|Rua Elói Cerqueira, 194 - Belenzinho|(11) 2692-7476
UBS|Zona Leste|UBS Tatuapé|Rua Santa Virgínia, 569 - Tatuapé|(11) 2942-8812
UBS|Zona Leste|UBS Mooca|Rua Taquari, 549 - Mooca|(11) 2694-1188
UBS|Zona Leste|UBS Itaquera|Rua Américo Salvador Novelli, 265 - Itaquera|(11) 2071-3329
UBS|Zona Leste|UBS Penha|Praça Nossa Senhora da Penha, 54 - Penha de França|(11) 2295-5386
UBS|Zona Norte|UBS Santana|Rua Dr. César, 70 - Santana|(11) 2979-4672
UBS|Zona Norte|UBS Vila Maria|Rua Prof. João de Oliveira, 15 - Vila Maria|(11) 2954-4699
UBS|Zona Norte|UBS Tucuruvi|Av. Nova Cantareira, 1583 - Tucuruvi|(11) 2991-6284
UBS|Zona Norte|UBS Casa Verde|Rua Dr. Samuel Porto, 59 - Casa Verde|(11) 3858-3721
UBS|Zona Oeste|UBS Itaim Bibi|Rua João Cachoeira, 452 - Itaim Bibi|(11) 3168-5226
UBS|Zona Oeste|UBS Lapa|Rua George Smith, 303 - Lapa|(11) 3836-8153
UBS|Zona Oeste|UBS Pinheiros|Av. Frederico Hermann Júnior, 259 - Alto de Pinheiros|(11) 3031-2856
UBS|Zona Oeste|UBS Perdizes (Dr. Jairo Ramos)|Rua Desembargador do Vale, 616 - Perdizes|(11) 3864-1627
UPA 24h|Centro|UPA Vergueiro|Rua Vergueiro, 958 - Liberdade|(11) 3208-4100
UPA 24h|Zona Sul|UPA Vila Mariana|Rua Dr. Diogo de Faria, 611 - Vila Mariana|(11) 5081-3001
UPA 24h|Zona Sul|UPA Santo Amaro - Dr. José Sylvio de Camargo|Rua Promotor Gabriel Nettuzzi Perez, 159 - Santo Amaro|(11) 5683-2944
UPA 24h|Zona Sul|UPA Jabaquara|Rua Jamil Chaddad, 132 - Jabaquara|(11) 5588-2022
UPA 24h|Zona Leste|UPA Tatuapé - Dr. Carmino Caricchio|Av. Celso Garcia, 4815 - Tatuapé|(11) 3394-6980
UPA 24h|Zona Leste|UPA Itaquera|Rua Américo Salvador Novelli, 265 - Itaquera|(11) 2071-3329
UPA 24h|Zona Leste|UPA Carrão|Av. Conselheiro Carrão, 2855 - Vila Carrão|(11) 2092-2342
UPA 24h|Zona Norte|UPA Santana|Rua Dr. César, 70 - Santana|(11) 2979-4672
UPA 24h|Zona Norte|UPA Vila Maria|Rua Prof. João de Oliveira, 15 - Vila Maria|(11) 2954-4699
UPA 24h|Zona Norte|UPA Perus|Rua Bernardo José de Lorena, s/n - Perus|(11) 3917-1002
UPA 24h|Zona Oeste|UPA Lapa|Rua George Smith, 303 - Lapa|(11) 3836-8153
UPA 24h|Zona Oeste|UPA Jaguaré|Av. Presidente Altino, 836 - Jaguaré|(11) 3719-2166
Hospital|Centro|Hospital das Clínicas da FMUSP (HC)|Av. Dr. Enéas Carvalho de Aguiar, 255 - Cerqueira César||O maior complexo hospitalar da América Latina, referência em casos raros e alta complexidade.
Hospital|Centro|Santa Casa de Misericórdia de São Paulo|Rua Dr. Cesário Mota Júnior, 112 - Vila Buarque||Hospital filantrópico tradicional com pronto-socorro geral de grande porte.
Hospital|Zona Sul|Hospital Municipal Dr. Arthur Ribeiro de Saboya (Jabaquara)|Av. Francisco de Paula Quintanilha Ribeiro, 860 - Jabaquara||Grande referência em traumatologia e emergências cirúrgicas na Zona Sul.
Hospital|Zona Sul|Hospital Municipal Dr. Carmino Caricchio (Tatuapé)|Av. Celso Garcia, 4815 - Tatuapé||Atende também a Zona Leste. Referência em queimaduras graves, cirurgia plástica reparadora e traumas.
Hospital|Zona Leste|Hospital Estadual Vila Alpina|Av. Francisco Falconi, 1501 - Vila Alpina||Hospital geral de alta resolutividade, referência para a região de Sapopemba e Vila Prudente.
Hospital|Zona Leste|Hospital Municipal Prof. Dr. Alípio Corrêa Netto (Ermelino Matarazzo)|Al. Rodrigo de Brum, 1989 - Ermelino Matarazzo||Pronto-socorro de grande movimento e referência em neurocirurgia e ortopedia na Zona Leste superior.
Hospital|Zona Norte|Hospital Municipal Dr. Mário Gatti (Vila Nova Cachoeirinha)|Av. Dep. Emílio Carlos, 3100 - Vila Nova Cachoeirinha||Maternidade-Escola, referência em parto de alto risco e saúde da mulher do estado.
Hospital|Zona Norte|Hospital Geral de Taipas|Av. Fernão Dias Falcão, 401 - Parada de Taipas||Atendimento médico-hospitalar para o extremo norte da cidade.
Hospital|Zona Oeste|Hospital Regional Sul / Hospital Universitário da USP|Av. Prof. Lineu Prestes, 2565 - Cidade Universitária||Atendimento regional e de média/alta complexidade integrado à universidade.
AME|Centro|AME Maria Zélia|R. Jequitinhonha, 368 - Catumbi||Centro / Leste Próximo. Referência em dezenas de especialidades médicas e exames.
AMA Especialidades|Centro|AMA Especialidades Santa Cecília|R. Vitorino Carmilo, 599 - Barra Funda||Atendimento central integrado.
AME|Zona Sul|AME Idoso Sudeste (Vila Mariana)|R. Domingos de Morais, 1947 - Vila Mariana||Atendimento geriátrico integral.
AME|Zona Sul|AME Interlagos|R. Artur Nascimento Júnior, 120 - Interlagos||Atende Capela do Socorro e Cidade Dutra.
AME|Zona Sul|AME Heliópolis (Dr. Luiz Roberto Barradas Barata)|Av. Almirante Delamare, 1534 - Vila Heliópolis||Consultas e cirurgias ambulatoriais.
AMA Especialidades|Zona Sul|AMA Especialidades Capão Redondo|Av. Comendador Sant'Anna, 774 - Capão Redondo||Referência de especialidades no extremo sul.
AMA Especialidades|Zona Leste|AMA Especialidades Itaquera|R. Américo Salvador Novelli, 265 - Itaquera||Acoplado ao complexo de saúde da região.
AMA Especialidades|Zona Leste|AMA Especialidades Guaianases|R. Hipólito de Camargo, 180 - Guaianases||Referência para o extremo leste.
AMA Especialidades|Zona Leste|AMA Especialidades Vila Carrão|R. Dr. Jaci Barbosa, 280 - Vila Carrão
AME|Zona Norte|AME Vila Maria|Av. Guilherme Cotching, 1600 - Vila Maria||Consultas especializadas e exames por imagem na ZN.
AMA Especialidades|Zona Norte|AMA Especialidades Peri Peri|R. Antenor de Oliveira Salazar, 122 - Conj. Hab. Antenor de Oliveira Salazar
AMA Especialidades|Zona Norte|AMA Especialidades Vila Zatt|Rua Visconde de Indaiatuba, 102 - Vila Zatt||Atende a região de Pirituba.
AME|Zona Oeste|AME Idoso Oeste (Lapa)|Rua Roma, 466 - Lapa||Centro especializado em reabilitação e geriatria.
AMA Especialidades|Zona Oeste|AMA Especialidades Jardim Peri Peri|R. Dr. Jequitinhonha, 13 - Jardim Peri Peri||Atende a região do Butantã.`;

const ofertas: Record<Unidade["tipo"], string[]> = {
  UBS: ["Clínica Geral", "Pediatria", "Ginecologia", "Saúde da Família", "Odontologia"],
  "UPA 24h": ["Clínica Geral", "Pediatria", "Ortopedia"],
  Hospital: ["Clínica Geral", "Cardiologia", "Ortopedia", "Neurologia", "Cirurgia Geral", "Ginecologia", "Obstetrícia", "Urologia"],
  AME: ["Cardiologia", "Oftalmologia", "Ortopedia", "Dermatologia", "Endocrinologia", "Geriatria", "Gastroenterologia", "Otorrinolaringologia", "Fisioterapia"],
  "AMA Especialidades": ["Cardiologia", "Oftalmologia", "Dermatologia", "Endocrinologia", "Neurologia", "Urologia", "Gastroenterologia", "Otorrinolaringologia"],
};

// All offerings, capacity, waiting times and queues below are fictional demo fixtures, not real patient records.
export const UNIDADES: Unidade[] = diretorio.split("\n").map((linha, i) => {
  const [tipoTexto = "UBS", bairro = "", nome = "", endereco = "", telefone, descricao] = linha.split("|");
  const tipo = tipoTexto as Unidade["tipo"];
  return { nome, tipo, bairro, endereco, telefone: telefone || undefined, descricao,
    especialidades: ofertas[tipo].map((nome, j) => ({ nome, vagas: 3 + (i + j) % 14, naFila: 35 + (i * 17 + j * 23) % 230, espera: 3 + (i * 3 + j * 7) % 40 })),
  };
});
export const REGIOES = ["Centro", "Zona Sul", "Zona Leste", "Zona Norte", "Zona Oeste"];
export const ESPECIALIDADES = Array.from(new Set(UNIDADES.flatMap(u => u.especialidades.map(e => e.nome)))).sort((a,b) => a.localeCompare(b, "pt-BR"));
export function unidadesDa(especialidade: string) {
  return UNIDADES.flatMap(unidade => unidade.especialidades.filter(e => e.nome === especialidade).map(e => ({ unidade, ...e }))).sort((a,b) => a.espera - b.espera);
}
export function normalizarBusca(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
export function correspondeUnidade(u: Unidade, termo: string) {
  return normalizarBusca([u.nome, u.tipo, u.bairro, u.endereco, ...u.especialidades.map(e => e.nome)].join(" ")).includes(normalizarBusca(termo));
}
