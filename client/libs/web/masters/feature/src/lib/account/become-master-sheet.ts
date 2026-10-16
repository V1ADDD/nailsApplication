import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CatalogStore, SessionStore, toProblem } from '@nails/shared/core/data-access';
import { MastersApi } from '@nails/shared/masters/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { profileLink } from '@nails/web/core/feature';

const addressMaxLength = 200;
const defaultCity = 'Минск';

type FieldErrors = Partial<Record<'category' | 'address', string>>;

@Component({
  selector: 'app-become-master-sheet',
  imports: [MatButtonModule, MatDialogClose, SheetLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .fields {
      display: grid;
      gap: var(--app-space-4);
    }
    .lead {
      margin: 0;
      color: var(--app-color-text-secondary);
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <form (submit)="create($event)">
      <app-sheet-layout heading="Стать мастером">
        <div class="fields">
          <p class="lead">
            Имя, телефон и фото перенесём из профиля клиента. Один аккаунт — две роли: переключайтесь между «Клиент» и
            «Мастер» в профиле.
          </p>
          <label class="app-field">
            <span class="app-field-label">Направление*</span>
            <select
              class="app-input"
              [value]="category()"
              [attr.aria-invalid]="errors().category ? true : null"
              (change)="category.set(value($event))"
            >
              <option value="" disabled>Выберите направление</option>
              @for (option of categories(); track option.id) {
                <option [value]="option.id">{{ option.label }}</option>
              }
            </select>
            @if (errors().category; as message) {
              <span class="app-field-error" role="alert">{{ message }}</span>
            }
          </label>
          <label class="app-field">
            <span class="app-field-label">Город</span>
            <select class="app-input" [value]="city()" (change)="city.set(value($event))">
              @for (name of cities(); track name) {
                <option [value]="name">{{ name }}</option>
              }
            </select>
          </label>
          <label class="app-field">
            <span class="app-field-label">Адрес, где принимаете*</span>
            <input
              class="app-input"
              placeholder="ул. Ленина, 42"
              autocomplete="street-address"
              [maxLength]="addressMaxLength"
              [value]="address()"
              [attr.aria-invalid]="errors().address ? true : null"
              (input)="address.set(value($event))"
            />
            @if (errors().address; as message) {
              <span class="app-field-error" role="alert">{{ message }}</span>
            } @else {
              <span class="app-field-hint">Услуги, цены и расписание добавите в кабинете мастера</span>
            }
          </label>
        </div>
        <div class="actions" sheetFooter>
          <button mat-stroked-button type="button" mat-dialog-close>Отмена</button>
          <button mat-flat-button type="submit" [disabled]="busy()">Создать профиль мастера</button>
        </div>
      </app-sheet-layout>
    </form>
  `
})
export class BecomeMasterSheet {
  private readonly api = inject(MastersApi);
  private readonly session = inject(SessionStore);
  private readonly catalog = inject(CatalogStore);
  private readonly toasts = inject(Toasts);
  private readonly router = inject(Router);
  private readonly ref = inject(MatDialogRef);
  protected readonly addressMaxLength = addressMaxLength;
  protected readonly category = signal('');
  protected readonly city = signal(defaultCity);
  protected readonly address = signal('');
  protected readonly cities = signal<readonly string[]>([defaultCity]);
  protected readonly errors = signal<FieldErrors>({});
  protected readonly busy = signal(false);
  protected readonly categories = computed(() =>
    this.catalog.categories().map((category) => ({
      id: category.id,
      label: `${category.name} — ${category.specialty.toLocaleLowerCase('ru')}`
    }))
  );

  constructor() {
    void this.loadCities();
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected async create(event: Event): Promise<void> {
    event.preventDefault();
    const address = this.address().trim();
    const errors: FieldErrors = {
      ...(this.category() === '' ? { category: 'Выберите направление' } : {}),
      ...(address === '' ? { address: 'Укажите адрес' } : {})
    };
    this.errors.set(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    this.busy.set(true);
    try {
      const me = await this.api.becomeMaster({ categoryId: this.category(), city: this.city(), address });
      this.session.patchMe(me);
      this.toasts.success('Профиль мастера создан');
      this.ref.close(true);
      await this.router.navigateByUrl(profileLink('master'));
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    } finally {
      this.busy.set(false);
    }
  }

  private async loadCities(): Promise<void> {
    try {
      this.cities.set(await this.api.cities());
    } catch {
      this.cities.set([defaultCity]);
    }
  }
}
