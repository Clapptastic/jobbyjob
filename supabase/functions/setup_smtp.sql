create or replace function setup_smtp(api_key text)
returns void
language plpgsql
security definer
as $$
begin
  -- Validate API key
  if not api_key ~ '^SG\.' then
    raise exception 'Invalid SendGrid API key format';
  end if;

  -- Configure SMTP settings
  insert into auth.config (key, value)
  values 
    ('SMTP_ADMIN_EMAIL', current_setting('app.settings.admin_email', true)),
    ('SMTP_HOST', 'smtp.sendgrid.net'),
    ('SMTP_PORT', '587'),
    ('SMTP_USER', 'apikey'),
    ('SMTP_PASS', api_key),
    ('SMTP_SENDER_NAME', 'ClappCode'),
    ('MAILER_SECURE_EMAIL_CHANGE_ENABLED', 'true'),
    ('MAILER_OTP_EXP', '3600')
  on conflict (key) do update
  set value = excluded.value;
end;
$$;