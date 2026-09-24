# Start Signal

Pitcher start-review dashboard with an admin area and password-protected player reports,
hosted entirely on GitHub Pages. No server, no database, no AI.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Admin tool (username/password sign-in) |
| `app.js` | All app logic: grading, charts, leverage table, admin, player view |
| `styles.css` | Styling |
| `papaparse.min.js` | CSV parser (MIT license) |
| `robots.txt` | Asks search engines not to index the site |
| `admin.json` | Created by the tool: encrypted admin sign-in (holds the GitHub token, locked with your username and password) |
| `players/<folder>/` | Created by the tool: `index.html` (player page) + `report.json` (encrypted report) |

## Admin sign-in

- First visit: one-time setup with a GitHub token (fine-grained, this repository only,
  *Contents: Read and write*), then a username and password of your choice.
- After that: username and password only. Change them anytime under **Account**.
- When the GitHub token expires, the tool asks for a replacement at sign-in.

## Security model

Reports are encrypted in the browser (AES-256-GCM) before they are saved, and open only with
that player's password or the admin account. The repository is public, so folder names,
file sizes and update times are visible, but report contents, passwords and the GitHub token
are not. Use a long, unique admin password.

## Leverage Index

The gmLI shown in the Situation card uses Tom Tango's Leverage Index table
(http://www.insidethebook.com/li.shtml), hard-wired in `app.js` as `LI_TABLE`
(432 rows: inning 1–9 × top/bottom × 8 base states × 3 out states; home run differential
−4 to +4). The values come from the CSV in the open-source project
jakecar/plugin.video.mlbbasesloaded (`resources/li.csv`), which states it was created
from Tango's page and used with his permission. Differentials beyond ±4 use the ±4 value
and display with "≤". Innings past the 9th use 9th-inning values.
