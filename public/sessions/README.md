# Session imagery

Optional. One image per trading session, used by the session globe on
`/platform/markets`. Drop files in with these exact names:

| Filename | Session | Suggested subject |
|---|---|---|
| `asia.jpg` | Asia | Tokyo or Singapore skyline, or a desk at the Asian open |
| `london.jpg` | London | London skyline, or a desk at the European open |
| `new-york.jpg` | New York | New York skyline, or a desk at the US open |

The globe shows the image for whichever session is currently active, behind a
scrim and desaturated toward the steel palette — the same treatment as the hero
images, so they sit inside the design rather than on top of it.

Presence is checked on the server, so a missing file produces **no request and
no 404**: the panel falls back to its diagram treatment. You can add one, two
or all three.

Landscape crops work best (roughly 16:9 or wider). Keep them under ~400 kB —
they sit behind a scrim, so heavy compression is invisible.
