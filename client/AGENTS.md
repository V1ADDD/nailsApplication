Client rules on top of the root `AGENTS.md` and the constitution. Stack: Nx 23, Angular 22 (standalone, zoneless, signals, `httpResource`), TypeScript 6, Angular Material 22, types generated from the API's OpenAPI document by `openapi-typescript`.

## Layout

- `apps/<platform>/` is thin: `web` today (`main.ts`, `modules.ts`, `styles.scss`, `proxy.conf.json`); `mobile` when it comes.
- `libs/<scope>/<module>/<type>/`. Scopes: `shared` (every platform), `web`, `mobile`. Types: `data-access` (HTTP, state, resources), `feature` (routed pages, the module manifest), `ui` (presentational components), `contracts` (what other modules may import), `util` (pure functions).
- `core` is the shell (session, HTTP setup, routing, layout, identity pages); `common` is shared code used by several modules.
- Tags `scope:*`, `type:*` and `name:*` are enforced by `@nx/enforce-module-boundaries`: `shared` depends only on `shared`; `web` and `mobile` on themselves and `shared`, never on each other.
- `libs/shared` has no DOM globals, Angular Material, CDK, router or forms; ESLint fails on them.

## Rules

- Standalone components, `ChangeDetectionStrategy.OnPush`, zoneless; signals, `computed`, `input()`, `output()`, `httpResource()`; built-in control flow; `inject()`.
- Call the API only with relative `/api/...` URLs through `HttpClient`, so the session cookie and the XSRF header work. Never store tokens or user data in browser storage.
- Reads use `httpResource`; changes use a `data-access` service that returns promises. Request and response types come only from `Schemas` (`@starter/shared/core/data-access`).
- Errors are shown with `toProblem()` and `app-problem-alert`; the API's `title` is the message the user sees.
- Read a resource only after `hasValue()`; every screen has its empty, loading and failure states; every control has a visible label or an `aria-label`.
- A module's routes are in its manifest, loaded by a dynamic `import()` in `modules.ts`, so a disabled module's code is never downloaded.
- `unknown` and narrowing, never `any`; no `I` prefix on interfaces; kebab-case file names; selectors use the `app` prefix.

## Commands

```
npx nx run web:serve
npx nx run-many -t lint typecheck knip format-check build
npx nx run shared-core-data-access:api-types
npx nx g @nx/angular:library --directory=libs/<scope>/<module>/<type> --name=<scope>-<module>-<type> --tags=scope:<scope>,type:<type>,name:<module>
```
