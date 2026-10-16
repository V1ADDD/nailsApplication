import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { IdentityApi, MediaApi, SessionStore, toProblem } from '@nails/shared/core/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { Avatar } from '@nails/web/common/ui';

const nameMaxLength = 120;
const emailMaxLength = 256;
const handleMaxLength = 64;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const photoTypes = 'image/jpeg,image/png,image/webp';

type FieldErrors = Partial<Record<'name' | 'email', string>>;

@Component({
  selector: 'app-edit-profile-sheet',
  imports: [MatButtonModule, MatDialogClose, SheetLayout, Avatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .fields {
      display: grid;
      gap: var(--app-space-4);
    }
    .photo {
      display: flex;
      align-items: center;
      gap: var(--app-space-4);
    }
    .photo-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
    }
    input[type='file'] {
      display: none;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <form (submit)="save($event)">
      <app-sheet-layout heading="Редактировать профиль">
        <div class="fields">
          <div class="photo">
            <app-avatar [name]="name()" [photoUrl]="photoUrl()" [size]="64" shape="rounded" />
            <div class="photo-actions">
              <button
                mat-stroked-button
                class="app-small"
                type="button"
                [disabled]="uploading()"
                (click)="file.click()"
              >
                {{ uploading() ? 'Загружаем фото…' : 'Изменить фото' }}
              </button>
              @if (photoUrl()) {
                <button mat-button class="app-small" type="button" (click)="photoUrl.set(null)">Удалить фото</button>
              }
            </div>
            <input #file type="file" [accept]="photoTypes" (change)="upload($event)" />
          </div>
          <label class="app-field">
            <span class="app-field-label">Имя и фамилия*</span>
            <input
              class="app-input"
              autocomplete="name"
              [maxLength]="nameMaxLength"
              [value]="name()"
              [attr.aria-invalid]="errors().name ? true : null"
              (input)="name.set(value($event))"
            />
            @if (errors().name; as message) {
              <span class="app-field-error" role="alert">{{ message }}</span>
            }
          </label>
          <label class="app-field">
            <span class="app-field-label">Электронная почта</span>
            <input
              class="app-input"
              type="email"
              autocomplete="email"
              [maxLength]="emailMaxLength"
              [value]="email()"
              [attr.aria-invalid]="errors().email ? true : null"
              (input)="email.set(value($event))"
            />
            @if (errors().email; as message) {
              <span class="app-field-error" role="alert">{{ message }}</span>
            }
          </label>
          <label class="app-field">
            <span class="app-field-label">Telegram</span>
            <input
              class="app-input"
              placeholder="@username"
              [maxLength]="handleMaxLength"
              [value]="telegram()"
              (input)="telegram.set(value($event))"
            />
          </label>
          <label class="app-field">
            <span class="app-field-label">Viber</span>
            <input
              class="app-input"
              type="tel"
              placeholder="+375 29 123-45-67"
              [maxLength]="handleMaxLength"
              [value]="viber()"
              (input)="viber.set(value($event))"
            />
          </label>
        </div>
        <div class="actions" sheetFooter>
          <button mat-stroked-button type="button" mat-dialog-close>Отмена</button>
          <button mat-flat-button type="submit" [disabled]="busy() || uploading()">Сохранить</button>
        </div>
      </app-sheet-layout>
    </form>
  `
})
export class EditProfileSheet {
  private readonly session = inject(SessionStore);
  private readonly identity = inject(IdentityApi);
  private readonly media = inject(MediaApi);
  private readonly toasts = inject(Toasts);
  private readonly ref = inject(MatDialogRef);
  private readonly me = this.session.me();
  protected readonly nameMaxLength = nameMaxLength;
  protected readonly emailMaxLength = emailMaxLength;
  protected readonly handleMaxLength = handleMaxLength;
  protected readonly photoTypes = photoTypes;
  protected readonly name = signal(this.me?.name ?? '');
  protected readonly email = signal(this.me?.email ?? '');
  protected readonly telegram = signal(this.me?.telegram ?? '');
  protected readonly viber = signal(this.me?.viber ?? '');
  protected readonly photoUrl = signal<string | null>(this.me?.photoUrl ?? null);
  protected readonly errors = signal<FieldErrors>({});
  protected readonly busy = signal(false);
  protected readonly uploading = signal(false);

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.uploading.set(true);
    try {
      this.photoUrl.set((await this.media.upload(file)).url);
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    } finally {
      this.uploading.set(false);
    }
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.name().trim();
    const email = this.email().trim();
    const errors: FieldErrors = {
      ...(name === '' ? { name: 'Введите имя' } : {}),
      ...(email !== '' && !emailPattern.test(email) ? { email: 'Проверьте адрес почты' } : {})
    };
    this.errors.set(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    this.busy.set(true);
    try {
      const me = await this.identity.updateProfile({
        name,
        email,
        photoUrl: this.photoUrl() ?? '',
        telegram: this.telegram().trim(),
        viber: this.viber().trim()
      });
      this.session.patchMe(me);
      this.toasts.success('Сохранено');
      this.ref.close();
    } catch (error) {
      const problem = toProblem(error);
      this.toasts.error(problem.status === 0 ? 'Не удалось сохранить' : problem.title);
    } finally {
      this.busy.set(false);
    }
  }
}
