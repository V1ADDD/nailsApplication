# Contract draft: Support

The authoritative contract is `api/Nails.Api/openapi.json` after implementation.

## `POST /api/support/tickets`

Anonymous (`[AllowAnonymous]`); a signed-in session is used to record the sender. Needs the antiforgery header like every change. Rate-limited by the policy `support` (per client address, `Modules:Support:RateLimit`).

Request `CreateSupportTicketRequest`:

```json
{ "text": "Не могу найти мастера в Гродно", "contact": "+375291234567" }
```

| Field | Rules | Russian field error |
| --- | --- | --- |
| `text` | required, not blank, ≤ 2000 | «Напишите, чем мы можем помочь»; length: the standard «не длиннее» message |
| `contact` | optional, ≤ 200 | the standard length message |

Responses:

- `201` `CreateSupportTicketResponse` `{ "ticketId": "0199…" }`
- `400` problem `invalid-request`, title «Проверьте введённые данные.», `errors.text` / `errors.contact`
- `429` problem `rate-limited`, title «Слишком много запросов. Попробуйте через минуту.»
- `403` problem `antiforgery` when the antiforgery token is missing

## `GET /api/modules`

Unchanged shape; includes `"support"` when `Modules:Support:Enabled` is true.
