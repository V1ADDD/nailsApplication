# Contract draft: Identity and Help

The authoritative contract is `api/Nails.Api/openapi.json` after implementation.

## Identity (all under `/api/identity`)

| Method and path | Access | Request | Response | Problems |
| --- | --- | --- | --- | --- |
| `POST sign-in/code` | anonymous, `identity` rate limit | `{ phone }` | `200 { codeLength, resendAfterSeconds }` | 400 `phone-invalid` «Введите номер в формате +375 XX XXX-XX-XX»; 429 `code-too-soon` «Новый код можно запросить через N с.»; 429 `rate-limited` |
| `POST sign-in` | anonymous, `identity` rate limit | `{ phone, code, name? }` | `200 { nameRequired }`; with `false` the session cookie is set | 400 `phone-invalid`; 400 `code-invalid` «Неверный код»; 400 `code-expired` «Код устарел. Запросите новый.»; 400 `invalid-request` with `errors.name` «Введите имя» |
| `POST sign-out` | anonymous | — | `204` | — |
| `GET me` | signed in | — | `200 { id, name, phone }` (`phone` null for legacy accounts) | 401 |

Removed: `register`, `confirm-email`, `resend-confirmation`, `forgot-password`, `reset-password`.

## Help (under `/api/help`)

`GET content?language=ru` →

```json
{
  "site": { "title": "Справка", "description": "…" },
  "company": { "name": "Мастера рядом", "email": "support@example.com", "website": "https://example.com" },
  "sections": [
    {
      "id": "sign-in", "title": "Вход и аккаунт",
      "articles": [
        {
          "id": "sign-in", "title": "Вход по номеру телефона", "summary": "…", "keywords": ["sms", "код"],
          "blocks": [
            { "type": "steps", "items": ["…"] },
            { "type": "note", "tone": "tip", "text": "…" },
            { "type": "image", "image": { "url": "/api/help/images/ru/sign-in/phone.png?v=…", "alt": "…", "caption": null, "width": 390, "height": 844 } },
            { "type": "related", "articleIds": ["create-an-account"] }
          ]
        }
      ]
    }
  ]
}
```

`GET images/{language}/{articleId}/{fileName}` → the PNG, `Cache-Control: public, max-age=<CacheSeconds>, immutable`; 404 `not-found` «Такой картинки нет.».
