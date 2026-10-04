-- NEEV portfolio / ledger foundation
-- Run this once in Supabase SQL Editor. Safe to re-run.
-- The schema is deliberately append-only for decisions, trades and cash movements.
create extension if not exists pgcrypto;

create table if not exists reports (
  id uuid primary key, title text not null, sector text not null, summary text not null,
  date date not null, authors text not null, file_name text not null, file_url text not null,
  file_size_bytes bigint not null default 0, uploaded_at timestamptz not null default now(),
  type text not null default 'industry_report', issue_number integer, version integer not null default 1,
  publication_status text not null default 'IN_REVIEW', data_cutoff date
);
alter table reports add column if not exists type text not null default 'industry_report';
alter table reports add column if not exists issue_number integer;
alter table reports add column if not exists version integer not null default 1;
alter table reports add column if not exists publication_status text not null default 'IN_REVIEW';
alter table reports add column if not exists data_cutoff date;
alter table reports enable row level security;

create table if not exists nav_history (
  id uuid primary key, date date not null unique, nav numeric not null check (nav > 0), note text,
  unit_nav numeric, total_assets numeric, cash numeric, liabilities numeric,
  valuation_status text not null default 'UNVERIFIED', price_coverage_pct numeric,
  created_at timestamptz not null default now()
);
alter table nav_history add column if not exists unit_nav numeric;
alter table nav_history add column if not exists total_assets numeric;
alter table nav_history add column if not exists cash numeric;
alter table nav_history add column if not exists liabilities numeric;
alter table nav_history add column if not exists valuation_status text not null default 'UNVERIFIED';
alter table nav_history add column if not exists price_coverage_pct numeric;
alter table nav_history enable row level security;

create table if not exists holdings (
  id uuid primary key, symbol text not null, company_name text not null, sector text not null,
  quantity numeric not null, avg_cost numeric not null, entry_date date not null,
  status text not null default 'active', exit_date date, exit_price numeric,
  created_at timestamptz not null default now()
);
alter table holdings enable row level security;
comment on table holdings is
  'Legacy compatibility table. NEEV positions are derived from the immutable transactions ledger.';

create table if not exists industry_content (
  id uuid primary key, sector_slug text not null, layer text not null, title text not null,
  content text not null, updated_at timestamptz not null default now(),
  unique (sector_slug, layer)
);
alter table industry_content enable row level security;

create table if not exists decisions (
  id uuid primary key, date date not null, sector text not null, company_name text,
  symbol text, decision text not null, rationale text not null, vote_count text,
  created_at timestamptz not null default now()
);
alter table decisions add column if not exists case_id uuid;
alter table decisions add column if not exists status text not null default 'DRAFT';
alter table decisions add column if not exists meeting_reference text;
alter table decisions add column if not exists quorum integer;
alter table decisions add column if not exists votes_for integer;
alter table decisions add column if not exists votes_against integer;
alter table decisions add column if not exists abstentions integer;
alter table decisions add column if not exists proposed_weight numeric;
alter table decisions add column if not exists risk_notes text;
alter table decisions add column if not exists thesis_breakers text;
alter table decisions add column if not exists approved_at timestamptz;
alter table decisions add column if not exists created_at timestamptz not null default now();
alter table decisions enable row level security;

