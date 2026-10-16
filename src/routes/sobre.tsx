import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, ShieldCheck, Calculator } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Fila Transparente (projeto acadêmico independente)" },
      { name: "description", content: "Fila Transparente é um projeto acadêmico e independente, sem vínculo oficial com o Ministério da Saúde ou prefeituras." },
      { property: "og:title", content: "Sobre o Fila Transparente" },
      { property: "og:description", content: "Projeto acadêmico independente sobre transparência em filas de saúde. Dados fictícios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar ao início
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold md:text-4xl">Sobre o Fila Transparente</h1>

      <div role="note" className="mt-6 rounded-lg border-2 border-destructive/40 bg-destructive/10 p-5">
        <p className="flex items-center gap-2 font-bold"><GraduationCap className="h-5 w-5" aria-hidden="true" /> Projeto acadêmico e independente</p>
        <p className="mt-2 text-sm">
          Este site <strong>não possui vínculo oficial</strong> com o Ministério da Saúde, secretarias estaduais ou municipais de saúde, nem com qualquer prefeitura.
          Não é um canal oficial de agendamento. Filas, posições, vagas e prazos são <strong>simulados</strong>.
        </p>
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-bold"><ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /> Privacidade (LGPD)</h2>
        <p className="text-muted-foreground">
          Nenhum nome completo ou CPF é exibido na fila. Cada paciente aparece apenas com as iniciais e os 3 primeiros dígitos do cartão SUS (ex.: M.A.S. · SUS: 208xxxxxxx), como fazem portais públicos para cumprir a Lei nº 13.709/2018.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Calculator className="h-5 w-5 text-primary" aria-hidden="true" /> Metodologia</h2>
        <p className="text-muted-foreground">A ordem segue a chegada; urgências avaliadas pela equipe vêm primeiro, também por ordem de chegada entre si.</p>
        <p className="rounded-lg bg-muted p-4 font-mono text-sm">Espera estimada = ⌈ posição na fila ÷ vagas por dia ⌉<br />Ex.: ⌈ 244 ÷ 14 ⌉ = 18 dias</p>
        <p className="text-muted-foreground">O gráfico de pico de espera usa um índice mensal fictício para ilustrar a sazonalidade (ex.: Dermatologia no verão).</p>
      </section>

      <p className="mt-10 text-sm text-muted-foreground">Em emergências, ligue para o SAMU 192.</p>
    </main>
  );
}
