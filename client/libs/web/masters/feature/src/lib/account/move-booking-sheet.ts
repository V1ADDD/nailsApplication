import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { type Schemas, toProblem } from '@nails/shared/core/data-access';
import { MastersApi, type MasterSlots, type SlotEntry } from '@nails/shared/masters/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { Skeleton } from '@nails/web/common/ui';
import type { ConflictCheck } from '../booking/conflict-check';
import { ConflictNotes } from '../booking/conflict-notes';
import { SlotPicker } from '../booking/slot-picker';
import { bookingSummary } from './account-texts';

export interface MoveBookingData {
  readonly booking: Schemas['BookingResponse'];
  readonly request: (slotId: string) => Promise<void>;
}

const slotTakenCode = 'slot-taken';
const overlapMessage = 'В это время у вас уже есть другая запись';

@Component({
  selector: 'app-move-booking-sheet',
  imports: [MatButtonModule, MatDialogClose, SheetLayout, Skeleton, SlotPicker, ConflictNotes],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .summary,
    .lead {
      margin: 0 0 var(--app-space-4);
      color: var(--app-color-text-secondary);
    }
    .summary strong {
      color: var(--app-color-text);
    }
    app-conflict-notes {
      margin-top: var(--app-space-4);
    }
    .error {
      margin: var(--app-space-3) 0 0;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--app-space-3);
    }
  `,
  template: `
    <app-sheet-layout heading="Перенос записи">
      <p class="summary">
        <strong>{{ summary.name }}</strong> · {{ summary.details }}
      </p>
      <p class="lead">
        Выберите новое время. Мастер получит запрос на перенос; до его ответа запись остаётся на прежнем времени.
      </p>
      @if (slots(); as slots) {
        @if (hasFree()) {
          <app-slot-picker [slots]="slots" [selected]="slotId()" (picked)="choose($event)" />
          <app-conflict-notes [check]="check()" [excludeId]="bookingId" />
        } @else {
          <p class="lead">Свободного времени нет — напишите мастеру</p>
        }
      } @else if (loadFailed()) {
        <p class="app-field-error" role="alert">Не удалось загрузить</p>
      } @else {
        <app-skeleton height="6rem" />
      }
      @if (error(); as message) {
        <p class="app-field-error error" role="alert">{{ message }}</p>
      }
      <div class="actions" sheetFooter>
        <button mat-stroked-button type="button" mat-dialog-close>Назад</button>
        <button mat-flat-button type="button" [disabled]="!canSubmit()" (click)="submit()">Предложить перенос</button>
      </div>
    </app-sheet-layout>
  `
})
export class MoveBookingSheet {
  private readonly data = inject<MoveBookingData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef);
  private readonly api = inject(MastersApi);
  private readonly toasts = inject(Toasts);
  protected readonly summary = bookingSummary(this.data.booking);
  protected readonly bookingId = this.data.booking.id;
  protected readonly slots = signal<MasterSlots | null>(null);
  protected readonly loadFailed = signal(false);
  protected readonly slotId = signal<string | null>(null);
  protected readonly check = signal<ConflictCheck>({ state: 'idle' });
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly hasFree = computed(() => this.slots()?.items.some((slot) => slot.status === 'free') ?? false);
  protected readonly overlaps = computed(() => {
    const check = this.check();
    return check.state === 'done' && check.result.overlapping.some((item) => item.id !== this.data.booking.id);
  });
  protected readonly canSubmit = computed(
    () => this.slotId() !== null && !this.busy() && !this.overlaps() && this.check().state !== 'checking'
  );

  constructor() {
    void this.loadSlots();
  }

  protected async choose(slot: SlotEntry): Promise<void> {
    if (!slot.slotId) {
      return;
    }
    const slotId = slot.slotId;
    this.slotId.set(slotId);
    this.error.set(null);
    this.check.set({ state: 'checking' });
    try {
      const result = await this.api.conflicts(slotId);
      if (this.slotId() === slotId) {
        this.check.set({ state: 'done', result });
        this.error.set(this.overlaps() ? overlapMessage : null);
      }
    } catch {
      this.check.set({ state: 'failed' });
    }
  }

  protected async submit(): Promise<void> {
    const slotId = this.slotId();
    if (!slotId) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.data.request(slotId);
      this.toasts.success('Запрос на перенос отправлен');
      this.ref.close(true);
    } catch (error) {
      const problem = toProblem(error);
      this.error.set(problem.title);
      if (problem.code === slotTakenCode) {
        this.slotId.set(null);
        this.check.set({ state: 'idle' });
        await this.loadSlots();
      }
    } finally {
      this.busy.set(false);
    }
  }

  private async loadSlots(): Promise<void> {
    try {
      this.slots.set(await this.api.slots(this.data.booking.masterId));
      this.loadFailed.set(false);
    } catch {
      this.loadFailed.set(true);
    }
  }
}
