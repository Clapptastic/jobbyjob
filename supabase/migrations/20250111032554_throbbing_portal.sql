-- Helper functions setup
begin;

-- Create function to handle new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
    return new;
end;
$$ language plpgsql security definer;

-- Create function to check if user is admin
create or replace function auth.is_admin()
returns boolean as $$
begin
    return exists (
        select 1 
        from auth.admin_users 
        where email = auth.email()
    );
end;
$$ language plpgsql security definer;

-- Create function to add admin user
create or replace function auth.add_admin_user(admin_email text)
returns void as $$
begin
    insert into auth.admin_users (id, email)
    select id, email 
    from auth.users 
    where email = admin_email
    on conflict (email) do nothing;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

commit;