create or replace function get_storage_settings()
returns json
language plpgsql
security definer
as $$
begin
  return json_build_object(
    'enabled', true,
    'buckets', (
      select json_agg(json_build_object(
        'name', name,
        'public', public,
        'file_size_limit', file_size_limit,
        'allowed_mime_types', allowed_mime_types
      ))
      from storage.buckets
    )
  );
end;
$$;