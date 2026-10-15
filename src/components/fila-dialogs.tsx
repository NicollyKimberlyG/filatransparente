import { useMemo, useState } from "react";
import { MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { nomeDemonstrativoPorDocumento } from "@/lib/consulta-exemplos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export { UNIDADES, ESPECIALIDADES, unidadesDa } from "@/lib/unidades";
import { ESPECIALIDADES, unidadesDa } from "@/lib/unidades";
import { criarFilaDemonstrativa, pacientePorDocumento, type PacienteFila } from "@/lib/fila";

function FilaLista({ fila, minhaPosicao, nome }: { fila: PacienteFila[]; minhaPosicao: number; nome: string }) {
  const total = fila.length;
  const inicio = Math.max(1, minhaPosicao - 4);
  const fim = Math.min(total, minhaPosicao + 3);
  const linhas = [];
  for (let p = inicio; p <= fim; p++) linhas.push(p);
  const prioridades = fila.filter(p => p.urgente).length;
  if (inicio > 1) linhas.unshift(...Array.from({ length: Math.min(3, inicio - 1) }, (_, i) => i + 1));
  return (
    <ol className="space-y-1.5" aria-label="Fila de atendimento">
      {inicio > 1 && (
        <li className="text-center text-xs text-muted-foreground">
          {prioridades} urgências na frente · demais por chegada
        </li>
      )}
      {linhas.map((p) => {
        const eu = p === minhaPosicao;
        const paciente = fila[p - 1];
        return (
          <li
            key={p}
            aria-current={eu ? "true" : undefined}
            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
              eu ? "border-primary bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 font-semibold">
              <span className="w-8 shrink-0 tabular-nums">{p}º</span>
              <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="break-words">{eu ? `${nome} (Você)` : `Paciente ***${String(((paciente?.chegada ?? p) * 7919) % 1000).padStart(3, "0")}`}</span>
            </span>
            <span className={`shrink-0 text-xs ${eu ? "" : "text-muted-foreground"}`}>
              {paciente?.urgente ? "Urgência · Prioridade" : "Ordem de chegada"}
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
    fila: PacienteFila[];
    posicao: number;
    total: number;
    vagas: number;
    espera: number;
    unidade: string;
    nome: string;
    documento: string;
  }>(null);

  const selecionada = opcoes.find((o) => o.unidade.nome === unidadeNome) ?? opcoes[0];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setResultado(null);
          setDocumento("");
          setErroDoc("");
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Consultar minha posição</DialogTitle>
          <DialogDescription>
            Consulta demonstrativa: nomes fictícios e posições simuladas, sem vínculo com cadastros reais do SUS.
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
            const fila = criarFilaDemonstrativa(total);
            const id = pacientePorDocumento(documento, total);
            const posicao = fila.findIndex(p => p.id === id) + 1;
            setResultado({
              fila,
              posicao,
              total,
              vagas: selecionada.vagas,
              espera: Math.max(1, Math.ceil((posicao / total) * selecionada.espera)),
              unidade: selecionada.unidade.nome,
              nome: nomeDemonstrativoPorDocumento(documento),
              documento: formatarCpfCns(documento),
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
                setResultado(null);
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
          <Button type="submit" className="h-11 w-full rounded-lg font-semibold">
            Ver minha posição
          </Button>
        </form>

        {resultado && (
          <div className="mt-2 space-y-4" aria-live="polite">
            <div className="space-y-1 border-b pb-3" aria-label="Identificação da consulta">
              <p className="break-words font-semibold">{resultado.nome}</p>
              <p className="text-sm text-muted-foreground">
                {resultado.documento.replace(/\D/g, "").length === 11 ? "CPF" : "CNS"}: {resultado.documento}
              </p>
              <p className="text-xs text-muted-foreground">Nome fictício · Consulta demonstrativa</p>
            </div>
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
            <p className="text-xs text-muted-foreground">Urgências primeiro, por chegada. Depois, os demais pacientes por chegada. Classificação clínica simulada.</p>
            <FilaLista fila={resultado.fila} minhaPosicao={resultado.posicao} nome={resultado.nome} />
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
            Dados demonstrativos · {lista.length} unidades disponíveis · {total} pessoas na fila · {vagas} vagas/dia
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {lista.map((l, i) => (
            <li key={l.unidade.nome} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {l.unidade.tipo}
                  </span>
                  <p className="mt-2 font-bold">{l.unidade.nome}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{l.unidade.endereco}</p>
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
        <Button
          onClick={() => especialidade && onConsultar(especialidade)}
          className="h-11 w-full rounded-lg bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
        >
          Consultar minha posição nesta fila
        </Button>
      </DialogContent>
    </Dialog>
  );
}
