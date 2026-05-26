```sql
-- ============================================================
-- TREAT HOTELS & RESORTS — SUPABASE PRODUCTION SCHEMA
-- Version: 1.0.0
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE public.question_type AS ENUM (
  'rating', 'nps', 'text', 'textarea',
  'select', 'multiselect', 'yesno', 'date', 'email', 'phone'
);

CREATE TYPE public.condition_type AS ENUM (
  'gte', 'lte', 'eq', 'between', 'neq', 'gt', 'lt'
);

CREATE TYPE public.action_type AS ENUM (
  'show_review_link',
  'alert_gm',
  'alert_md',
  'alert_gm_md',
  'custom_message',
  'send_whatsapp',
  'create_ticket'
);

CREATE TYPE public.ticket_status AS ENUM (
  'open', 'in_progress', 'resolved', 'closed', 'escalated'
);

CREATE TYPE public.email_category AS ENUM (
  'booking_inquiry', 'wedding_lead', 'guest_complaint',
  'vendor', 'finance', 'general', 'uncategorized'
);

CREATE TYPE public.email_priority AS ENUM (
  'urgent', 'normal', 'fyi'
);

CREATE TYPE public.email_status AS ENUM (
  'unread', 'read', 'replied', 'snoozed', 'archived'
);

CREATE TYPE public.entity_name AS ENUM (
  'Mundra Hotels & Resorts',
  'Tirupati Shelters',
  'RAS Resorts'
);

-- ============================================================
-- TABLE: PROPERTIES
-- ============================================================

CREATE TABLE public.properties (
  id            VARCHAR(50)  PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  entity        public.entity_name NOT NULL,
  gm_name       VARCHAR(255),
  gm_email      VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(20),
  google_review_link TEXT,
  latitude      NUMERIC(9,6),
  longitude     NUMERIC(9,6),
  address       TEXT,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: FORMS
-- ============================================================

CREATE TABLE public.forms (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id          VARCHAR(50)  NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  slug                 VARCHAR(100) UNIQUE NOT NULL,
  title                VARCHAR(255) NOT NULL,
  description          TEXT,
  language             VARCHAR(10)  NOT NULL DEFAULT 'en',
  collect_name         BOOLEAN      NOT NULL DEFAULT TRUE,
  collect_email        BOOLEAN      NOT NULL DEFAULT TRUE,
  collect_room         BOOLEAN      NOT NULL DEFAULT TRUE,
  expires_at           TIMESTAMPTZ,
  is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
  n8n_save_webhook     TEXT,
  n8n_submit_webhook   TEXT,
  review_link          TEXT,
  gm_alert_email       VARCHAR(255),
  md_alert_email       VARCHAR(255),
  branding             JSONB        NOT NULL DEFAULT '{
    "logoUrl": "",
    "primaryColor": "#0f3622",
    "accentColor": "#c5a880",
    "bgColor": "#FAF8F5",
    "headerText": "#ffffff",
    "thankYouTitle": "Thank You!",
    "thankYouMessage": "We appreciate your feedback.",
    "showPropertyName": true,
    "fontFamily": "Inter"
  }'::JSONB,
  total_submissions    INTEGER      NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: QUESTIONS
-- ============================================================

CREATE TABLE public.questions (
  id           UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id      UUID                  NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type         public.question_type  NOT NULL,
  label        TEXT                  NOT NULL,
  placeholder  TEXT,
  required     BOOLEAN               NOT NULL DEFAULT FALSE,
  min_rating   INTEGER               DEFAULT 1 CHECK (min_rating >= 1),
  max_rating   INTEGER               DEFAULT 5 CHECK (max_rating <= 10),
  low_label    VARCHAR(100),
  high_label   VARCHAR(100),
  options      JSONB                 NOT NULL DEFAULT '[]'::JSONB,
  sort_order   INTEGER               NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: ROUTING_RULES
-- ============================================================

CREATE TABLE public.routing_rules (
  id              UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID                  NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  question_id     UUID                  NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  condition       public.condition_type NOT NULL,
  value           NUMERIC               NOT NULL,
  value2          NUMERIC,
  action          public.action_type    NOT NULL,
  custom_message  TEXT,
  priority        INTEGER               NOT NULL DEFAULT 0,
  is_active       BOOLEAN               NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: SUBMISSIONS
-- ============================================================

CREATE TABLE public.submissions (
  id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id                    UUID        NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  property_id                VARCHAR(50) NOT NULL REFERENCES public.properties(id),
  idempotency_key            VARCHAR(100) UNIQUE,
  guest_name                 VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
  guest_email                VARCHAR(255),
  guest_phone                VARCHAR(30),
  room_number                VARCHAR(50),
  overall_rating             NUMERIC(3,1),
  nps_score                  INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  sentiment                  VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN overall_rating >= 4   THEN 'excellent'
      WHEN overall_rating >= 3   THEN 'average'
      WHEN overall_rating IS NOT NULL THEN 'poor'
      ELSE NULL
    END
  ) STORED,
  routing_actions_triggered  JSONB       NOT NULL DEFAULT '[]'::JSONB,
  review_link_shown          BOOLEAN     NOT NULL DEFAULT FALSE,
  ticket_id                  UUID,
  submitted_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: GUEST_ANSWERS
-- ============================================================

CREATE TABLE public.guest_answers (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  UUID        NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  question_id    UUID        NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  question_type  public.question_type NOT NULL,
  text_value     TEXT,
  numeric_value  NUMERIC,
  array_value    JSONB       NOT NULL DEFAULT '[]'::JSONB
);

-- ============================================================
-- TABLE: COMPLAINT_TICKETS
-- ============================================================

CREATE TABLE public.complaint_tickets (
  id              UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID                  REFERENCES public.submissions(id),
  property_id     VARCHAR(50)           NOT NULL REFERENCES public.properties(id),
  guest_name      VARCHAR(255),
  guest_email     VARCHAR(255),
  room_number     VARCHAR(50),
  description     TEXT                  NOT NULL,
  status          public.ticket_status  NOT NULL DEFAULT 'open',
  assigned_to     VARCHAR(255),
  sla_deadline    TIMESTAMPTZ           NOT NULL,
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  escalated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: EMAIL_THREADS
-- ============================================================

CREATE TABLE public.email_threads (
  id              UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     VARCHAR(50)           REFERENCES public.properties(id),
  message_id      VARCHAR(255)          UNIQUE NOT NULL,
  thread_id       VARCHAR(255),
  from_email      VARCHAR(255)          NOT NULL,
  from_name       VARCHAR(255),
  to_email        VARCHAR(255)          NOT NULL,
  subject         TEXT                  NOT NULL,
  body_preview    TEXT,
  category        public.email_category NOT NULL DEFAULT 'uncategorized',
  priority        public.email_priority NOT NULL DEFAULT 'normal',
  status          public.email_status   NOT NULL DEFAULT 'unread',
  ai_summary      TEXT,
  ai_sentiment    VARCHAR(30),
  assigned_to     VARCHAR(255),
  sla_deadline    TIMESTAMPTZ,
  sla_breached    BOOLEAN               NOT NULL DEFAULT FALSE,
  snoozed_until   TIMESTAMPTZ,
  received_at     TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  replied_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: FINANCE_RECORDS
-- ============================================================

CREATE TABLE public.finance_records (
  id                  UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         VARCHAR(50)           NOT NULL REFERENCES public.properties(id),
  entity              public.entity_name    NOT NULL,
  record_date         DATE                  NOT NULL,
  total_revenue       NUMERIC(14,2)         NOT NULL DEFAULT 0,
  room_revenue        NUMERIC(14,2)         NOT NULL DEFAULT 0,
  fnb_revenue         NUMERIC(14,2)         NOT NULL DEFAULT 0,
  events_revenue      NUMERIC(14,2)         NOT NULL DEFAULT 0,
  adventure_revenue   NUMERIC(14,2)         NOT NULL DEFAULT 0,
  other_revenue       NUMERIC(14,2)         NOT NULL DEFAULT 0,
  rooms_occupied      INTEGER               NOT NULL DEFAULT 0,
  total_rooms         INTEGER               NOT NULL DEFAULT 0,
  occupancy_pct       NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_rooms > 0
      THEN ROUND((rooms_occupied::NUMERIC / total_rooms::NUMERIC) * 100, 2)
      ELSE 0
    END
  ) STORED,
  adr                 NUMERIC(10,2),
  revpar              NUMERIC(10,2),
  outstanding_receivables NUMERIC(14,2)    NOT NULL DEFAULT 0,
  tally_file_name     VARCHAR(255),
  tally_received_at   TIMESTAMPTZ,
  source              VARCHAR(50)           NOT NULL DEFAULT 'tally',
  notes               TEXT,
  created_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, record_date)
);

-- ============================================================
-- TABLE: AUDIT_LOGS
-- ============================================================

CREATE TABLE public.audit_logs (
  id          BIGSERIAL    PRIMARY KEY,
  table_name  VARCHAR(100) NOT NULL,
  record_id   TEXT         NOT NULL,
  action      VARCHAR(20)  NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    JSONB,
  new_data    JSONB,
  changed_by  TEXT,
  ip_address  INET,
  changed_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: N8N_WEBHOOK_LOGS (idempotency + debugging)
-- ============================================================

CREATE TABLE public.n8n_webhook_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name    VARCHAR(100) NOT NULL,
  idempotency_key  VARCHAR(200),
  payload_hash     VARCHAR(64),
  status           VARCHAR(20) NOT NULL DEFAULT 'received'
                   CHECK (status IN ('received', 'processed', 'failed', 'skipped')),
  error_message    TEXT,
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at     TIMESTAMPTZ
);
```

### 2.2 Indexes & Performance Optimizations

```sql
-- ============================================================
-- INDEXES
-- ============================================================

-- forms
CREATE INDEX idx_forms_property_id       ON public.forms(property_id);
CREATE INDEX idx_forms_slug              ON public.forms(slug);
CREATE INDEX idx_forms_is_active         ON public.forms(is_active);

-- questions
CREATE INDEX idx_questions_form_id       ON public.questions(form_id);
CREATE INDEX idx_questions_sort          ON public.questions(form_id, sort_order);

-- routing_rules
CREATE INDEX idx_routing_rules_form_id   ON public.routing_rules(form_id);
CREATE INDEX idx_routing_rules_question  ON public.routing_rules(question_id);

-- submissions
CREATE INDEX idx_submissions_form_id     ON public.submissions(form_id);
CREATE INDEX idx_submissions_property    ON public.submissions(property_id);
CREATE INDEX idx_submissions_submitted   ON public.submissions(submitted_at DESC);
CREATE INDEX idx_submissions_sentiment   ON public.submissions(sentiment);
CREATE INDEX idx_submissions_idempotency ON public.submissions(idempotency_key);

-- guest_answers
CREATE INDEX idx_answers_submission      ON public.guest_answers(submission_id);
CREATE INDEX idx_answers_question        ON public.guest_answers(question_id);

-- complaint_tickets
CREATE INDEX idx_tickets_property        ON public.complaint_tickets(property_id);
CREATE INDEX idx_tickets_status          ON public.complaint_tickets(status);
CREATE INDEX idx_tickets_sla             ON public.complaint_tickets(sla_deadline)
  WHERE status NOT IN ('resolved', 'closed');

-- email_threads
CREATE INDEX idx_emails_property         ON public.email_threads(property_id);
CREATE INDEX idx_emails_status           ON public.email_threads(status);
CREATE INDEX idx_emails_category         ON public.email_threads(category);
CREATE INDEX idx_emails_sla              ON public.email_threads(sla_deadline)
  WHERE sla_breached = FALSE AND status NOT IN ('replied', 'archived');
CREATE INDEX idx_emails_received         ON public.email_threads(received_at DESC);

-- finance_records
CREATE INDEX idx_finance_property_date   ON public.finance_records(property_id, record_date DESC);
CREATE INDEX idx_finance_entity          ON public.finance_records(entity);
CREATE INDEX idx_finance_date            ON public.finance_records(record_date DESC);

-- audit_logs
CREATE INDEX idx_audit_table_record      ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_at        ON public.audit_logs(changed_at DESC);

-- webhook logs
CREATE INDEX idx_webhook_idempotency     ON public.n8n_webhook_logs(idempotency_key);
CREATE INDEX idx_webhook_workflow        ON public.n8n_webhook_logs(workflow_name, received_at DESC);
```

### 2.3 Database Functions & Triggers

```sql
-- ============================================================
-- FUNCTION: Auto-update updated_at column
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER trg_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.complaint_tickets
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_emails_updated_at
  BEFORE UPDATE ON public.email_threads
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_finance_updated_at
  BEFORE UPDATE ON public.finance_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- ============================================================
-- FUNCTION: Increment form submission counter
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_increment_form_submissions()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.forms
  SET total_submissions = total_submissions + 1
  WHERE id = NEW.form_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_submissions
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.fn_increment_form_submissions();

-- ============================================================
-- FUNCTION: Auto-create complaint ticket on poor submission
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_auto_create_ticket()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.overall_rating IS NOT NULL AND NEW.overall_rating <= 3 THEN
    INSERT INTO public.complaint_tickets (
      submission_id,
      property_id,
      guest_name,
      guest_email,
      room_number,
      description,
      status,
      sla_deadline
    ) VALUES (
      NEW.id,
      NEW.property_id,
      NEW.guest_name,
      NEW.guest_email,
      NEW.room_number,
      'Auto-created from low-rating submission. Overall rating: ' || NEW.overall_rating,
      'open',
      NOW() + INTERVAL '2 hours'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_create_ticket
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_ticket();

-- ============================================================
-- FUNCTION: Generic audit logger
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_old JSONB := NULL;
  v_new JSONB := NULL;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
  ELSE
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  END IF;

  INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(
      (v_new->>'id')::TEXT,
      (v_old->>'id')::TEXT
    ),
    TG_OP,
    v_old,
    v_new,
    current_setting('app.current_user', TRUE)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to critical tables
CREATE TRIGGER trg_audit_submissions
  AFTER INSERT OR UPDATE OR DELETE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_tickets
  AFTER INSERT OR UPDATE OR DELETE ON public.complaint_tickets
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER trg_audit_finance
  AFTER INSERT OR UPDATE OR DELETE ON public.finance_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- ============================================================
-- FUNCTION: Idempotency check for submissions
-- Prevents duplicate submission inserts from webhook retries
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_upsert_submission(
  p_idempotency_key TEXT,
  p_form_id UUID,
  p_property_id TEXT,
  p_guest_name TEXT,
  p_guest_email TEXT,
  p_guest_phone TEXT,
  p_room_number TEXT,
  p_overall_rating NUMERIC,
  p_nps_score INTEGER,
  p_routing_actions JSONB,
  p_review_link_shown BOOLEAN
)
RETURNS TABLE(id UUID, is_duplicate BOOLEAN)
LANGUAGE plpgsql AS $$
DECLARE
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  -- Check idempotency
  SELECT s.id INTO v_existing_id
  FROM public.submissions s
  WHERE s.idempotency_key = p_idempotency_key;

  IF v_existing_id IS NOT NULL THEN
    RETURN QUERY SELECT v_existing_id, TRUE;
    RETURN;
  END IF;

  -- Insert new submission
  INSERT INTO public.submissions (
    form_id, property_id, idempotency_key,
    guest_name, guest_email, guest_phone, room_number,
    overall_rating, nps_score,
    routing_actions_triggered, review_link_shown
  ) VALUES (
    p_form_id, p_property_id, p_idempotency_key,
    p_guest_name, p_guest_email, p_guest_phone, p_room_number,
    p_overall_rating, p_nps_score,
    p_routing_actions, p_review_link_shown
  )
  RETURNING submissions.id INTO v_new_id;

  RETURN QUERY SELECT v_new_id, FALSE;
END;
$$;

-- ============================================================
-- FUNCTION: Property performance summary
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_property_performance(
  p_property_id TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  property_id       TEXT,
  total_submissions BIGINT,
  avg_rating        NUMERIC,
  google_reviews    BIGINT,
  open_complaints   BIGINT,
  sla_breached      BIGINT,
  response_rate_pct NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS property_id,
    COUNT(s.id) AS total_submissions,
    ROUND(AVG(s.overall_rating), 2) AS avg_rating,
    COUNT(s.id) FILTER (WHERE s.review_link_shown = TRUE) AS google_reviews,
    COUNT(t.id) FILTER (WHERE t.status = 'open') AS open_complaints,
    COUNT(t.id) FILTER (WHERE t.sla_deadline < NOW() AND t.status NOT IN ('resolved','closed')) AS sla_breached,
    ROUND(
      COUNT(s.id) FILTER (WHERE s.guest_email IS NOT NULL)::NUMERIC
      / NULLIF(COUNT(s.id), 0) * 100
    , 2) AS response_rate_pct
  FROM public.properties p
  LEFT JOIN public.submissions s
    ON s.property_id = p.id
    AND s.submitted_at >= NOW() - (p_days || ' days')::INTERVAL
  LEFT JOIN public.complaint_tickets t
    ON t.property_id = p.id
    AND t.created_at >= NOW() - (p_days || ' days')::INTERVAL
  WHERE p.id = p_property_id
  GROUP BY p.id;
END;
$$;
```

### 2.4 Row Level Security Policies

```sql
-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE public.forms               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_rules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_answers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_tickets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_threads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_records     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: Extract role from JWT
-- JWT structure: { "role": "md" | "gm", "app_metadata": { "property_id": "silvassa" } }
-- ============================================================

-- POLICY GROUP: FORMS
-- MD: full access to all forms
CREATE POLICY "md_forms_all" ON public.forms
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'md');

-- GM: access only to their property's forms
CREATE POLICY "gm_forms_property" ON public.forms
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'gm'
    AND property_id = (auth.jwt() -> 'app_metadata' ->> 'property_id')
  );

-- Anonymous: read-only on active forms (for guest form rendering)
CREATE POLICY "anon_forms_read" ON public.forms
  FOR SELECT
  USING (is_active = TRUE);


-- POLICY GROUP: SUBMISSIONS
CREATE POLICY "md_submissions_all" ON public.submissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'md');

CREATE POLICY "gm_submissions_property" ON public.submissions
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'gm'
    AND property_id = (auth.jwt() -> 'app_metadata' ->> 'property_id')
  );

-- Service role (n8n uses service key) can insert
CREATE POLICY "service_submissions_insert" ON public.submissions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');


-- POLICY GROUP: COMPLAINT_TICKETS
CREATE POLICY "md_tickets_all" ON public.complaint_tickets
  FOR ALL USING (auth.jwt() ->> 'role' = 'md');

CREATE POLICY "gm_tickets_property" ON public.complaint_tickets
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'gm'
    AND property_id = (auth.jwt() -> 'app_metadata' ->> 'property_id')
  );


-- POLICY GROUP: FINANCE_RECORDS
CREATE POLICY "md_finance_all" ON public.finance_records
  FOR ALL USING (auth.jwt() ->> 'role' = 'md');

CREATE POLICY "gm_finance_property" ON public.finance_records
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'gm'
    AND property_id = (auth.jwt() -> 'app_metadata' ->> 'property_id')
  );


-- POLICY GROUP: EMAIL_THREADS
CREATE POLICY "md_emails_all" ON public.email_threads
  FOR ALL USING (auth.jwt() ->> 'role' = 'md');

CREATE POLICY "gm_emails_property" ON public.email_threads
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'gm'
    AND property_id = (auth.jwt() -> 'app_metadata' ->> 'property_id')
  );
```

