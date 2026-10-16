import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UnidadesDiretorio } from "@/components/unidades-diretorio";
import { correspondeUnidade, normalizarBusca } from "@/lib/unidades";
import { esperaEstimada } from "@/lib/fila";
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
      { title: "Fila Transparente — Filas de atendimento em saúde (projeto acadêmico)" },
      {
        name: "description",
        content:
          "Projeto acadêmico independente sobre transparência em filas de atendimento em saúde: espera estimada, posição na fila e unidades de São Paulo.",
      },
      { property: "og:title", content: "Fila Transparente" },
      {
        property: "og:description",
        content:
          "Transparência em filas de atendimento em saúde: espera estimada, posição na fila e unidades de São Paulo.",
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
  const vagasDia = l.reduce((s, x) => s + x.vagas, 0);
  const espera = esperaEstimada(pessoas, vagasDia);
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
  const [todasEspecialidades, setTodasEspecialidades] = useState(false);
  const t = normalizarBusca(termo);
  const filas = filasTodas.filter(
    (f) =>
      !t ||
      normalizarBusca(f.especialidade).includes(t) ||
      f.unidades.some((u) => correspondeUnidade(u.unidade, t)),
  );
  const principais = ["Clínica Geral", "Pediatria", "Ginecologia", "Cardiologia", "Ortopedia", "Oftalmologia"];
  const filasVisiveis = t || todasEspecialidades ? filas : filas.filter(f => principais.includes(f.especialidade));
  const abrirPosicao = (esp?: string) => {
    setEspAberta(null);
    setPosicaoEsp(esp);
    setPosicaoOpen(true);
  };
  const buscar = () => {
    setTermo(busca);
    setTodasEspecialidades(false);
    document.getElementById("filas")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Barra de acessibilidade */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs font-medium">
          <span>Projeto acadêmico independente · Sem vínculo oficial com órgãos públicos</span>
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
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulse className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">Fila Transparente</p>
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
            <Link to="/sobre" className="hover:text-primary">
              Sobre
            </Link>
            <Button onClick={() => abrirPosicao()} className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
              Consultar minha posição
            </Button>
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
                Acompanhe filas · São Paulo
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight  md:text-5xl">
                Fila Transparente
              </h1>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Encontre unidades de São Paulo e acompanhe as filas por especialidade, sem precisar de cadastro.
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
                <Button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  Buscar
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>
              <Button
                onClick={() => abrirPosicao()}
                variant="link" className="mt-3 h-auto whitespace-normal px-0 text-sm font-semibold md:hidden"
              >
                Consultar minha posição
              </Button>
            </div>

            {/* Indicadores */}
            <dl className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: Users, valor: filasTodas.reduce((s, f) => s + f.pessoas, 0).toLocaleString("pt-BR"), rotulo: "Pessoas em fila" },
                { icon: Clock3, valor: `${Math.round(filasTodas.reduce((s, f) => s + f.espera, 0) / filasTodas.length)} dias`, rotulo: "Espera média estimada" },
                { icon: Building2, valor: String(UNIDADES.length), rotulo: "Unidades no diretório" },
                { icon: Activity, valor: String(ESPECIALIDADES.length), rotulo: "Especialidades disponíveis" },
              ].map((item) => (
                <div
                  key={item.rotulo}
                  className="rounded-lg border bg-card p-5 shadow-sm"
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
        <section id="filas" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Filas por especialidade
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Especialidades disponíveis · Espera = pessoas na fila ÷ vagas por dia
              </p>
            </div>
            {t && (
              <Button
                onClick={() => {
                  setBusca("");
                  setTermo("");
                }}
                variant="outline" className="h-auto whitespace-normal rounded-lg px-4 py-2 text-sm font-medium"
              >
                Limpar busca “{termo}”
              </Button>
            )}
          </div>

          {filas.length === 0 && (
            <p className="mt-8 rounded-lg border bg-card p-6 text-center text-muted-foreground">
              Nenhuma especialidade ou unidade encontrada para “{termo}”.
            </p>
          )}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {filasVisiveis.map((fila) => (
              <Button
                type="button"
                key={fila.especialidade}
                onClick={() => setEspAberta(fila.especialidade)}
                aria-label={`Ver unidades e fila de ${fila.especialidade}`}
                variant="outline" className="h-auto min-w-0 flex-col items-stretch whitespace-normal rounded-lg border bg-card p-5 text-left shadow-sm hover:bg-card hover:border-primary"
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
              </Button>
            ))}
          </div>
          {!t && <div className="mt-6 flex justify-center"><Button variant="outline" onClick={() => setTodasEspecialidades(v => !v)}>{todasEspecialidades ? "Mostrar principais" : `Ver todas as especialidades (${ESPECIALIDADES.length})`}</Button></div>}
        </section>

        <UnidadesDiretorio termo={termo} onEspecialidade={setEspAberta} />

        {/* Transparência */}
        <section id="transparencia" className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Compromisso com a transparência
              </h2>
              <p className="mt-3 text-muted-foreground">
                Vagas e especialidades exibidas são estimativas. Os endereços e contatos foram informados para este diretório e precisam ser confirmados com as unidades.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Outros pacientes aparecem sem nome ou documento",
                  "Pacientes exibidos só com iniciais e 3 dígitos do cartão (LGPD)",
                  "Sem acesso a prontuários ou filas reais",
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
            <div className="border-l pl-6">
              <h3 className="font-bold">Como a fila é organizada?</h3>
              <ol className="mt-4 space-y-4">
                {[
                  "O atendimento segue a ordem de chegada",
                  "Urgências têm prioridade após avaliação da equipe de saúde",
                  "Uma nova urgência fica após as prioridades já na fila, por ordem de chegada",
                  "Os demais pacientes mantêm sua ordem de chegada",
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
              <details className="mt-6 rounded-lg border bg-card p-4">
                <summary className="cursor-pointer text-sm font-semibold text-primary">Dúvidas: qual unidade procurar?</summary>
                <dl className="mt-3 space-y-3 text-sm">
                  {[
                    ["Quando devo ir a uma UBS?", "Para consultas de rotina, vacinas, acompanhamento de doenças crônicas e encaminhamentos. É a porta de entrada da rede."],
                    ["O que faz uma UPA 24h?", "Atende urgências de média complexidade, como febre alta, cortes, falta de ar e dores fortes, a qualquer hora."],
                    ["O que é um AME?", "Ambulatório Médico de Especialidades: consultas com especialistas e exames, mediante encaminhamento da UBS."],
                    ["E a AMA Especialidades?", "Unidade municipal com consultas especializadas e exames, também por encaminhamento."],
                    ["Quando procurar um hospital?", "Emergências graves, cirurgias e internações. Em risco de vida, ligue para o SAMU 192."],
                  ].map(([q, r]) => (
                    <div key={q}><dt className="font-semibold">{q}</dt><dd className="mt-0.5 text-muted-foreground">{r}</dd></div>
                  ))}
                </dl>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="font-bold">Fila Transparente</p>
            <p className="mt-2 text-sm opacity-80">
              Projeto acadêmico e independente. Não possui vínculo oficial com o Ministério da Saúde, secretarias ou prefeituras. Os dados são apresentados de forma anônima, em respeito à LGPD.
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
                <a href="#unidades" className="underline underline-offset-2">
                  Diretório de unidades
                </a>
              </li>
              <li>
                <Link to="/sobre" className="underline underline-offset-2">
                  Sobre o projeto e metodologia
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 py-4 text-center text-xs opacity-70">
          Fila Transparente · Projeto acadêmico independente, sem vínculo com o Ministério da Saúde ou prefeituras · Dados anônimos, em respeito à LGPD (Lei nº 13.709/2018)
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
