import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { unidadesDa, ESPECIALIDADES } from "@/lib/unidades";
import { CalendarClock, HeartPulse, LogOut, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { consultasDaConta } from "@/lib/minhas-consultas";
import { identificacaoPublica } from "@/lib/fila";

export const Route = createFileRoute("/_authenticated/minhas-consultas")({
  head: () => ({
    meta: [
      { title: "Minhas consultas — Fila Transparente" },
      { name: "description", content: "Suas consultas, posição na fila e dias de espera estimados." },
      { property: "og:title", content: "Minhas consultas — Fila Transparente" },
      { property: "og:description", content: "Acompanhe sua posição e os dias de espera." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { agendar?: string } =>
    typeof s["agendar"] === "string" ? { agendar: s["agendar"] } : {},
  component: MinhasConsultas,
});

function MinhasConsultas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { agendar } = Route.useSearch();
  const [esp, setEsp] = useState(agendar ?? "");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [agendados, setAgendados] = useState<{ especialidade: string; unidade: string; bairro: string; tipo: string; posicao: number; total: number; vagas: number; espera: number }[]>([]);
  const [msg, setMsg] = useState("");
  const [uid, setUid] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? "";
      setUid(id);
      try { setAgendados(JSON.parse(localStorage.getItem("agendamentos:" + id) ?? "[]")); } catch { /* vazio */ }
    });
  }, []);
  useEffect(() => { if (agendar) setEsp(agendar); }, [agendar]);
  const opcoes = esp ? unidadesDa(esp) : [];
  function confirmar() {
    const o = opcoes.find(x => x.unidade.nome === unidadeSel) ?? opcoes[0];
    if (!o) return;
    const posicao = o.naFila + 1;
    const novo = { especialidade: esp, unidade: o.unidade.nome, bairro: o.unidade.bairro, tipo: o.unidade.tipo, posicao, total: posicao, vagas: o.vagas, espera: Math.ceil(posicao / o.vagas) };
    const lista = [...agendados.filter(a => a.especialidade !== esp), novo];
    setAgendados(lista);
    localStorage.setItem("agendamentos:" + uid, JSON.stringify(lista));
    setMsg(`Consulta de ${esp} agendada em ${o.unidade.nome}. Você entrou na fila na posição ${posicao}º.`);
    setEsp(""); setUnidadeSel("");
    navigate({ to: "/minhas-consultas", search: {}, replace: true });
  }
  const { data: perfil, isLoading } = useQuery({
    queryKey: ["perfil"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("nome, documento").eq("id", u.user!.id).maybeSingle();
      return data ?? { nome: "", documento: "" };
    },
  });

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const base = perfil ? consultasDaConta(perfil.documento) : [];
  const consultas = [...base.filter(c => !agendados.some(a => a.especialidade === c.especialidade)), ...agendados];
  const seed = Number((perfil?.documento ?? "0").slice(-4)) || 1;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><HeartPulse className="h-5 w-5" aria-hidden="true" /></div>
            <span className="text-lg font-bold">Fila Transparente</span>
          </Link>
          <Button variant="outline" onClick={sair}><LogOut className="mr-2 h-4 w-4" aria-hidden="true" />Sair</Button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold">Minhas consultas</h1>
        {perfil && (
          <p className="mt-2 text-muted-foreground">
            Olá, {perfil.nome.split(" ")[0] || "paciente"} · <span className="font-medium">{identificacaoPublica(seed, perfil.nome || undefined)}</span>
          </p>
        )}
        <section aria-labelledby="agendar-titulo" className="mt-8 rounded-2xl border border-primary/30 bg-secondary p-6">
          <h2 id="agendar-titulo" className="text-xl font-bold">Agendar consulta</h2>
          <p className="mt-1 text-sm text-muted-foreground">Escolha a especialidade e a unidade. A unidade com menor espera aparece primeiro.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <select aria-label="Especialidade" value={esp} onChange={e => { setEsp(e.target.value); setUnidadeSel(""); }} className="h-11 rounded-lg border bg-card px-3 text-sm">
              <option value="">Selecione a especialidade</option>
              {ESPECIALIDADES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select aria-label="Unidade" value={unidadeSel} onChange={e => setUnidadeSel(e.target.value)} disabled={!esp} className="h-11 rounded-lg border bg-card px-3 text-sm disabled:opacity-50">
              {opcoes.map(o => <option key={o.unidade.nome} value={o.unidade.nome}>{o.unidade.nome} · {o.vagas} vagas/dia · ~{Math.ceil((o.naFila + 1) / o.vagas)} dias</option>)}
            </select>
            <Button onClick={confirmar} disabled={!esp || opcoes.length === 0} className="h-11">Confirmar agendamento</Button>
          </div>
          {msg && <p role="status" className="mt-3 text-sm font-medium text-primary">{msg}</p>}
        </section>
        {isLoading && <p className="mt-8 text-muted-foreground">Carregando...</p>}
        <ul className="mt-8 grid gap-4">
          {consultas.map(c => (
            <li key={c.especialidade} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{c.tipo}</p>
                  <h2 className="text-xl font-bold">{c.especialidade}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" aria-hidden="true" />{c.unidade} · {c.bairro}</p>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-xl bg-secondary px-4 py-3 text-center">
                    <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" aria-hidden="true" />Posição</p>
                    <p className="text-2xl font-bold text-primary">{c.posicao}º</p>
                    <p className="text-xs text-muted-foreground">de {c.total}</p>
                  </div>
                  <div className="rounded-xl bg-secondary px-4 py-3 text-center">
                    <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />Espera</p>
                    <p className="text-2xl font-bold text-primary">{c.espera}</p>
                    <p className="text-xs text-muted-foreground">{c.espera === 1 ? "dia" : "dias"}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Espera = ⌈{c.posicao} ÷ {c.vagas} vagas por dia⌉ = {c.espera} {c.espera === 1 ? "dia" : "dias"}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
