param()

Write-Host "Checking LocalAI service in Codespace..."

$root = Resolve-Path "$PSScriptRoot\..\.."
Write-Host "Workspace root: $root"

Set-Location -Path "$PSScriptRoot\.."

try {
    Write-Host "Starting localai via docker compose (detached)..."
    docker compose up -d localai
} catch {
    Write-Host "docker compose failed or not available. Trying docker run fallback..."
    docker run -d --name agora-localai-codespace --restart unless-stopped -p 8080:8080 -v "$root\localai-models:/models" -e MODELS_PATH=/models -e THREADS=2 localai/localai:latest
}

Write-Host "Waiting 8 seconds for LocalAI to initialize..."
Start-Sleep -Seconds 8

Write-Host "Container status (matching agora-localai):"
docker ps --filter "name=agora-localai" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"

Write-Host "\nLast 200 log lines (if container exists):"
try {
    docker logs agora-localai-codespace --tail 200
} catch {
    try { docker logs agora-localai --tail 200 } catch { Write-Host "No logs available" }
}

Write-Host "\nChecking health endpoint http://localhost:8080/health"
try {
    $resp = Invoke-RestMethod -Uri http://localhost:8080/health -Method Get -ErrorAction Stop
    Write-Host "Health response OK"
} catch {
    Write-Host "Health check failed: $_"
}

Write-Host "Done. If health returns 200 open the port in Codespaces 'Ports' panel to preview UI."
