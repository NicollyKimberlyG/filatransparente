import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ESPECIALIDADES,
  EspecialidadeDialog,
  PosicaoDialog,
  UNIDADES,
  unidadesDa,
} from "@/components/fila-dialogs";
import {
  Activity,
  ArrowRight,
  Building2,
  Clock3,
  Eye,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SUS Fila Transparente — Acompanhe filas de atendimento em tempo real" },
      {
        name: "description",
        content:
          "Visualize publicamente as filas de atendimento médico do SUS: tempo de espera, posição na fila e transparência total para cidadãos e gestores.",
      },
      { property: "og:title", content: "SUS Fila Transparente" },
      {
        property: "og:description",
        content:
          "Transparência pública das filas de atendimento médico do SUS, em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function nivelDe(espera: number) {
  return espera <= 10 ? "baixa" : espera <= 25 ? "moderada" : "alta";
}

const filasTodas = ESPECIALIDADES.map((esp) => {
  const l = unidadesDa(esp);
  const pessoas = l.reduce((s, x) => s + x.naFila, 0);
  const espera = Math.round(l.reduce((s, x) => s + x.espera * x.naFila, 0) / pessoas);
  return { especialidade: esp, unidades: l, pessoas, espera, vagas: l.reduce((s, x) => s + x.vagas, 0), nivel: nivelDe(espera) };
});

function NivelBadge({ nivel }: { nivel: string }) {
  const styles: Record<string, string> = {
    baixa: "bg-success/15 text-success",
    moderada: "bg-warning/25 text-warning-foreground",
    alta: "bg-destructive/15 text-destructive",
  };
  const labels: Record<string, string> = {
    baixa: "Fila baixa",
    moderada: "Fila moderada",
    alta: "Fila alta",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[nivel]}`}
    >
      <span
        className={`status-dot ${
          nivel === "baixa"
            ? "bg-success"
            : nivel === "moderada"
              ? "bg-warning"
              : "bg-destructive"
        }`}
        aria-hidden="true"
      />
      {labels[nivel]}
    </span>
  );
}

function Index() {
  const [busca, setBusca] = useState("");
  const [termo, setTermo] = useState("");
  const [espAberta, setEspAberta] = useState<string | null>(null);
  const [posicaoOpen, setPosicaoOpen] = useState(false);
  const [posicaoEsp, setPosicaoEsp] = useState<string | undefined>();
  const t = termo.trim().toLowerCase();
  const filas = filasTodas.filter(
    (f) =>
      !t ||
      f.especialidade.toLowerCase().includes(t) ||
      f.unidades.some((u) => u.unidade.nome.toLowerCase().includes(t) || u.unidade.tipo.toLowerCase().includes(t)),
  );
  const unidades = UNIDADES.filter(
    (u) =>
      !t ||
      u.nome.toLowerCase().includes(t) ||
      u.tipo.toLowerCase().includes(t) ||
      u.especialidades.some((e) => e.nome.toLowerCase().includes(t)),
  );
  const abrirPosicao = (esp?: string) => {
    setEspAberta(null);
    setPosicaoEsp(esp);
    setPosicaoOpen(true);
  };
  const buscar = () => {
    setTermo(busca);
    document.getElementById("filas")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Barra de acessibilidade */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs font-medium">
          <span>Governo Municipal · Secretaria de Saúde</span>
          <div className="flex items-center gap-4">
            <a href="#conteudo" className="underline underline-offset-2">
              Ir para o conteúdo
            </a>
            <span aria-hidden="true">A+ A-</span>
            <span>Alto contraste</span>
          </div>
        </div>
      </div>

      {/* Cabeçalho */}
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">SUS Fila Transparente</p>
              <p className="text-xs text-muted-foreground">
                Transparência pública em saúde
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#filas" className="hover:text-primary">
              Filas
            </a>
            <a href="#unidades" className="hover:text-primary">
              Unidades
            </a>
            <a href="#transparencia" className="hover:text-primary">
              Transparência
            </a>
            <button onClick={() => abrirPosicao()} className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
              Consultar minha posição
            </button>
          </nav>
        </div>
      </header>

      <main id="conteudo">
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-secondary to-background">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Dados públicos atualizados em tempo real
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Acompanhe as filas de atendimento do SUS da sua cidade
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Consulte o tempo de espera, o número de pessoas aguardando e a
                situação de cada especialidade — sem precisar de cadastro.
              </p>
              <form
                className="mt-6 flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  buscar();
                }}
              >
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    list="sugestoes"
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value);
                      if (!e.target.value) setTermo("");
                    }}
                    placeholder="Busque por especialidade ou unidade de saúde"
                    aria-label="Buscar especialidade ou unidade de saúde"
                    className="h-12 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2"
                  />
                  <datalist id="sugestoes">
                    {[...ESPECIALIDADES, ...UNIDADES.map((u) => u.nome)].map((v) => (
                      <option key={v} value={v} />
                    ))}
                  </datalist>
                </div>
                <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  Buscar
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
              <button
                onClick={() => abrirPosicao()}
                className="mt-3 text-sm font-semibold text-primary underline underline-offset-2 md:hidden"
              >
                Consultar minha posição
              </button>
            </div>

            {/* Indicadores */}
            <dl className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: Users, valor: "1.412", rotulo: "Pessoas em filas hoje" },
                { icon: Clock3, valor: "18 dias", rotulo: "Espera média geral" },
                { icon: Building2, valor: "34", rotulo: "Unidades monitoradas" },
                { icon: Activity, valor: "-12%", rotulo: "Redução no mês" },
              ].map((item) => (
                <div
                  key={item.rotulo}
                  className="rounded-xl border bg-card p-5 shadow-sm"
                >
                  <item.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <dt className="mt-3 text-sm text-muted-foreground">{item.rotulo}</dt>
                  <dd className="mt-1 text-2xl font-bold">{item.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Filas por especialidade */}
        <section id="filas" className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Filas por especialidade
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Atualizado hoje às 08h30 · Fonte: sistema municipal de regulação
              </p>
            </div>
            {t && (
              <button
                onClick={() => {
                  setBusca("");
                  setTermo("");
                }}
                className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Limpar busca “{termo}”
              </button>
            )}
          </div>

          {filas.length === 0 && (
            <p className="mt-8 rounded-xl border bg-card p-6 text-center text-muted-foreground">
              Nenhuma especialidade ou unidade encontrada para “{termo}”.
            </p>
          )}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {filas.map((fila) => (
              <button
                type="button"
                key={fila.especialidade}
                onClick={() => setEspAberta(fila.especialidade)}
                aria-label={`Ver unidades e fila de ${fila.especialidade}`}
                className="rounded-xl border bg-card p-5 text-left shadow-sm transition-shadow hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Stethoscope className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold">{fila.especialidade}</h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {fila.unidades.length} unidades · {fila.vagas} vagas/dia
                      </p>
                    </div>
                  </div>
                  <NivelBadge nivel={fila.nivel} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-muted p-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Espera estimada</p>
                    <p className="mt-0.5 font-bold">{fila.espera} dias</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Na fila</p>
                    <p className="mt-0.5 font-bold">{fila.pessoas} pessoas</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Melhor opção</p>
                    <p className="mt-0.5 truncate font-bold">{fila.unidades[0]?.unidade.tipo} · {fila.unidades[0]?.espera}d</p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-primary">Ver unidades disponíveis →</p>
              </button>
            ))}
          </div>
        </section>

        {/* Unidades de saúde */}
        <section id="unidades" className="border-y bg-secondary/50">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-2xl font-bold md:text-3xl">Unidades de saúde</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visão geral das unidades com filas monitoradas
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {unidades.map((u) => (
                <article
                  key={u.nome}
                  className="rounded-xl border bg-card p-5 shadow-sm"
                >
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {u.tipo}
                  </span>
                  <h3 className="mt-3 font-bold leading-snug">{u.nome}</h3>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Filas ativas</dt>
                      <dd className="font-semibold">{u.especialidades.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Espera média</dt>
                      <dd className="font-semibold">
                        {Math.round(u.especialidades.reduce((s, e) => s + e.espera, 0) / u.especialidades.length)} dias
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {u.especialidades.map((e) => (
                      <button
                        key={e.nome}
                        onClick={() => setEspAberta(e.nome)}
                        className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground"
                      >
                        {e.nome}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Transparência */}
        <section id="transparencia" className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Compromisso com a transparência
              </h2>
              <p className="mt-3 text-muted-foreground">
                Todos os dados exibidos neste portal são públicos, auditáveis e
                atualizados automaticamente a partir do sistema de regulação
                municipal, em conformidade com a Lei de Acesso à Informação.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Dados anonimizados — nenhum paciente é identificado",
                  "Histórico completo disponível para download",
                  "Metodologia de cálculo publicada e aberta",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <ShieldCheck
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-bold">Como a fila é organizada?</h3>
              <ol className="mt-4 space-y-4">
                {[
                  "Você é encaminhado pela UBS ou UPA de referência",
                  "O sistema classifica por prioridade clínica e ordem de chegada",
                  "Você acompanha sua posição pelo protocolo, sem expor seus dados",
                  "A unidade entra em contato quando sua vez se aproxima",
                ].map((passo, i) => (
                  <li key={passo} className="flex gap-3 text-sm">
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="pt-1">{passo}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="font-bold">SUS Fila Transparente</p>
            <p className="mt-2 text-sm opacity-80">
              Portal público de transparência das filas de atendimento em saúde.
            </p>
          </div>
          <div>
            <p className="font-semibold">Atendimento</p>
            <ul className="mt-2 space-y-1 text-sm opacity-80">
              <li>Ouvidoria: 136</li>
              <li>Emergência: SAMU 192</li>
              <li>Segunda a sexta, 7h às 19h</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Dados abertos</p>
            <ul className="mt-2 space-y-1 text-sm opacity-80">
              <li>
                <a href="#" className="underline underline-offset-2">
                  Baixar histórico (CSV)
                </a>
              </li>
              <li>
                <a href="#" className="underline underline-offset-2">
                  Metodologia de cálculo
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 py-4 text-center text-xs opacity-70">
          Prefeitura Municipal · Secretaria de Saúde · Lei de Acesso à Informação nº 12.527/2011
        </div>
      </footer>
      <EspecialidadeDialog
        especialidade={espAberta}
        onClose={() => setEspAberta(null)}
        onConsultar={abrirPosicao}
      />
      <PosicaoDialog
        key={`${posicaoEsp}-${posicaoOpen}`}
        open={posicaoOpen}
        onOpenChange={setPosicaoOpen}
        especialidadeInicial={posicaoEsp}
      />
    </div>
  );
}
