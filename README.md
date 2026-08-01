# Polr Stocks

A Home Assistant Lovelace card.

Built on the workspace card kit, so it follows Home Assistant's tile card design
language — see `src/kit/README.md` for the class reference.

## Installation

### HACS (custom repository)

1. HACS → Frontend → ⋮ → Custom repositories
2. Add this repository, category **Lovelace**
3. Install, then reload the browser

### Manual

Copy `polr-stocks.js` from the latest release into `config/www/` and add it as a
dashboard resource of type **JavaScript Module**: `/local/polr-stocks.js`

## Configuration

| Option   | Type   | Default      | Description             |
| -------- | ------ | ------------ | ----------------------- |
| `type`   | string | **required** | `custom:polr-stocks`       |
| `entity` | string | **required** | Entity to display       |
| `name`   | string | friendly name | Card title             |
| `icon`   | string | entity icon  | Override the icon       |

```yaml
type: custom:polr-stocks
entity: sensor.example
```

## Development

Developed against the shared HA dev server in `ha-dev`:

```bash
npm install
npm run watch                  # rebuild dist/polr-stocks.js on change
../../ha-dev link polr-stocks
../../ha-dev restart
```

After a rebuild, hard-refresh. If the browser serves a stale bundle,
`../../ha-dev bump polr-stocks && ../../ha-dev restart`.

`src/kit/` is a copy of `ha-dev/shared/card-kit`. Refresh it with
`../../ha-dev sync-kit polr-stocks`; don't edit it here, edit the shared copy.

## License

MIT
