# Uso de GitHub Codespaces para levantar LocalAI (Ágora)

Si no puedes usar Docker localmente (p. ej. en entornos cloud gaming como Shadow), puedes usar GitHub Codespaces para ejecutar LocalAI y el entorno de desarrollo.

Pasos rápidos:

1. Abre el repo en GitHub y crea un Codespace (botón "Code" → "Open with Codespaces" → "New codespace")
2. Codespaces usará la configuración en `.devcontainer/` y levantará los servicios definidos en `docker-compose.yml`.
3. Una vez iniciado, en la terminal del Codespace ejecuta:

```bash
# Ver contenedores
docker ps

# Ver logs de LocalAI
docker logs agora-localai-codespace --tail 200

# Probar health
curl http://localhost:8080/health
```

4. Abre `http://localhost:8080` en la vista de puertos de Codespaces (Forwarded Ports) o usa el reenvío que ofrece Codespaces.

Notas:
- El directorio `localai-models/` está montado en el workspace para que puedas subir modelos y configuraciones.
- Ajusta `THREADS` en `.devcontainer/docker-compose.yml` según la capacidad del Codespace.

Scripts de ayuda incluidos
-------------------------
En `.devcontainer/scripts/` encontrarás dos scripts que facilitan comprobar y arrancar LocalAI dentro del Codespace:

- `check-localai.sh` — script Bash. Uso:
	```bash
	# desde el Codespace
	bash .devcontainer/scripts/check-localai.sh
	```

- `check-localai.ps1` — script PowerShell. Uso:
	```powershell
	# desde el Codespace PowerShell
	.devcontainer\scripts\check-localai.ps1
	```

Ambos scripts intentan arrancar el servicio `localai` (vía `docker compose up -d localai`), muestran el estado del contenedor, los últimos logs y prueban el endpoint `http://localhost:8080/health`.

