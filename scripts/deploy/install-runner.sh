#!/bin/sh
# Installs the GitHub Actions self-hosted runner inside the ct302 LXC container
# and registers it for RehaJakub/homedetailling with the label `ct302`.
#
# Run as root inside the container (through the homelab jump host):
#   ssh homelab "lxc-attach -n ct302 -- env RUNNER_TOKEN=... sh -s" < scripts/deploy/install-runner.sh
#
# RUNNER_TOKEN is the registration token a repository admin gets from
# Settings -> Actions -> Runners -> New self-hosted runner (valid one hour).
# Without it the script only prepares the user, the directories and the runner
# files; run it again with the token to finish the registration.
set -eu

RUNNER_VERSION="${RUNNER_VERSION:-2.337.0}"
RUNNER_USER=runner
RUNNER_DIR=/opt/actions-runner
APP_DIR=/opt/homedetailing
REPO_URL=https://github.com/RehaJakub/homedetailling

if ! id "$RUNNER_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir /home/$RUNNER_USER --shell /bin/bash --groups docker "$RUNNER_USER"
  echo "created user $RUNNER_USER"
fi
usermod -aG docker "$RUNNER_USER"

mkdir -p "$APP_DIR" "$RUNNER_DIR"
chown "$RUNNER_USER:$RUNNER_USER" "$APP_DIR" "$RUNNER_DIR"

if [ ! -x "$RUNNER_DIR/run.sh" ]; then
  tarball="actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
  curl -fsSL -o "/tmp/$tarball" "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/$tarball"
  su -s /bin/sh "$RUNNER_USER" -c "tar -xzf /tmp/$tarball -C $RUNNER_DIR"
  rm -f "/tmp/$tarball"
  "$RUNNER_DIR/bin/installdependencies.sh" >/dev/null
  echo "runner $RUNNER_VERSION unpacked into $RUNNER_DIR"
fi

if [ -f "$RUNNER_DIR/.runner" ]; then
  echo "runner already registered"
elif [ -n "${RUNNER_TOKEN:-}" ]; then
  su -s /bin/sh "$RUNNER_USER" -c "cd $RUNNER_DIR && ./config.sh --unattended --url $REPO_URL --token '$RUNNER_TOKEN' --name ct302 --labels ct302 --work _work --replace"
  (cd "$RUNNER_DIR" && ./svc.sh install "$RUNNER_USER" && ./svc.sh start)
  echo "runner registered and started as a systemd service"
else
  echo "RUNNER_TOKEN not set: registration skipped, run again with RUNNER_TOKEN=..."
fi

if [ ! -f "$APP_DIR/.env.production" ]; then
  echo "note: $APP_DIR/.env.production is missing; create it from .env.production.example before the first deploy"
fi
