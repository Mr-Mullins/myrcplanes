# Supabase Setup Guide

Følg disse stegene for å sette opp Supabase for My RC Planes.

## 1. Opprett Supabase-prosjekt

1. Gå til [supabase.com](https://supabase.com)
2. Klikk "Start your project" og logg inn
3. Klikk "New Project"
4. Fyll inn:
   - **Name**: My RC Planes
   - **Database Password**: (velg et sterkt passord og lagre det)
   - **Region**: Velg nærmeste region (f.eks. Europe West)
5. Klikk "Create new project"
6. Vent mens prosjektet settes opp (tar ca 2 minutter)

## 2. Hent API-nøkler

1. Når prosjektet er klart, gå til **Settings** (tannhjul-ikonet i sidemenyen)
2. Gå til **API**
3. Under "Project API keys" finner du:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbG...` (lang nøkkel)
4. Kopier disse verdiene

## 3. Konfigurer lokalt miljø

1. Opprett `.env.local` fil i prosjektets rot:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

2. Erstatt verdiene med dine egne fra steg 2

## 4. Kjør database migrations

### Migrasjon 1: Database-tabeller

1. Gå til **SQL Editor** i Supabase Dashboard (lyn-ikon i sidemenyen)
2. Klikk "New query"
3. Åpne `supabase/migrations/001_initial_schema.sql` fra prosjektet
4. Kopier hele innholdet
5. Lim inn i SQL Editor
6. Klikk "Run" (eller Cmd/Ctrl + Enter)
7. Sjekk at du får "Success. No rows returned"

### Migrasjon 2: Storage setup

1. I SQL Editor, klikk "New query"
2. Åpne `supabase/migrations/002_storage_setup.sql` fra prosjektet
3. Kopier hele innholdet
4. Lim inn i SQL Editor
5. Klikk "Run"
6. Sjekk at du får "Success"

## 5. Verifiser setup

### Sjekk tabeller

1. Gå til **Table Editor** (tabellikon i sidemenyen)
2. Du skal se følgende tabeller:
   - `user_profiles`
   - `rc_planes`
   - `plane_images`

### Sjekk Storage

1. Gå til **Storage** (mappikon i sidemenyen)
2. Du skal se en bucket: `plane-images`

## 6. Aktiver Email Authentication

1. Gå til **Authentication** → **Providers** i sidemenyen
2. Under "Auth Providers", finn **Email**
3. Aktiver "Enable Email provider" hvis ikke allerede aktivert
4. Konfigurer følgende:
   - **Confirm email**: Slå på hvis du vil at brukere må bekrefte e-post
   - **Secure email change**: Anbefalt å ha på
5. Klikk "Save"

### SMTP-innstillinger (valgfritt men anbefalt)

For produksjon bør du sette opp egen SMTP:

1. Gå til **Settings** → **Auth** → **SMTP Settings**
2. Aktiver "Enable Custom SMTP"
3. Fyll inn dine SMTP-detaljer (f.eks. SendGrid, Mailgun, eller Gmail)
4. Test og lagre

For utvikling kan du bruke Supabase sitt innebygde SMTP (men det har begrensninger).

## 7. Test applikasjonen

1. Start utviklingsserveren:
```bash
npm run dev
```

2. Gå til [http://localhost:3000](http://localhost:3000)

3. Test følgende:
   - Registrer en ny bruker
   - Logg inn
   - Legg til et fly
   - Last opp et bilde
   - Test kalkulatoren

## Feilsøking

### "Mangler Supabase URL eller Key"

- Sjekk at `.env.local` finnes i prosjektets rot
- Sjekk at variabelnavnene er korrekte (NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Restart utviklingsserveren etter å ha endret `.env.local`

### Får ikke registrert bruker

- Sjekk at Email provider er aktivert i Authentication → Providers
- Sjekk spam-mappen for bekreftelses-e-post
- I utvikling kan du slå av "Confirm email" for lettere testing

### Kan ikke laste opp bilder

- Sjekk at migration 002_storage_setup.sql er kjørt
- Sjekk at bucket "plane-images" finnes i Storage
- Sjekk at RLS policies er korrekt satt opp

### Database-feil

- Sjekk at begge migrations er kjørt uten feil
- Gå til Table Editor og verifiser at tabellene finnes
- Sjekk SQL Editor → History for feilmeldinger

## Nyttige lenker

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)


