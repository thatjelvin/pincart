-- PinCart AI — Cache metadata (Redis fallback tracking)
-- Allows the app to log and monitor cache behaviour

CREATE TABLE IF NOT EXISTS public.cache_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL,
  source text NOT NULL DEFAULT 'redis',
  hit boolean NOT NULL DEFAULT false,
  ttl_seconds integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_cache_metadata_key ON public.cache_metadata (cache_key);
CREATE INDEX idx_cache_metadata_created ON public.cache_metadata (created_at);

-- Cleanup: auto-delete entries older than 7 days (run via pg_cron or scheduled function)
CREATE OR REPLACE FUNCTION public.cleanup_cache_metadata()
RETURNS void AS $$
BEGIN
  DELETE FROM public.cache_metadata
   WHERE created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
