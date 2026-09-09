-- Defence in depth for the lead tables.
--
-- RLS with no policies already denies anon and authenticated every row, and
-- that was verified against the live database: as anon, SELECT returned 0 rows
-- while a row existed, and INSERT failed with
--   42501: new row violates row-level security policy
--
-- But the table-level GRANTs to those roles still existed, so a single
-- permissive policy added later — by hand, or by a tool — would have exposed
-- the data immediately. Revoking the privilege means the role cannot reach
-- these tables even if a policy says otherwise.
--
-- The service role bypasses both RLS and these grants, so the Server Actions
-- in src/lib/forms/actions.ts are unaffected.

revoke all on table demo_requests from anon, authenticated;
revoke all on table contact_messages from anon, authenticated;
revoke all on table newsletter_subscribers from anon, authenticated;

-- Stop future tables in this schema being granted to client roles by default.
alter default privileges in schema public revoke all on tables from anon, authenticated;
