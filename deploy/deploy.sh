#!/usr/bin/env bash
# Pulls the latest commit, rebuilds the static site, and syncs it into
# Apache's docroot. Run manually over SSH, or wire to a git post-receive
# hook / small webhook listener for auto-deploy on push (see README.md).
set -euo pipefail

REPO_DIR="/var/www/hueyb-website"
DOCROOT="/var/www/hueyb-website/_site"

cd "$REPO_DIR"

echo "==> Pulling latest main"
git fetch origin
git reset --hard origin/main

echo "==> Installing dependencies"
npm ci

echo "==> Building"
npm run build

# _site IS the docroot in this layout (see apache-hueyb.conf DocumentRoot),
# so the build already lands in place. If you instead want the repo and
# docroot kept as separate directories, swap the build step above for a
# build-then-rsync:
#   rsync -a --delete "$REPO_DIR/_site/" "$DOCROOT/"

echo "==> Reloading Apache"
sudo systemctl reload apache2

echo "==> Done: $(git rev-parse --short HEAD)"
