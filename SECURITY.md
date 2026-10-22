# Security

## What this changes on a TV

CleanYourTV runs a service as root on a rooted TV. It listens on `127.0.0.1:8765` only. Two short-lived pages open on
the local network on request, and an optional notification endpoint (off by default): the Live TV pairing page (port 8766, a 6-digit code shown on the TV, ten minutes) and the
share-log page (port 8768 and up, a random address, ten minutes, masked report).

## Network notifications

Off until switched on in the manager app. It then listens on port 8767 for `POST /notify` with
`Authorization: Bearer <token>` (a random 192-bit token kept in `config.json`, readable by root only). It exposes only
the notification call. Wrong tokens lock an address out for ten minutes, requests are limited to 20 a minute and 32 KB,
and an optional `allow` list restricts addresses. It is plain HTTP: the token can be read by anyone who can watch the
traffic on your network.

## Trust

Everything it installs comes from this repository's GitHub releases and runs as root. Releases carry a SHA-256 file,
which detects corruption but not a compromised repository. Download only from the release page of this repository.

## Limits to know about

- Any app on the TV can already run root commands through the Homebrew Channel; apps are not a security boundary on a
  rooted TV.
- `/media/developer` is world-writable on webOS. The setup removes group and other write access from this project's
  files and keeps the playlist and settings files owner-only, but the parent folder remains writable.
- The service API refuses requests from web pages (any `http(s)` origin); local apps and scripts are accepted.

## Reporting

Open a private security advisory on the GitHub repository, or an issue that does not include exploit details.
