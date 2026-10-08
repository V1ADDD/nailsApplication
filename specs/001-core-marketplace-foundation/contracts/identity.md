# Identity API changes (draft)

- `POST /api/identity/register`: `RegisterRequest { displayName, email, password }`; `organizationName` removed. A personal tenant named after `displayName` is created.
- `GET /api/identity/me`: `MeResponse { id, email, displayName }`; `role`, `tenantId` and `tenantName` removed (the UI has no organizations).
- Every problem `title` and field error is Russian, e.g. «Неверный адрес электронной почты или пароль.», «Подтвердите адрес электронной почты, прежде чем войти.», «Слишком много неудачных попыток. Попробуйте позже.», «Ссылка недействительна или устарела.», «Регистрация закрыта.», «Сеанс завершён. Войдите снова.».
