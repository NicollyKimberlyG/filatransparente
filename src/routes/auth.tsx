import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Fila Transparente" },
      { name: "description", content: "Entre com email e senha para acompanhar suas consultas, posição e dias de espera." },
      { property: "og:title", content: "Entrar — Fila Transparente" },
      { property: "og:description", content: "Acompanhe suas consultas, posição na fila e dias de espera." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function formatarDoc(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 15);
  if (d.length <= 11) return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return d.replace(/(\d{3})(\d{4})(\d{4})(\d{0,4})/, "$1 $2 $3 $4").trim();
}

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [doc, setDoc] = useState("");
  const [cns, setCns] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(""); setAviso("");
    if (modo === "criar") {
      const n = doc.replace(/\D/g, "").length;
      if (nome.trim().length < 3) return setErro("Informe seu nome completo.");
      if (n !== 11) return setErro("Informe um CPF válido com 11 dígitos.");
      if (cns.replace(/\D/g, "").length !== 15) return setErro("Informe o Cartão SUS (CNS) com 15 dígitos.");
    }
    setCarregando(true);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setCarregando(false);
      if (error) return setErro("Email ou senha incorretos, ou email ainda não confirmado.");
      navigate({ to: "/minhas-consultas" });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password: senha,
        options: { emailRedirectTo: window.location.origin + "/minhas-consultas", data: { nome: nome.trim(), documento: doc.replace(/\D/g, ""), cns: cns.replace(/\D/g, "") } },
      });
      setCarregando(false);
      if (error && /database|saving|fora_da_rede/i.test(error.message)) return setErro("CPF e Cartão SUS não encontrados na rede de saúde. Use os mesmos dados do seu cadastro na unidade.");
      if (error) return setErro(error.message.includes("Password") ? "A senha precisa ter pelo menos 6 caracteres." : "Não foi possível criar a conta. Verifique os dados.");
      if (data.session) navigate({ to: "/minhas-consultas" });
      else setAviso("Conta criada! Enviamos um link de confirmação para o seu email. Depois de confirmar, entre aqui.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <Link to="/" className="mb-4 inline-flex items-center gap-2 rounded-lg border bg-secondary px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para a página inicial
        </Link>
        <Link to="/" className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><HeartPulse className="h-5 w-5" aria-hidden="true" /></div>
          <span className="text-lg font-bold">Fila Transparente</span>
        </Link>
        <h1 className="text-2xl font-bold">{modo === "entrar" ? "Entrar na sua conta" : "Criar conta"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Veja apenas as suas consultas, sua posição e os dias de espera.</p>
        <form onSubmit={enviar} className="mt-6 space-y-4">
          {modo === "criar" && (
            <>
              <div className="space-y-1.5"><Label htmlFor="nome">Nome completo</Label><Input id="nome" value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" required /></div>
              <div className="space-y-1.5"><Label htmlFor="doc">CPF</Label><Input id="doc" inputMode="numeric" value={doc} onChange={e => setDoc(formatarDoc(e.target.value.replace(/\D/g, "").slice(0, 11)))} placeholder="000.000.000-00" required /></div>
              <div className="space-y-1.5"><Label htmlFor="cns">Cartão SUS (CNS)</Label><Input id="cns" inputMode="numeric" value={cns} onChange={e => setCns(e.target.value.replace(/\D/g, "").slice(0, 15).replace(/(\d{3})(\d{0,4})(\d{0,4})(\d{0,4})/, "$1 $2 $3 $4").trim())} placeholder="000 0000 0000 0000" required /></div>
              <p className="text-xs text-muted-foreground">Só é possível criar conta com o CPF e o Cartão SUS cadastrados na rede de saúde.</p>
            </>
          )}
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></div>
          <div className="space-y-1.5"><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" minLength={6} value={senha} onChange={e => setSenha(e.target.value)} autoComplete={modo === "entrar" ? "current-password" : "new-password"} required /></div>
          {erro && <p role="alert" className="text-sm font-medium text-destructive">{erro}</p>}
          {aviso && <p role="status" className="rounded-lg bg-secondary p-3 text-sm">{aviso}</p>}
          <Button type="submit" className="w-full" disabled={carregando}>{carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}</Button>
        </form>
        <button type="button" className="mt-4 w-full text-sm text-primary underline-offset-2 hover:underline" onClick={() => { setModo(modo === "entrar" ? "criar" : "entrar"); setErro(""); setAviso(""); }}>
          {modo === "entrar" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
        <Link to="/" className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para a página inicial
        </Link>
        <p className="mt-6 text-xs text-muted-foreground">Projeto acadêmico independente, sem vínculo oficial com o Ministério da Saúde ou prefeituras.</p>
      </div>
    </div>
  );
}
