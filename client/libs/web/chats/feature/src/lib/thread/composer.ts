import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ChatThreadStore, type ThreadMessage } from '@nails/shared/chats/data-access';
import { MediaApi, toProblem } from '@nails/shared/core/data-access';
import { Icon } from '@nails/web/common/ui';

const maxLength = 2000;

@Component({
  selector: 'app-composer',
  imports: [MatButtonModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-2);
      padding: var(--app-space-3);
      border-top: 1px solid var(--app-color-border);
    }
    .banner,
    .error {
      display: flex;
      gap: var(--app-space-2);
      align-items: center;
      padding: var(--app-space-2) var(--app-space-3);
      border-radius: var(--app-radius-md);
      background: var(--app-color-surface-sunken);
      font-size: var(--app-font-size-sm);
    }
    .error {
      background: var(--app-color-danger-soft);
      color: var(--app-color-danger);
    }
    .banner span,
    .error span {
      flex: 1;
    }
    .banner img {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--app-radius-sm);
      object-fit: cover;
    }
    .row {
      display: flex;
      gap: var(--app-space-2);
      align-items: flex-end;
    }
    textarea {
      flex: 1;
      min-width: 0;
      min-height: 2.75rem;
      max-height: 8rem;
      resize: none;
    }
    input[type='file'] {
      display: none;
    }
  `,
  template: `
    @if (error(); as message) {
      <div class="error" role="alert">
        <span>{{ message }}</span>
        <button mat-button type="button" (click)="error.set(null)">Скрыть ошибку</button>
      </div>
    }
    @if (editing()) {
      <div class="banner">
        <span>Редактирование сообщения</span>
        <button mat-button type="button" (click)="editDone.emit()">Отменить редактирование</button>
      </div>
    } @else if (uploading()) {
      <div class="banner"><span>Загружаем фото…</span></div>
    } @else if (photoUrl(); as url) {
      <div class="banner">
        <img [src]="url" alt="Выбранное фото" />
        <span>Фото будет отправлено</span>
        <button mat-button type="button" (click)="photoUrl.set(null)">Убрать фото</button>
      </div>
    }
    <div class="row">
      @if (!editing()) {
        <button
          mat-icon-button
          type="button"
          aria-label="Прикрепить фото"
          [disabled]="uploading()"
          (click)="file.click()"
        >
          <app-icon name="paperclip" />
        </button>
        <input
          #file
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Прикрепить фото"
          (change)="upload($event)"
        />
      }
      <textarea
        class="app-input"
        rows="1"
        placeholder="Сообщение..."
        aria-label="Сообщение"
        [attr.maxlength]="maxLength"
        [value]="text()"
        (input)="textChanged($event)"
        (keydown.enter)="enter($event)"
      ></textarea>
      <button
        mat-flat-button
        type="button"
        [attr.aria-label]="editing() ? 'Сохранить' : 'Отправить'"
        [disabled]="!canSubmit()"
        (click)="submit()"
      >
        @if (editing()) {
          Сохранить
        } @else {
          <app-icon name="send" [size]="20" />
        }
      </button>
    </div>
  `
})
export class Composer {
  readonly editing = input<ThreadMessage | null>(null);
  readonly editDone = output();
  private readonly store = inject(ChatThreadStore);
  private readonly media = inject(MediaApi);
  protected readonly maxLength = maxLength;
  protected readonly text = signal('');
  protected readonly photoUrl = signal<string | null>(null);
  protected readonly uploading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly canSubmit = computed(() => {
    const text = this.text().trim();
    const editing = this.editing();
    if (this.uploading() || this.saving()) {
      return false;
    }
    if (editing) {
      return text !== (editing.text ?? '') && (text.length > 0 || editing.mediaUrl !== null);
    }
    return text.length > 0 || this.photoUrl() !== null;
  });

  constructor() {
    effect(() => {
      this.text.set(this.editing()?.text ?? '');
    });
  }

  protected textChanged(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  protected enter(event: Event): void {
    if (!(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      void this.submit();
    }
  }

  protected async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    input.value = '';
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.error.set(null);
    try {
      this.photoUrl.set((await this.media.upload(file)).url);
    } catch (error) {
      this.error.set(toProblem(error).title);
    } finally {
      this.uploading.set(false);
    }
  }

  protected async submit(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }
    const editing = this.editing();
    const text = this.text().trim();
    this.error.set(null);
    if (editing) {
      this.saving.set(true);
      try {
        await this.store.edit(editing.id, text);
        this.editDone.emit();
      } catch (error) {
        this.error.set(toProblem(error).title);
      } finally {
        this.saving.set(false);
      }
      return;
    }
    const photo = this.photoUrl();
    this.text.set('');
    this.photoUrl.set(null);
    try {
      await this.store.send(text, photo);
    } catch (error) {
      this.error.set(toProblem(error).title);
    }
  }
}
