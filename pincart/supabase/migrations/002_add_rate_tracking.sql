-- PinCart AI — Rate / usage tracking per user
-- Tracks API calls to enforce plan-level limits

CREATE TABLE IF NOT EXISTS public.api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT date_trunc('hour', now()),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_usage_user_window
  ON public.api_usage (user_id, window_start);

-- RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own usage"
  ON public.api_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Helper: count requests in current billing period
CREATE OR REPLACE FUNCTION public.get_usage_count(
  p_user_id uuid,
  p_endpoint text DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
  total integer;
  reset_at timestamp with time zone;
BEGIN
  SELECT u.usage_reset_at INTO reset_at
    FROM public.users u WHERE u.id = p_user_id;

  IF p_endpoint IS NOT NULL THEN
    SELECT COALESCE(SUM(request_count), 0) INTO total
      FROM public.api_usage
     WHERE user_id = p_user_id
       AND endpoint = p_endpoint
       AND created_at >= COALESCE(reset_at, '1970-01-01');
  ELSE
    SELECT COALESCE(SUM(request_count), 0) INTO total
      FROM public.api_usage
     WHERE user_id = p_user_id
       AND created_at >= COALESCE(reset_at, '1970-01-01');
  END IF;

  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
