import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNIDADES, REGIOES, DISTRITOS, correspondeUnidade, distritoDe, normalizarBusca } from "@/lib/unidades";

export function UnidadesDiretorio({ termo, onEspecialidade }: { termo: string; onEspecialidade: (nome: string) => void }) {
  const [busca, setBusca] = useState("");
  const [regiao, setRegiao] = useState("");
  const [tipo, setTipo] = useState("");
  const [distrito, setDistrito] = useState("");
  const [pagina, setPagina] = useState(0);
  const [anterior, setAnterior] = useState(termo);
  if (anterior !== termo) { setAnterior(termo); setPagina(0); }
  const lista = UNIDADES.filter(u => correspondeUnidade(u, termo) && correspondeUnidade(u, busca) && (!regiao || u.bairro === regiao) && (!tipo || u.tipo === tipo) && (!distrito || normalizarBusca(distritoDe(u)).includes(normalizarBusca(distrito))));
  const paginas = Math.max(1, Math.ceil(lista.length / 6));
  const atual = Math.min(pagina, paginas - 1);
  const visiveis = lista.slice(atual * 6, atual * 6 + 6);
  return <section id="unidades" className="border-y bg-secondary/50 scroll-mt-24">
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-bold md:text-3xl">Unidades de saúde</h2>
      <p className="mt-2 text-sm text-muted-foreground">São Paulo · {UNIDADES.length} unidades · Contatos e endereços informados, não verificados.</p>
      <p className="mt-1 text-xs text-muted-foreground">Tempos de espera estimados. Confirme a oferta com a unidade.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium">Buscar unidade
          <span className="relative mt-1 block"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true"/><input aria-label="Buscar no diretório de unidades" value={busca} onChange={e => {setBusca(e.target.value);setPagina(0);}} placeholder="Nome, bairro ou endereço" className="h-10 w-full rounded-lg border bg-card pl-9 pr-3" /></span>
        </label>
        <label className="text-sm font-medium">Bairro / distrito<input list="distritos" aria-label="Filtrar por bairro" value={distrito} onChange={e => {setDistrito(e.target.value);setPagina(0);}} placeholder="Ex.: Santo Amaro, Lapa" className="mt-1 h-10 w-full rounded-lg border bg-card px-3" /><datalist id="distritos">{DISTRITOS.map(d => <option key={d} value={d} />)}</datalist></label>
        <label className="text-sm font-medium">Região<select aria-label="Região" value={regiao} onChange={e => {setRegiao(e.target.value);setPagina(0);}} className="mt-1 h-10 w-full rounded-lg border bg-card px-3"><option value="">Todas as regiões</option>{REGIOES.map(r => <option key={r}>{r}</option>)}</select></label>
        <label className="text-sm font-medium">Tipo de unidade<select aria-label="Tipo de unidade" value={tipo} onChange={e => {setTipo(e.target.value);setPagina(0);}} className="mt-1 h-10 w-full rounded-lg border bg-card px-3"><option value="">Todos os tipos</option>{["UBS", "UPA 24h", "Hospital", "AME", "AMA Especialidades"].map(r => <option key={r}>{r}</option>)}</select></label>
      </div>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{lista.length} unidades encontradas</p>
      {lista.length === 0 && <p className="py-8 text-center">Nenhuma unidade encontrada.</p>}
      {REGIOES.map(r => {
        const grupo = visiveis.filter(u => u.bairro === r);
        return grupo.length > 0 && <div key={r} className="mt-6"><h3 className="mb-3 font-bold text-primary">{r}</h3><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{grupo.map(u => <article key={u.nome} className="min-w-0 rounded-lg border bg-card p-4">
          <span className="text-xs font-semibold text-primary">{u.tipo}</span><h4 className="mt-2 break-words font-bold">{u.nome}</h4>
          <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"/>{u.endereco}</p>
          {u.telefone && <a href={`tel:${u.telefone.replace(/\D/g, "")}`} className="mt-2 flex items-center gap-2 text-sm font-medium text-primary"><Phone className="h-4 w-4" aria-hidden="true"/>{u.telefone}</a>}
          <details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-semibold text-primary">Especialidades ({u.especialidades.length})</summary>{u.descricao && <p className="mt-3 text-xs text-muted-foreground">{u.descricao}</p>}<ul className="mt-2 space-y-1">{u.especialidades.map(e => <li key={e.nome}><Button variant="link" className="h-auto justify-start whitespace-normal px-0 py-1 text-left text-xs" onClick={() => onEspecialidade(e.nome)}>{e.nome} · {e.vagas} vagas/dia</Button></li>)}</ul></details>
        </article>)}</div></div>;
      })}
      {paginas > 1 && <div className="mt-6 flex items-center justify-center gap-4"><Button variant="outline" size="icon" aria-label="Unidades anteriores" disabled={atual === 0} onClick={() => setPagina(atual - 1)}><ChevronLeft/></Button><span className="text-sm tabular-nums">{atual + 1} / {paginas}</span><Button variant="outline" size="icon" aria-label="Próximas unidades" disabled={atual === paginas - 1} onClick={() => setPagina(atual + 1)}><ChevronRight/></Button></div>}
    </div>
  </section>;
}
