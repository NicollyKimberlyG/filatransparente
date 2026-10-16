CREATE TABLE public.rede_pacientes (
  cpf text PRIMARY KEY,
  cns text NOT NULL UNIQUE
);
GRANT ALL ON public.rede_pacientes TO service_role;
ALTER TABLE public.rede_pacientes ENABLE ROW LEVEL SECURITY;

INSERT INTO public.rede_pacientes (cpf, cns)
SELECT c, '7' || c || '000' FROM unnest(ARRAY[
 '17099314858','06625449865','45730832869','26867183824','09272670802','94260003801',
 '55717564899','91056492856','08242513856','47247169834','41740061802','54701861804']) AS c;

ALTER TABLE public.profiles ADD COLUMN cns text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cpf text := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'documento', ''), '\D', '', 'g');
  v_cns text := regexp_replace(COALESCE(NEW.raw_user_meta_data->>'cns', ''), '\D', '', 'g');
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.rede_pacientes WHERE cpf = v_cpf AND cns = v_cns) THEN
    RAISE EXCEPTION 'paciente_fora_da_rede';
  END IF;
  INSERT INTO public.profiles (id, nome, documento, cns)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', ''), v_cpf, v_cns);
  RETURN NEW;
END; $$;