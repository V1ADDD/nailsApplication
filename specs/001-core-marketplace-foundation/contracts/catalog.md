# Catalog API (draft)

## `GET /api/catalog` (anonymous)

```json
{
  "categories": [
    {
      "id": "nails",
      "name": "Ногти",
      "services": [{ "id": "manicure-gel", "name": "Маникюр с покрытием гель-лак", "categoryId": "nails" }]
    }
  ],
  "cities": [{ "id": "minsk", "name": "Минск" }]
}
```

Categories, their services and cities are in display order.
