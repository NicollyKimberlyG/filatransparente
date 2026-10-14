import { useMemo, useState } from "react";
import { MapPin, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Unidade = {
  nome: string;
  tipo: "UBS" | "UPA 24h" | "Hospital" | "AME";
  bairro: string;
  especialidades: { nome: string; vagas: number; naFila: number; espera: number }[];
};

export const UNIDADES: Unidade[] = [
  {
    nome: "UBS Jardim das Flores",
    tipo: "UBS",
    bairro: "Zona Norte",
    especialidades: [
      { nome: "Clínica Geral", vagas: 12, naFila: 148, espera: 12 },
      { nome: "Pediatria", vagas: 6, naFila: 40, espera: 6 },
      { nome: "Ginecologia", vagas: 4, naFila: 55, espera: 11 },
    ],
  },
  {
    nome: "UBS Vila Esperança",
    tipo: "UBS",
    bairro: "Zona Oeste",
    especialidades: [
      { nome: "Clínica Geral", vagas: 9, naFila: 87, espera: 8 },
      { nome: "Ginecologia", vagas: 7, naFila: 97, espera: 9 },
    ],
  },
  {
    nome: "UPA Central",
    tipo: "UPA 24h",
    bairro: "Centro",
    especialidades: [
      { nome: "Clínica Geral", vagas: 20, naFila: 35, espera: 1 },
      { nome: "Pediatria", vagas: 10, naFila: 62, espera: 3 },
      { nome: "Ortopedia", vagas: 3, naFila: 44, espera: 7 },
    ],
  },
  {
    nome: "Hospital Municipal São Lucas",
    tipo: "Hospital",
    bairro: "Zona Sul",
    especialidades: [
      { nome: "Cardiologia", vagas: 5, naFila: 512, espera: 45 },
      { nome: "Ortopedia", vagas: 4, naFila: 389, espera: 38 },
      { nome: "Clínica Geral", vagas: 8, naFila: 120, espera: 15 },
    ],
  },
  {
    nome: "AME Especialidades",
    tipo: "AME",
    bairro: "Zona Leste",
    especialidades: [
      { nome: "Oftalmologia", vagas: 6, naFila: 204, espera: 21 },
      { nome: "Cardiologia", vagas: 3, naFila: 260, espera: 32 },
      { nome: "Ortopedia", vagas: 2, naFila: 150, espera: 25 },
    ],
  },
];

export const ESPECIALIDADES = Array.from(
  new Set(UNIDADES.flatMap((u) => u.especialidades.map((e) => e.nome))),
).sort();

export function unidadesDa(especialidade: string) {
  return UNIDADES.flatMap((u) =>
    u.especialidades
      .filter((e) => e.nome === especialidade)
      .map((e) => ({ unidade: u, ...e })),
  ).sort((a, b) => a.espera - b.espera);
}

const PRIORIDADES = ["Urgente", "Prioritário", "Normal", "Normal", "Normal"];

function FilaLista({ total, minhaPosicao }: { total: number; minhaPosicao: number }) {
  const inicio = Math.max(1, minhaPosicao - 4);
  const fim = Math.min(total, minhaPosicao + 3);
  const linhas = [];
  for (let p = inicio; p <= fim; p++) linhas.push(p);
  return (
    <ol className="space-y-1.5" aria-label="Fila de atendimento">
      {inicio > 1 && (
        <li className="text-center text-xs text-muted-foreground">
          … {inicio - 1} pessoas à frente
        </li>
      )}
      {linhas.map((p) => {
        const eu = p === minhaPosicao;
        return (
          <li
            key={p}
            aria-current={eu ? "true" : undefined}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
              eu ? "border-primary bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <span className="flex items-center gap-2 font-semibold">
              <span className="w-8 tabular-nums">{p}º</span>
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {eu ? "Você" : `Paciente ***${String((p * 7919) % 1000).padStart(3, "0")}`}
            </span>
            <span className={`text-xs ${eu ? "" : "text-muted-foreground"}`}>
              {eu ? "Sua posição" : PRIORIDADES[p % PRIORIDADES.length]}
            </span>
          </li>
        );
      })}
      {fim < total && (
        <li className="text-center text-xs text-muted-foreground">
          … mais {total - fim} pessoas atrás
        </li>
      )}
    </ol>
  );
}

function posicaoPorProtocolo(protocolo: string, total: number) {
  let h = 0;
  for (const c of protocolo) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return (h % total) + 1;
}

function formatarCpfCns(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 15);
  if (d.length <= 11) {
    // CPF: 000.000.000-00
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // CNS: 000 0000 0000 0000
  return d.replace(/(\d{3})(\d{4})(\d{4})(\d{0,4})/, "$1 $2 $3 $4").trim();
}

function validarCpfCns(valor: string) {
  const d = valor.replace(/\D/g, "");
  return d.length === 11 || d.length === 15;
}

export function PosicaoDialog({
  open,
  onOpenChange,
  especialidadeInicial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  especialidadeInicial?: string | undefined;
}) {
  const [documento, setDocumento] = useState("");
  const [erroDoc, setErroDoc] = useState("");
  const [esp, setEsp] = useState<string>(especialidadeInicial ?? ESPECIALIDADES[0] ?? "");
  const opcoes = unidadesDa(esp);
  const [unidadeNome, setUnidadeNome] = useState(opcoes[0]?.unidade.nome ?? "");
  const [resultado, setResultado] = useState<null | {
    posicao: number;
    total: number;
    vagas: number;
    espera: number;
    unidade: string;
  }>(null);

  const selecionada = opcoes.find((o) => o.unidade.nome === unidadeNome) ?? opcoes[0];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setResultado(null);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Consultar minha posição</DialogTitle>
          <DialogDescription>
            Informe seu CPF ou Cartão Nacional de Saúde (CNS). Seus dados não são exibidos.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selecionada) return;
            if (!validarCpfCns(documento)) {
              setErroDoc("Digite um CPF (11 dígitos) ou CNS (15 dígitos) válido.");
              return;
            }
            setErroDoc("");
            const total = selecionada.naFila;
            const posicao = posicaoPorProtocolo(documento.replace(/\D/g, ""), total);
            setResultado({
              posicao,
              total,
              vagas: selecionada.vagas,
              espera: Math.max(1, Math.ceil((posicao / total) * selecionada.espera)),
              unidade: selecionada.unidade.nome,
            });
          }}
        >
          <label className="block text-sm font-medium">
            CPF ou Cartão Nacional de Saúde (CNS)
            <input
              value={documento}
              onChange={(e) => {
                setDocumento(formatarCpfCns(e.target.value));
                setErroDoc("");
              }}
              placeholder="000.000.000-00 ou 000 0000 0000 0000"
              inputMode="numeric"
              autoComplete="off"
              required
              aria-invalid={!!erroDoc}
              aria-describedby={erroDoc ? "erro-documento" : undefined}
              className="mt-1 h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          {erroDoc && (
            <p id="erro-documento" role="alert" className="text-sm font-medium text-destructive">
              {erroDoc}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Especialidade
              <select
                value={esp}
                onChange={(e) => {
                  setEsp(e.target.value);
                  setUnidadeNome(unidadesDa(e.target.value)[0]?.unidade.nome ?? "");
                  setResultado(null);
                }}
                className="mt-1 h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
              >
                {ESPECIALIDADES.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Unidade
              <select
                value={selecionada?.unidade.nome}
                onChange={(e) => {
                  setUnidadeNome(e.target.value);
                  setResultado(null);
                }}
                className="mt-1 h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
              >
                {opcoes.map((o) => (
                  <option key={o.unidade.nome}>{o.unidade.nome}</option>
                ))}
              </select>
            </label>
          </div>
          <button className="h-11 w-full rounded-lg bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
            Ver minha posição
          </button>
        </form>

        {resultado && (
          <div className="mt-2 space-y-4" aria-live="polite">
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Sua posição</p>
                <p className="text-xl font-bold text-primary">{resultado.posicao}º</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Na fila</p>
                <p className="text-xl font-bold">{resultado.total}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Espera estimada</p>
                <p className="text-xl font-bold">{resultado.espera} dias</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {resultado.unidade} · {resultado.vagas} vagas por dia
            </p>
            <FilaLista total={resultado.total} minhaPosicao={resultado.posicao} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function EspecialidadeDialog({
  especialidade,
  onClose,
  onConsultar,
}: {
  especialidade: string | null;
  onClose: () => void;
  onConsultar: (esp: string) => void;
}) {
  const lista = useMemo(
    () => (especialidade ? unidadesDa(especialidade) : []),
    [especialidade],
  );
  const total = lista.reduce((s, l) => s + l.naFila, 0);
  const vagas = lista.reduce((s, l) => s + l.vagas, 0);

  return (
    <Dialog open={!!especialidade} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{especialidade}</DialogTitle>
          <DialogDescription>
            {lista.length} unidades disponíveis · {total} pessoas na fila · {vagas} vagas/dia
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {lista.map((l, i) => (
            <li key={l.unidade.nome} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {l.unidade.tipo}
                  </span>
                  <p className="mt-2 font-bold">{l.unidade.nome}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {l.unidade.bairro}
                  </p>
                </div>
                {i === 0 && (
                  <span className="rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                    Menor espera
                  </span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-muted p-2 text-center text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Na fila</p>
                  <p className="font-bold">{l.naFila}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vagas/dia</p>
                  <p className="font-bold">{l.vagas}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Espera</p>
                  <p className="font-bold">{l.espera} dias</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={() => especialidade && onConsultar(especialidade)}
          className="h-11 w-full rounded-lg bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
        >
          Consultar minha posição nesta fila
        </button>
      </DialogContent>
    </Dialog>
  );
}
