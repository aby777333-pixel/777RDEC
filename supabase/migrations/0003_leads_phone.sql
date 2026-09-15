-- Phone number on the lead forms.
--
-- APPLIED to project ixpqkvyxqvmllottnvgi as migration `leads_phone`.
--
-- Optional, stored in E.164 (+<country code><number>), validated for the chosen
-- country before it reaches the table. Nullable, so every existing row and any
-- submission without a phone number is unaffected. The tables keep RLS with no
-- policies and no client grants (see 0001 and 0002): only the service role
-- writes here.

alter table demo_requests add column if not exists phone text;
alter table contact_messages add column if not exists phone text;
