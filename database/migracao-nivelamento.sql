-- Nivelamento ampliado do Pratica.dev.
-- Execute depois das migrações anteriores e antes de publicar o novo frontend.
-- Mantém as três respostas antigas e aceita tanto o formulário antigo (3)
-- quanto o novo (10). Não remove dados de alunos nem concede XP retroativo.

alter table public.quiz_answers drop constraint if exists quiz_answers_question_check;
alter table public.quiz_answers add constraint quiz_answers_question_check
  check (question between 1 and 10);

-- Registro privado da recompensa de nivelamento. Ele não depende de uma
-- flag alterável pelo cliente e torna a concessão idempotente, inclusive em
-- requisições concorrentes ou reenvios após uma falha de conexão.
create table if not exists public.quiz_xp_awards (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  recorded_at timestamptz not null default now()
);
alter table public.quiz_xp_awards enable row level security;
revoke all on public.quiz_xp_awards from public, anon, authenticated;

-- Quem já concluiu o quiz antigo não recebe a recompensa novamente ao
-- experimentar o diagnóstico ampliado. Nenhum XP existente é modificado.
insert into public.quiz_xp_awards (user_id)
select id from public.profiles where quiz_done = true
on conflict (user_id) do nothing;

create or replace function public.award_quiz_xp(p_answers jsonb, p_track text, p_goal text)
returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  reward_rows integer := 0;
begin
  if uid is null then raise exception 'Não autenticado'; end if;
  perform public.ensure_not_blocked();
  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
    raise exception 'Respostas do nivelamento inválidas';
  end if;
  if jsonb_array_length(p_answers) not in (3, 10) then
    raise exception 'Responda todas as perguntas do nivelamento';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_answers) as entry(value)
    where jsonb_typeof(value) <> 'string'
       or char_length(btrim(value #>> '{}')) not between 1 and 300
  ) then
    raise exception 'Respostas do nivelamento inválidas';
  end if;
  if (p_answers ->> 1) is distinct from p_track or (p_answers ->> 2) is distinct from p_goal then
    raise exception 'A área e o objetivo devem corresponder às respostas';
  end if;

  insert into public.quiz_answers (user_id, question, answer)
  select uid, position::integer, answer
  from jsonb_array_elements_text(p_answers) with ordinality as entries(answer, position)
  on conflict (user_id, question) do update set answer = excluded.answer;

  insert into public.quiz_xp_awards (user_id) values (uid)
  on conflict (user_id) do nothing;
  get diagnostics reward_rows = row_count;
  update public.profiles set
    track = p_track,
    goal = p_goal,
    quiz_done = true,
    xp = xp + case when reward_rows = 1 then 50 else 0 end,
    level = public.recalculate_level(xp + case when reward_rows = 1 then 50 else 0 end)
  where id = uid;
end;
$$;

revoke all on function public.award_quiz_xp(jsonb, text, text) from public, anon;
grant execute on function public.award_quiz_xp(jsonb, text, text) to authenticated;