create table if not exists investment_cases (
  id uuid primary key, symbol text not null, company_name text not null, sector_code text not null,
  status text not null default 'DRAFT', thesis text not null, key_risks text, thesis_breakers text,
  valuation_method text, bear_case text, base_case text, bull_case text,
  bear_value numeric, base_value numeric, bull_value numeric, proposed_weight numeric,
  source_report_id uuid references reports(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table investment_cases enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decisions_decision_check') THEN
    ALTER TABLE decisions ADD CONSTRAINT decisions_decision_check CHECK (decision in ('BUY','HOLD','SELL'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decisions_status_check') THEN
    ALTER TABLE decisions ADD CONSTRAINT decisions_status_check CHECK (status in ('DRAFT','UNDER_REVIEW','APPROVED','REJECTED','AMENDED','SUPERSEDED'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decisions_proposed_weight_check') THEN
    ALTER TABLE decisions ADD CONSTRAINT decisions_proposed_weight_check CHECK (proposed_weight is null or (proposed_weight >= 0 and proposed_weight <= 1));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decisions_vote_counts_check') THEN
    ALTER TABLE decisions ADD CONSTRAINT decisions_vote_counts_check CHECK (
      (quorum is null or quorum >= 1) and (votes_for is null or votes_for >= 0) and
      (votes_against is null or votes_against >= 0) and (abstentions is null or abstentions >= 0)
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decisions_approval_timestamp_check') THEN
    ALTER TABLE decisions ADD CONSTRAINT decisions_approval_timestamp_check
      CHECK (status <> 'APPROVED' or approved_at is not null);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decisions_case_id_fkey') THEN
    ALTER TABLE decisions ADD CONSTRAINT decisions_case_id_fkey
      FOREIGN KEY (case_id) REFERENCES investment_cases(id) ON DELETE SET NULL;
  END IF;
END $$;

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(), symbol text not null, company_name text not null,
  sector_code text not null, transaction_type text not null check (transaction_type in ('BUY','SELL')),
  trade_date date not null, settlement_date date not null, quantity numeric not null check (quantity > 0),
  price numeric not null check (price >= 0), gross_amount numeric generated always as (quantity * price) stored,
  fees numeric not null default 0 check (fees >= 0), taxes numeric not null default 0 check (taxes >= 0),
  decision_id uuid not null references decisions(id) on delete restrict,
  status text not null default 'POSTED' check (status = 'POSTED'),
  reference text, notes text, created_by uuid, created_at timestamptz not null default now()
);
alter table transactions enable row level security;
create index if not exists transactions_symbol_date_idx on transactions(symbol, trade_date);
create index if not exists transactions_decision_idx on transactions(decision_id);

create table if not exists cash_ledger (
  id uuid primary key default gen_random_uuid(), entry_date date not null,
  entry_type text not null check (entry_type in (
    'INITIAL_CAPITAL','CONTRIBUTION','WITHDRAWAL','BUY','SELL','DIVIDEND',
    'EXPENSE','FEE','TAX','CORPORATE_ACTION','ADJUSTMENT'
  )),
  amount numeric not null check (amount <> 0),
  transaction_id uuid references transactions(id) on delete restrict,
  reference text, notes text,
  status text not null default 'POSTED' check (status = 'POSTED'),
  created_by uuid, created_at timestamptz not null default now()
);
alter table cash_ledger enable row level security;
create index if not exists cash_ledger_date_idx on cash_ledger(entry_date);
create index if not exists cash_ledger_type_idx on cash_ledger(entry_type);
create unique index if not exists cash_ledger_transaction_uidx
  on cash_ledger(transaction_id) where transaction_id is not null;

insert into cash_ledger (entry_date, entry_type, amount, reference, notes)
select coalesce((select min(trade_date) from transactions), current_date), 'INITIAL_CAPITAL', 1000000,
  'NEEV-BOOTSTRAP', 'Opening notional capital for the NEEV student-managed portfolio.'
where not exists (select 1 from cash_ledger where entry_type = 'INITIAL_CAPITAL');

create or replace function get_cash_balance()
returns numeric language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount), 0) from cash_ledger where status = 'POSTED';
$$;

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(), action text not null, entity_type text not null,
  entity_id uuid, before_data jsonb, after_data jsonb, actor_user_id uuid,
  created_at timestamptz not null default now()
);
alter table audit_events enable row level security;
create index if not exists audit_events_entity_idx on audit_events(entity_type, entity_id, created_at desc);

create or replace function audit_row_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_events(action, entity_type, entity_id, before_data, after_data, actor_user_id)
  values (
    TG_OP, TG_TABLE_NAME, coalesce(NEW.id, OLD.id),
    case when TG_OP = 'INSERT' then null else to_jsonb(OLD) end,
    case when TG_OP = 'DELETE' then null else to_jsonb(NEW) end, null
  );
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

DROP TRIGGER IF EXISTS audit_reports_change ON reports;
CREATE TRIGGER audit_reports_change AFTER INSERT OR UPDATE OR DELETE ON reports FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_nav_history_change ON nav_history;
CREATE TRIGGER audit_nav_history_change AFTER INSERT OR UPDATE OR DELETE ON nav_history FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_decisions_change ON decisions;
CREATE TRIGGER audit_decisions_change AFTER INSERT OR UPDATE OR DELETE ON decisions FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_investment_cases_change ON investment_cases;
CREATE TRIGGER audit_investment_cases_change AFTER INSERT OR UPDATE OR DELETE ON investment_cases FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_transactions_change ON transactions;
CREATE TRIGGER audit_transactions_change AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION audit_row_change();
DROP TRIGGER IF EXISTS audit_cash_ledger_change ON cash_ledger;
CREATE TRIGGER audit_cash_ledger_change AFTER INSERT OR UPDATE OR DELETE ON cash_ledger FOR EACH ROW EXECUTE FUNCTION audit_row_change();

create or replace function prevent_ledger_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Immutable NEEV ledger: % rows cannot be updated or deleted; create a correction/reversal entry instead.', TG_TABLE_NAME;
end;
$$;

DROP TRIGGER IF EXISTS prevent_decision_mutation ON decisions;
CREATE TRIGGER prevent_decision_mutation BEFORE UPDATE OR DELETE ON decisions FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();
DROP TRIGGER IF EXISTS prevent_transaction_mutation ON transactions;
CREATE TRIGGER prevent_transaction_mutation BEFORE UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();
DROP TRIGGER IF EXISTS prevent_cash_ledger_mutation ON cash_ledger;
CREATE TRIGGER prevent_cash_ledger_mutation BEFORE UPDATE OR DELETE ON cash_ledger FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();

create or replace function record_trade(
  p_symbol text, p_company_name text, p_sector text, p_transaction_type text,
  p_trade_date date, p_quantity numeric, p_price numeric, p_fees numeric default 0,
  p_taxes numeric default 0, p_decision_id uuid default null, p_notes text default null,
  p_settlement_date date default null, p_reference text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_symbol text := upper(trim(p_symbol));
  v_trade_type text := upper(trim(p_transaction_type));
  v_settlement_date date := coalesce(p_settlement_date, p_trade_date);
  v_decision decisions%rowtype;
  v_held numeric := 0;
  v_transaction_id uuid;
  v_gross numeric;
  v_cash_amount numeric;
begin
  if v_symbol = '' then raise exception 'Trade symbol is required.'; end if;
  if trim(coalesce(p_company_name, '')) = '' then raise exception 'Company name is required.'; end if;
  if trim(coalesce(p_sector, '')) = '' then raise exception 'Sector is required.'; end if;
  if v_trade_type not in ('BUY','SELL') then raise exception 'Transaction type must be BUY or SELL.'; end if;
  if p_trade_date is null or v_settlement_date < p_trade_date then raise exception 'Settlement date cannot be earlier than the trade date.'; end if;
  if p_quantity is null or p_quantity <= 0 then raise exception 'Trade quantity must be positive.'; end if;
  if p_price is null or p_price < 0 then raise exception 'Trade price cannot be negative.'; end if;
  if coalesce(p_fees,0) < 0 or coalesce(p_taxes,0) < 0 then raise exception 'Fees and taxes cannot be negative.'; end if;
  if p_decision_id is null then raise exception 'Every trade must reference an approved IC decision.'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_symbol, 0));

  select * into v_decision from decisions where id = p_decision_id for share;
  if not found then raise exception 'IC decision % was not found.', p_decision_id; end if;
  if v_decision.status <> 'APPROVED' then raise exception 'IC decision % is not approved.', p_decision_id; end if;
  if v_decision.approved_at is null then raise exception 'IC decision % has no approval timestamp.', p_decision_id; end if;
  if v_decision.symbol is null or upper(trim(v_decision.symbol)) <> v_symbol then raise exception 'Trade symbol does not match the referenced IC decision.'; end if;
  if v_trade_type = 'BUY' and v_decision.decision <> 'BUY' then raise exception 'A BUY trade requires a BUY IC decision.'; end if;
  if v_trade_type = 'SELL' and v_decision.decision <> 'SELL' then raise exception 'A SELL trade requires a SELL IC decision.'; end if;
  if p_trade_date < v_decision.date then raise exception 'Trade date cannot precede the IC decision date.'; end if;

  if v_trade_type = 'SELL' then
    select coalesce(sum(case when transaction_type = 'BUY' then quantity else -quantity end), 0)
      into v_held
    from transactions where upper(symbol) = v_symbol and status = 'POSTED';
    if p_quantity > v_held + 0.000000001 then
      raise exception 'Sell quantity % exceeds available position % for %.', p_quantity, v_held, v_symbol;
    end if;
  end if;

  insert into transactions (
    symbol, company_name, sector_code, transaction_type, trade_date, settlement_date,
    quantity, price, fees, taxes, decision_id, status, reference, notes, created_by
  )
  values (
    v_symbol, trim(p_company_name), trim(p_sector), v_trade_type, p_trade_date,
    v_settlement_date, p_quantity, p_price, coalesce(p_fees,0), coalesce(p_taxes,0),
    p_decision_id, 'POSTED', p_reference, p_notes, null
  )
  returning id, gross_amount into v_transaction_id, v_gross;

  v_cash_amount := case
    when v_trade_type = 'BUY' then -(v_gross + coalesce(p_fees,0) + coalesce(p_taxes,0))
    else (v_gross - coalesce(p_fees,0) - coalesce(p_taxes,0))
  end;

  insert into cash_ledger (
    entry_date, entry_type, amount, transaction_id, reference, notes, created_by
  )
  values (
    v_settlement_date, v_trade_type, v_cash_amount, v_transaction_id,
    coalesce(p_reference, 'TRADE:' || v_transaction_id::text),
    coalesce(p_notes, 'Cash movement generated by posted security trade.'), null
  );

  return v_transaction_id;
end;
$$;

create or replace function record_cash_entry(
  p_entry_date date, p_entry_type text, p_amount numeric,
  p_reference text default null, p_notes text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_entry_date is null then raise exception 'Cash entry date is required.'; end if;
  if p_entry_type not in ('INITIAL_CAPITAL','CONTRIBUTION','WITHDRAWAL','DIVIDEND','EXPENSE','FEE','TAX','CORPORATE_ACTION','ADJUSTMENT') then
    raise exception 'Unsupported cash ledger entry type.';
  end if;
  if p_amount is null or p_amount = 0 then raise exception 'Cash entry amount cannot be zero.'; end if;
  insert into cash_ledger(entry_date, entry_type, amount, reference, notes, created_by)
  values(p_entry_date, p_entry_type, p_amount, p_reference, p_notes, null)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function get_cash_balance() from public;
grant execute on function get_cash_balance() to service_role;
revoke all on function record_cash_entry(date,text,numeric,text,text) from public;
grant execute on function record_cash_entry(date,text,numeric,text,text) to service_role;
revoke all on function record_trade(text,text,text,text,date,numeric,numeric,numeric,numeric,uuid,text,date,text) from public;
grant execute on function record_trade(text,text,text,text,date,numeric,numeric,numeric,numeric,uuid,text,date,text) to service_role;
