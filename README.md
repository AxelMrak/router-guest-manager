# Administrador de Invitados del Router

Aplicación para gestionar el acceso WiFi de invitados en routers TOTOLINK — bloqueo automático por tiempo, filtrado de dispositivos y panel de control en tiempo real.

---

## Requisitos

- [Bun](https://bun.sh/) (runtime JavaScript)
- Router TOTOLINK accesible desde la red local en `192.168.0.1`

---

## Configuración inicial

### 1. Credenciales del router

Copiá el archivo de ejemplo y editalo con tu usuario y contraseña:

```bash
cp config.example.json config.json
```

Editá `config.json` y completá los campos:

```json
{
  "routerUsername": "TU_USUARIO",
  "routerPassword": "TU_CONTRASEÑA",
  "guestInterfaces": ["ra2", "rax2"],
  "maxMinutes": 20,
  "autoBlockEnabled": true,
  "pollIntervalSeconds": 60
}
```

> **Nunca subas `config.json` a git.** Ya está en `.gitignore` para que tus credenciales queden solo en tu máquina.

### 2. Interfaces de invitados

En `guestInterfaces` poné los nombres de las interfaces WiFi que querés tratar como "invitados". Podés encontrar estos valores en la columna **Interfaz** de la vista extendida del panel (clic en cualquier fila de la tabla).

Los valores típicos son `ra2`, `rax2` (2.4 GHz y 5 GHz de invitados).

### 3. Parámetros

| Campo | Descripción |
|---|---|
| `maxMinutes` | Tiempo máximo que un invitado puede estar conectado antes del bloqueo automático |
| `autoBlockEnabled` | Activar/desactivar el bloqueo automático (`true` / `false`) |
| `pollIntervalSeconds` | Cada cuántos segundos el backend verifica si hay invitados que excedieron el tiempo |

---

## Inicio rápido

### macOS / Linux

```bash
chmod +x start.sh
./start.sh
```

### Windows

```cmd
start.bat
```

Ambos scripts instalan automáticamente las dependencias y levantan el backend (puerto `3000`) y el frontend (puerto `5173`).

Después abrí **http://localhost:5173** en el navegador.

---

## Funcionalidades

- **Panel de control** — resumen de dispositivos (total, en línea, invitados, bloqueados)
- **Filtrado por columnas** — estado, tipo de conexión, invitado, bloqueado
- **Indicadores de velocidad** — subida y bajada en tiempo real
- **Íconos de conexión** — 5 GHz, 2.4 GHz, cableado
- **Vista extendida** — clic en cualquier fila para ver MAC, IP, hostname, interfaz, TX/RX rate, 802.11k/v
- **Bloqueo/desbloqueo manual** — un clic desde la tabla
- **Bloqueo automático** — los invitados que exceden el tiempo máximo se bloquean solos
- **Configuración** — toggle de auto-bloqueo, tiempo máximo, intervalo de sondeo, interfaces de invitados

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Backend | Bun + Hono (TypeScript) |
| Frontend | React + Vite + TailwindCSS v4 + TanStack Query |
| API del router | UBUS JSON-RPC (`192.168.0.1/ubus`) |
