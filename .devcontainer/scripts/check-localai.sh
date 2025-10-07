#!/usr/bin/env bash
# Check and start LocalAI service and show status/logs
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)/.."
echo "Workspace root: $ROOT"

echo "Ensuring localai service is up via docker compose..."
cd "$ROOT/.devcontainer"

if docker compose ps localai >/dev/null 2>&1; then
  echo "Docker compose available. Starting (if needed) localai..."
  docker compose up -d localai || true
else
  echo "docker compose not available or not configured. Trying docker run fallback..."
  docker run -d --name agora-localai-codespace --restart unless-stopped -p 8080:8080 -v "$ROOT/localai-models:/models" -e MODELS_PATH=/models -e THREADS=2 localai/localai:latest || true
fi

echo "Waiting 8 seconds for LocalAI to initialize..."
sleep 8

echo
echo "Container status (matching agora-localai):"
docker ps --filter "name=agora-localai" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

echo
echo "Last 200 log lines (if container exists):"
docker logs agora-localai-codespace --tail 200 || docker logs agora-localai --tail 200 || true

echo
echo "Checking health endpoint http://localhost:8080/health"
if command -v curl >/dev/null 2>&1; then
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || true)
  echo "HTTP status: ${status}"
else
  echo "curl not found; try: Invoke-RestMethod -Uri http://localhost:8080/health -Method Get (PowerShell)"
fi

echo "Done. If health returns 200 open the port in Codespaces 'Ports' panel to preview UI."
