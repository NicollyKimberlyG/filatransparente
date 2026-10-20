import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Login com CPF (11 dígitos) ou Cartão SUS (15 dígitos) + senha.
// O email nunca é devolvido ao navegador: a sessão é criada aqui e só os tokens retornam.
export const entrarComDocumento = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ documento: z.string().regex(/^(\d{11}|\d{15})$/), senha: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const coluna = data.documento.length === 11 ? "documento" : "cns";
    const { data: perfil } = await supabaseAdmin.from("profiles").select("id").eq(coluna, data.documento).maybeSingle();
    if (!perfil) return { ok: false as const };
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(perfil.id);
    const email = u.user?.email;
    if (!email) return { ok: false as const };
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const client = createClient(process.env.SUPABASE_URL!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data: s, error } = await client.auth.signInWithPassword({ email, password: data.senha });
    if (error || !s.session) return { ok: false as const };
    return { ok: true as const, access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });
