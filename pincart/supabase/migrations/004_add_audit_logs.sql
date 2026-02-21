-- PinCart AI — Audit logs for security & compliance

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs (created_at);

-- RLS — only admins should read audit logs; users can see their own
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Cleanup: remove entries older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs
   WHERE created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
