# apple tree · OC garden house

Cute bilingual OC profile website for three original characters, styled like a handmade garden scrapbook.

## Run locally

```bash
npm install
npm run dev
```

The frontend works without any account setup. Owner login in demo mode is `admin@example.com` / `appletree`. Changes made in the garden desk are saved to the current browser with localStorage.

## Deploy to Vercel

Import the repository into Vercel. The included `/api/login.js` and `/api/content.js` serverless routes will deploy automatically.

For persistent content editing, create the table in `supabase.sql` and add these Vercel environment variables:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

With the Supabase variables configured, the login form uses Supabase Auth email/password sessions. Create your owner user in Supabase Dashboard → Authentication → Users, then use that email and password in the website. `ADMIN_EMAIL` is optional; when set, only that Supabase user can save the garden.

Without Supabase variables, the API remains in safe demo mode and the site still renders all seeded content.

## Content and images

The three supplied reference images are currently used as temporary character/gallery artwork. Replace `src/assets/miona.jpg`, `src/assets/arin.jpg`, and `src/assets/elsia.jpg` when the final character images are ready. The profile picture and small About Me note intentionally remain placeholders as requested.
