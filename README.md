# Start Signal

Pitcher start-review dashboard with an admin area and password-protected player reports,
hosted entirely on GitHub Pages. No server, no database, no AI.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Admin tool (sign-in required) |
| `app.js` | All app logic: grading, charts, admin, player view |
| `styles.css` | Styling |
| `papaparse.min.js` | CSV parser (MIT license) |
| `robots.txt` | Asks search engines not to index the site |
| `admin.json` | Created on first sign-in: lets the tool check the admin passphrase (contains no secrets) |
| `players/<folder>/` | Created by the tool: `index.html` (player page) + `report.json` (encrypted report) |

## Admin sign-in

- **GitHub token:** a fine-grained personal access token limited to this repository with
  *Contents: Read and write*. It lets the tool save player folders into the repo.
- **Admin passphrase:** set on first sign-in. It unlocks every player report and password.
  It cannot be recovered, so store it in a password manager.

## Security model

Each report is encrypted in the browser (AES-256-GCM) before it is saved. It can be opened
only with that player's password or the admin passphrase. The repository is public, so
folder names and file sizes are visible, but report contents are not. Use strong, unique
player passwords (the Generate button makes them). Revoke a player by changing his password
or deleting his folder.
