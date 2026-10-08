# Data Model: Foundation

## Schema `identity` (changed behavior, no schema change)

- **Tenant**: created at registration for every account, `Name` = the person's display name.
- **ApplicationUser**: unchanged.

No other schema. The first version of this spec added `catalog` and `masters`; the migration `AddCatalogAndMasters` was removed again before the spec closed (see the scope change in `spec.md`), so the database ends at the `Initial` migration.