### 2.5 Views

```sql
-- ============================================================
-- VIEWS
-- ============================================================

-- Live feedback feed (dashboard)
CREATE OR REPLACE VIEW public.vw_live_feedback_feed AS
SELECT
  s.id,
  s.submitted_at,
  s.guest_name,
  s.guest_email,
  s.room_number,
  s.overall_rating,
  s.nps_score,
  s.sentiment,
  s.review_link_shown,
  p.name           AS property_name,
  p.entity         AS legal_entity,
  p.gm_email,
  p.whatsapp_number,
  f.title          AS form_title,
  ct.id            AS ticket_id,
  ct.status        AS ticket_status,
  ct.sla_deadline
FROM public.submissions s
JOIN public.properties p  ON p.id = s.property_id
JOIN public.forms f       ON f.id = s.form_id
LEFT JOIN public.complaint_tickets ct ON ct.submission_id = s.id
ORDER BY s.submitted_at DESC;

-- Property performance leaderboard
CREATE OR REPLACE VIEW public.vw_property_leaderboard AS
SELECT
  p.id,
  p.name,
  p.entity,
  p.gm_email,
  COUNT(s.id)                                          AS total_submissions,
  ROUND(AVG(s.overall_rating), 2)                      AS avg_rating,
  COUNT(s.id) FILTER (WHERE s.review_link_shown)       AS google_reviews,
  COUNT(ct.id) FILTER (WHERE ct.status = 'open')       AS open_complaints,
  COALESCE(fr.total_revenue, 0)                        AS today_revenue,
  COALESCE(fr.occupancy_pct, 0)                        AS today_occupancy_pct
FROM public.properties p
LEFT JOIN public.submissions s    ON s.property_id = p.id
  AND s.submitted_at >= NOW() - INTERVAL '30 days'
LEFT JOIN public.complaint_tickets ct ON ct.property_id = p.id
  AND ct.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN public.finance_records fr ON fr.property_id = p.id
  AND fr.record_date = CURRENT_DATE
GROUP BY p.id, p.name, p.entity, p.gm_email, fr.total_revenue, fr.occupancy_pct;

-- Open SLA breaches
CREATE OR REPLACE VIEW public.vw_sla_breaches AS
SELECT
  ct.id,
  ct.property_id,
  p.name AS property_name,
  ct.guest_name,
  ct.room_number,
  ct.sla_deadline,
  EXTRACT(EPOCH FROM (NOW() - ct.sla_deadline))/3600 AS hours_overdue,
  ct.status,
  ct.assigned_to
FROM public.complaint_tickets ct
JOIN public.properties p ON p.id = ct.property_id
WHERE ct.sla_deadline < NOW()
  AND ct.status NOT IN ('resolved', 'closed')
ORDER BY ct.sla_deadline ASC;

-- Finance summary by entity
CREATE OR REPLACE VIEW public.vw_finance_entity_summary AS
SELECT
  entity,
  record_date,
  SUM(total_revenue)     AS total_revenue,
  SUM(room_revenue)      AS room_revenue,
  SUM(fnb_revenue)       AS fnb_revenue,
  SUM(events_revenue)    AS events_revenue,
  AVG(occupancy_pct)     AS avg_occupancy_pct,
  COUNT(property_id)     AS property_count
FROM public.finance_records
GROUP BY entity, record_date
ORDER BY record_date DESC;
```