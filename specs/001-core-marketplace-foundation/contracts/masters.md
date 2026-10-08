# Masters API (draft)

Price: `{ "kind": "exact" | "from" | "free", "amount": 45.0 }` (amount 0 for free).

## `GET /api/masters?category=&service=&city=&page=&pageSize=` (anonymous)

`PagedResponse<MasterSummaryResponse>`:

```json
{
  "items": [
    {
      "id": "…",
      "displayName": "Анна",
      "cityId": "minsk",
      "cityName": "Минск",
      "categoryNames": ["Ногти", "Брови"],
      "headlinePrice": { "kind": "from", "amount": 30 },
      "offerCount": 4
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 1
}
```

## `GET /api/masters/{id}` (anonymous)

`MasterResponse`: `id, displayName, about, phone, cityId, cityName, address, version, offers[]` where an offer is `id, serviceId, serviceName, categoryId, categoryName, price, durationMinutes`, ordered by category and service. 404 «Мастер не найден.» when missing or without offers.

## `GET /api/masters/me` (signed in)

`MasterResponse` of the signed-in user. 404 `master-profile-missing` «У вас пока нет профиля мастера.».

## `POST /api/masters/me` (signed in)

`MasterProfileRequest { displayName, about, phone, cityId, address }` → 200 `MasterResponse`. 409 `master-profile-exists` «Профиль мастера уже создан.». 400 for an unknown city or a wrong phone.

## `PUT /api/masters/me` (has a master profile)

`UpdateMasterProfileRequest { displayName, about, phone, cityId, address, version }` → `MasterResponse`. 409 `conflict` «Профиль изменился в другой вкладке. Обновите страницу и попробуйте снова.».

## `POST /api/masters/me/offers` (has a master profile)

`OfferRequest { serviceId, priceKind, price, durationMinutes }` → 200 `OfferResponse`. 403 `master-profile-required` «Сначала создайте профиль мастера.». 409 `offer-exists` «Эта услуга уже есть в вашем прайсе.». 400 for an unknown service, a wrong price, or a full price list.

## `PUT /api/masters/me/offers/{id}` (has a master profile)

`OfferRequest` → `OfferResponse`. 404 «Такой услуги нет в вашем прайсе.».

## `DELETE /api/masters/me/offers/{id}` (has a master profile)

204. 404 as above.
