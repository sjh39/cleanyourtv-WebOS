# Service API

The service runs as root on `127.0.0.1:8765` and answers JSON. It is what the launcher, the manager and the other apps use, and
you can call it from a shell on the TV (for example over SSH).

!!! note "Who may call it"
    Requests from web pages with an `http(s)` origin are refused, so a page opened in the TV's browser cannot drive the service.
    Local apps and scripts (no `Origin` header) are accepted.

| Endpoint | Purpose |
|---|---|
| `GET /api/apps` | Installed apps, config, usage, version |
| `POST /api/launch` `{id, params}` | Launch an app |
| `GET /api/inputs` | HDMI inputs and their state |
| `POST /api/notify` | Picture notification (on the network: `POST :8767/notify` with the token) |
| `GET /api/voice/status`, `POST /api/voice/install`, `/uninstall`, `/set`, `/listen`, `/ask`, `/forget` | Optional voice function and AI chat |
| `GET /api/live/status`, `/api/live/channels`, `/api/live/epg` | Live TV data |
| `POST /api/live/settings`, `/api/live/refresh`, `/api/live/reset` | Live TV setup |
| `GET /api/manager/status` | Versions, updates, options, hook state |

## Examples

```sh
# launch an app
curl -X POST localhost:8765/api/launch -d '{"id":"com.palm.app.settings"}'

# show a picture notification without a token (from the TV itself)
curl -X POST localhost:8765/api/notify -d '{"title":"Hello","text":"From a shell","seconds":8}'

# the service version and updates
curl -s localhost:8765/api/manager/status
```

See the pages for [Live TV](live-tv.md), [Picture notifications](notifications.md) and [Voice](voice.md) for their bodies.
