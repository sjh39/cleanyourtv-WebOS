# Picture notifications

The `com.cleanyourtv.notify` app shows a card (picture, title, text) over whatever is on screen without taking the remote. Other
devices send it with a POST request, for example Home Assistant showing a camera snapshot when the doorbell rings.

## Enable it

In the manager app: **Network notifications** > **Accept notifications from the network**. **How to send** then shows the address,
the token and an example. **Show as QR code** shows the host, port and token as a QR code of plain text (not a web address, so the phone does not open it): scan it with a
phone and copy them from the text the camera shows (for Home Assistant, for example), instead of typing a 48-character token.

!!! warning "The token is a secret"
    Anyone who has it and can reach the TV can show cards on its screen. **New token** replaces it.

## Sending one

```sh
curl -X POST http://192.168.1.50:8767/notify \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"title":"Front door","text":"Someone is at the door","image":"http://192.168.1.20/snapshot.jpg","seconds":15,"position":"top-right"}'
```

| Field | Meaning |
|---|---|
| `title`, `text` | Up to 120 and 400 characters; either may be empty. |
| `image` | `http(s)` address of a picture, up to 6 MB. |
| `seconds` | Display time, 2 to 120 (default 8). |
| `position` | `top`, `middle` or `bottom` plus `left`, `center` or `right` (default `top-right`). |

## Home Assistant

```yaml
rest_command:
  tv_notify:
    url: "http://192.168.1.50:8767/notify"
    method: POST
    headers:
      Authorization: "Bearer <token>"
      Content-Type: "application/json"
    payload: '{"title":"{{ title }}","text":"{{ text }}","image":"{{ image }}","seconds":15}'
```

## Limits and safety

- The port (default 8767) and an allow list of addresses are in `config.json` under `notifyApi`:
  `{"enabled":true,"port":8767,"allow":["192.168.1.0/24"]}` (prefixes /8, /16 and /24 are supported).
- Requests use **plain HTTP**, so the token is visible to anyone who can watch your network traffic. Keep the TV on a network you trust.
- Ten wrong tokens lock an address out for ten minutes, and at most 20 notifications a minute are accepted.
- From a shell on the TV, `POST localhost:8765/api/notify` accepts the same body without a token.

See [Security](security.md#network-notifications).
