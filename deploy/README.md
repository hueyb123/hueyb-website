# Migrating hueyb.com to the Debian VPS

Netlify is production for now. These files get the target server ready
ahead of time so the actual cutover (repointing DNS) is a quick, low-risk
last step once the friend's server is available.

Architecture: **nginx in front, Apache behind it.** nginx owns ports 80/443,
handles TLS and gzip, and reverse-proxies to Apache on `127.0.0.1:8090`,
which serves the built static site from disk. Apache never listens on a
public interface.

## One-time server setup

Run as a user with sudo, on a fresh Debian box.

```bash
sudo apt update
sudo apt install -y nginx apache2 certbot python3-certbot-nginx git rsync

# Node, for building the site (matches what's used locally — check with
# `node -v` here and adjust the NodeSource major version below if needed).
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Clone the repo** (heads-up: `.git` history is a couple GB — this site
keeps media in git — make sure the VPS has a few GB free before cloning):

```bash
sudo mkdir -p /var/www/hueyb-website
sudo chown "$USER":"$USER" /var/www/hueyb-website
git clone git@github.com:hueyb123/hueyb-website.git /var/www/hueyb-website
```

That'll need a deploy key or SSH access to the GitHub repo set up on the
VPS first (`ssh-keygen`, add the public key as a GitHub deploy key with
read access).

**Apache**: add the internal listen port, drop in the vhost, enable it.

```bash
echo "Listen 127.0.0.1:8090" | sudo tee -a /etc/apache2/ports.conf
sudo cp deploy/apache-hueyb.conf /etc/apache2/sites-available/hueyb.com.conf
sudo a2ensite hueyb.com
sudo a2enmod headers expires rewrite
sudo apachectl configtest
sudo systemctl reload apache2
```

**nginx**: drop in the site config, get it enabled before requesting a
cert (certbot's HTTP-01 challenge needs port 80 answering first).

```bash
sudo cp deploy/nginx-hueyb.conf /etc/nginx/sites-available/hueyb.com
sudo ln -s /etc/nginx/sites-available/hueyb.com /etc/nginx/sites-enabled/
sudo mkdir -p /var/www/certbot
sudo nginx -t && sudo systemctl reload nginx
```

**TLS**: run certbot against the *apex* domain first — this DNS won't
point here yet, so do this step during/after the DNS cutover below, not
before (certbot needs to actually reach the box over HTTP to verify).

```bash
sudo certbot --nginx -d hueyb.com -d www.hueyb.com
```

**Firewall** (ufw), if not already handled elsewhere:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

**First build**:

```bash
cd /var/www/hueyb-website
npm ci
npm run build
```

At this point `curl http://127.0.0.1:8090/` on the box itself should return
the homepage HTML — confirms Apache is serving the build before nginx or
DNS are involved at all.

## Deploys after that

`deploy/deploy.sh` pulls `origin/main`, rebuilds, and reloads Apache. Run it
by hand over SSH whenever you want to push a new deploy, or wire it to
auto-run — two easy options once this is the primary host:

- **Cron**, polling every few minutes (`crontab -e`):
  `*/5 * * * * /var/www/hueyb-website/deploy/deploy.sh >> /var/log/hueyb-deploy.log 2>&1`
- **GitHub webhook**: a tiny listener (e.g. `webhook` from Debian's repo, or
  a 10-line Express endpoint) that runs `deploy.sh` when GitHub pings it on
  push. More instant than cron; more setup. Worth doing later, not needed
  for the initial cutover.

```bash
chmod +x deploy/deploy.sh
```

## The Decap CMS admin panel — the one real gap

Right now the CMS backend for content editing is Netlify Identity +
git-gateway, which is Netlify-specific and **stops working the moment this
site isn't on Netlify.** `/admin/` will still load but logging in will
fail. Two ways to keep editing content once you're off Netlify:

1. **Keep doing what you already do locally**: `npm run dev` +
   `npx decap-server`, edit through `localhost:8080/admin/`, commit, push.
   `deploy.sh` (or the cron/webhook wiring above) picks up the push and
   redeploys automatically. Zero extra infrastructure — this is the
   recommended path unless you need to edit content from somewhere other
   than this machine.
2. **A hosted git backend for `/admin/` itself**: switch `src/admin/config.yml`'s
   backend from `git-gateway` to `github`, and stand up a small OAuth proxy
   (e.g. the community `netlify-cms-github-oauth-provider` project) so
   Decap can authenticate against GitHub directly from the VPS. More moving
   parts — only worth it if editing needs to happen from the live site's
   own `/admin/` rather than locally.

Not needed for the initial "get it live" cutover — content editing keeps
working exactly as it does today either way; this only matters once you're
fully off Netlify and want `/admin/` on hueyb.com itself to work again.

## Cutover checklist (when the friend's server is ready)

1. Complete the one-time setup above; confirm `curl http://127.0.0.1:8090/`
   on the box returns the current homepage.
2. Point DNS: `hueyb.com` / `www.hueyb.com` A (and AAAA, if the box has
   IPv6) records to the VPS's IP. Keep the TTL low a day ahead of time so
   the switch propagates fast.
3. Once DNS has propagated to the VPS, run the certbot command above to
   issue TLS certs, then reload nginx.
4. Confirm `https://hueyb.com` serves correctly from the VPS.
5. Remove/park the Netlify site (or just leave it — DNS no longer points
   there, so it stops mattering) once the VPS is confirmed stable.
