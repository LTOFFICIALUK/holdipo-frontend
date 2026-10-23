# holdipo frontend

Next.js site for holdipo.fun. Deploy on Vercel.

Env (Vercel project settings):

- `API_URL` the Railway URL of the holdipo server, no trailing slash. `/api/*` is proxied there, so set it before building.
- `NEXT_PUBLIC_X_HANDLE` holdipofun
- `NEXT_PUBLIC_SITE_URL` https://holdipo.fun

The footer is pinned to the bottom, shows X and the CA. The CA appears by itself once the server sees the coin launch.
