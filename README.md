# My RC Planes

En webapplikasjon for å administrere og beregne aerodynamiske data for RC-fly. Bygget med Next.js, TypeScript, Tailwind CSS og Supabase.

## Funksjoner

- **Brukerautentisering** - Sikker innlogging og registrering via Supabase Auth
- **Fly-administrasjon** - Legg til, rediger, vis og slett RC-fly
- **Aerodynamiske beregninger** - Automatisk beregning av MAC, vingeareal og anbefalt CG
- **Bildeadministrasjon** - Last opp inntil 5 bilder per fly med thumbnail-funksjonalitet
- **Standalone kalkulator** - Rask kalkulator for aerodynamiske beregninger uten lagring
- **Responsivt design** - Fungerer på desktop, tablet og mobil

## Teknologier

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Autentisering**: Supabase Auth med e-post/passord
- **Database**: PostgreSQL med Row Level Security (RLS)
- **Bildeopplasting**: Supabase Storage

## Kom i gang

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Sett opp Supabase

1. Opprett et Supabase-prosjekt på [supabase.com](https://supabase.com)
2. Kopier Project URL og anon public key
3. Opprett en `.env.local` fil i prosjektets rot:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Kjør database migrations

Gå til Supabase Dashboard → SQL Editor og kjør følgende migrations i rekkefølge:

1. `supabase/migrations/001_initial_schema.sql` - Oppretter tabeller og RLS policies
2. `supabase/migrations/002_storage_setup.sql` - Setter opp storage bucket for bilder

### 4. Aktiver Email Auth

1. Gå til Authentication → Settings i Supabase Dashboard
2. Aktiver Email provider
3. Konfigurer SMTP-innstillinger (eller bruk Supabase sitt standard SMTP)

### 5. Start utviklingsserver

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Prosjektstruktur

```
myrcplanes/
├── app/
│   ├── page.tsx              # Hovedside med flyliste
│   ├── calculator/
│   │   └── page.tsx          # Standalone kalkulator
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styling
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx     # Innloggingsskjema
│   │   └── SignUpForm.tsx    # Registreringsskjema
│   ├── planes/
│   │   ├── PlaneList.tsx     # Liste over fly
│   │   ├── PlaneForm.tsx     # Legg til/rediger fly
│   │   ├── PlaneDetails.tsx  # Detaljvisning
│   │   ├── ImageUpload.tsx   # Bildeopplasting
│   │   └── ImageGallery.tsx  # Bildegalleri
│   └── calculator/
│       └── Calculator.tsx    # Kalkulator-komponent
├── lib/
│   ├── supabaseClient.ts     # Supabase klient
│   ├── planeCalculations.ts  # Aerodynamiske beregninger
│   ├── imageService.ts       # Bildehåndtering
│   └── types.ts              # TypeScript types
├── hooks/
│   └── usePlaneCalculations.ts # Custom hook for beregninger
└── supabase/
    └── migrations/           # Database migrations
```

## Database-struktur

### Tabeller

- **user_profiles** - Brukerprofiler med fornavn, etternavn og profilbilde
- **rc_planes** - RC-fly med målinger og beregnede verdier
- **plane_images** - Bilder tilknyttet fly (maks 5 per fly)

### Sikkerhet

Alle tabeller har Row Level Security (RLS) aktivert:
- Brukere kan kun se og redigere sine egne data
- Bilder er lagret i public bucket men organisert per bruker

## Aerodynamiske beregninger

Appen beregner automatisk:

- **Vingeareal** - Totalt areal av vingen
- **Haleareal** - Totalt areal av halen (beregnes fra målinger)
- **MAC** - Mean Aerodynamic Chord (gjennomsnittlig kordlengde)
- **CG-område** - Anbefalt tyngdepunkt fra 25% til 33% av MAC

### Målinger som kreves:

**For vingen:**
- Vingespenn (cm)
- Rot korde - kordlengde ved vingeroten (cm)
- Tipp korde - kordlengde ved vingetippen (cm)
- Sweep - valgfritt (0 for rette vinger)

**For halen (valgfritt):**
- Hale spenn - halens vingespenn (cm)
- Hale rot korde - halens rotkorde (cm)
- Hale tipp korde - valgfritt, bruker rotkorde hvis ikke angitt (for firkantet hale)

**Andre målinger:**
- Avstand vinge-hale (valgfritt)

## Deployment

### Vercel (Anbefalt)

1. Push koden til GitHub
2. Importer prosjektet i Vercel
3. Legg til environment variables (NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Deploy!

### Andre plattformer

Appen kan deployes på enhver plattform som støtter Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Husk å sette environment variables på valgt plattform.

## Lisens

Dette er et privat prosjekt.
