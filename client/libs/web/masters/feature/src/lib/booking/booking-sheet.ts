import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { formatDuration, formatPrice } from '@nails/shared/common/util';
import { toProblem, type Schemas } from '@nails/shared/core/data-access';
import { MastersApi, type MasterProfile, type MasterSlots, type SlotEntry } from '@nails/shared/masters/data-access';
import { SheetLayout, Toasts } from '@nails/web/common/overlays';
import { BookingCheck } from './booking-check';
import type { ConflictCheck } from './conflict-check';
import { SlotPicker } from './slot-picker';

export interface BookingSheetData {
  profile: MasterProfile;
  slots: MasterSlots;
  slotId?: string;
  subcategoryId?: string;
}

@Component({
  selector: 'app-booking-sheet',
  imports: [MatButtonModule, SheetLayout, BookingCheck, SlotPicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    section + section {
      margin-top: var(--app-space-5);
    }
    h3 {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      margin: 0 0 var(--app-space-3);
      font-size: var(--app-font-size-md);
      font-weight: var(--app-font-weight-semibold);
      color: var(--app-color-text);
    }
    .step {
      display: inline-grid;
      place-items: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
    }
    .services {
      display: grid;
      gap: var(--app-space-2);
      margin: 0;
      padding: 0;
      border: none;
    }
    .service {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--app-space-3);
      align-items: center;
      padding: var(--app-space-3) var(--app-space-4);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      cursor: pointer;
    }
    .service:has(input:checked) {
      border-color: var(--app-color-primary);
      background: var(--app-color-primary-soft);
    }
    .service input {
      width: 1.125rem;
      height: 1.125rem;
      margin: 0;
      accent-color: var(--app-color-primary);
    }
    .service-name {
      display: grid;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .muted {
      font-size: var(--app-font-size-xs);
      color: var(--app-color-text-muted);
    }
    .price {
      font-weight: var(--app-font-weight-bold);
      white-space: nowrap;
    }
    .toggle {
      justify-self: start;
    }
    .error {
      margin: 0 0 var(--app-space-2);
      color: var(--app-color-danger);
      font-size: var(--app-font-size-sm);
    }
    .submit {
      width: 100%;
      min-height: 3rem;
    }
  `,
  template: `
    <app-sheet-layout heading="Запись к мастеру">
      <section aria-labelledby="booking-service">
        <h3 id="booking-service"><span class="step" aria-hidden="true">1</span>Услуга</h3>
        <fieldset class="services">
          <legend class="visually-hidden">Услуга</legend>
          @for (service of visibleServices(); track service.id) {
            <label class="service">
              <input
                type="radio"
                name="booking-service"
                [value]="service.subcategoryId"
                [checked]="service.subcategoryId === subcategoryId()"
                (change)="subcategoryId.set(service.subcategoryId)"
              />
              <span class="service-name">
                <span>{{ service.name }}</span>
                <span class="muted">{{ duration(service.durationMin) }}</span>
              </span>
              <span class="price">{{ price(service.price) }}</span>
            </label>
          }
        </fieldset>
        @if (canFocus) {
          <button mat-button type="button" class="toggle" (click)="showAll.set(!showAll())">
            {{ showAll() ? 'Скрыть другие услуги' : 'Другие услуги (' + hiddenCount() + ')' }}
          </button>
        }
      </section>

      <section aria-labelledby="booking-time">
        <h3 id="booking-time"><span class="step" aria-hidden="true">2</span>Дата и время</h3>
        <app-slot-picker [slots]="slots()" [selected]="slotId()" (picked)="chooseTime($event)" />
      </section>

      <section aria-labelledby="booking-check">
        <h3 id="booking-check"><span class="step" aria-hidden="true">3</span>Проверьте запись</h3>
        <app-booking-check [profile]="data.profile" [service]="service()" [slot]="slot()" [check]="check()" />
      </section>

      <div sheetFooter>
        @if (error(); as message) {
          <p class="error" role="alert">{{ message }}</p>
        }
        <button mat-flat-button type="button" class="submit" [disabled]="!canSubmit()" (click)="submit()">
          {{ submitLabel() }}
        </button>
      </div>
    </app-sheet-layout>
  `
})
export class BookingSheet {
  protected readonly data = inject<BookingSheetData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<BookingSheet, Schemas['CreateBookingResponse']>>(MatDialogRef);
  private readonly api = inject(MastersApi);
  private readonly toasts = inject(Toasts);

  protected readonly price = formatPrice;
  protected readonly duration = formatDuration;

  private readonly requested =
    this.data.profile.services.find((item) => item.subcategoryId === this.data.subcategoryId) ?? null;
  protected readonly subcategoryId = signal<string | null>(
    this.requested?.subcategoryId ??
      (this.data.profile.services.length === 1 ? (this.data.profile.services.at(0)?.subcategoryId ?? null) : null)
  );
  protected readonly canFocus = this.requested !== null && this.data.profile.services.length > 1;
  protected readonly showAll = signal(this.requested === null);
  protected readonly slots = signal(this.data.slots);
  protected readonly slotId = signal<string | null>(this.data.slotId ?? null);
  protected readonly check = signal<ConflictCheck>({ state: 'idle' });
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly visibleServices = computed(() =>
    this.showAll() || !this.requested ? this.data.profile.services : [this.requested]
  );
  protected readonly hiddenCount = computed(() =>
    this.showAll() ? 0 : this.data.profile.services.length - this.visibleServices().length
  );
  protected readonly service = computed(
    () => this.data.profile.services.find((item) => item.subcategoryId === this.subcategoryId()) ?? null
  );
  protected readonly slot = computed(() => {
    const id = this.slotId();
    return id ? (this.slots().items.find((item) => item.slotId === id) ?? null) : null;
  });
  protected readonly canSubmit = computed(() => !this.submitting() && this.service() !== null && this.slot() !== null);
  protected readonly submitLabel = computed(() => {
    if (this.submitting()) {
      return 'Бронируем…';
    }
    const service = this.service();
    return service ? `Забронировать · ${formatPrice(service.price)}` : 'Забронировать';
  });

  constructor() {
    const slot = this.slot();
    if (slot) {
      void this.runCheck(slot);
    }
  }

  protected chooseTime(slot: SlotEntry): void {
    if (slot.status !== 'free' || !slot.slotId) {
      return;
    }
    this.slotId.set(slot.slotId);
    this.error.set(null);
    void this.runCheck(slot);
  }

  protected async submit(): Promise<void> {
    const service = this.service();
    const slot = this.slot();
    if (this.submitting()) {
      return;
    }
    if (!service || !slot?.slotId) {
      this.error.set('Выберите услугу и время');
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    try {
      const response = await this.api.book({
        masterId: this.data.profile.id,
        slotId: slot.slotId,
        subcategoryId: service.subcategoryId
      });
      this.toasts.success('Запись создана — ждём подтверждения мастера');
      for (const cancelled of response.autoCancelled) {
        this.toasts.info(`Запись к ${cancelled.masterName} на это же время отменена автоматически`);
      }
      this.ref.close(response);
    } catch (error) {
      this.error.set(toProblem(error).title);
      await this.reloadSlots();
    } finally {
      this.submitting.set(false);
    }
  }

  private async runCheck(slot: SlotEntry): Promise<void> {
    if (!slot.slotId) {
      return;
    }
    this.check.set({ state: 'checking' });
    try {
      const result = await this.api.conflicts(slot.slotId);
      if (this.slotId() === slot.slotId) {
        this.check.set({ state: 'done', result });
      }
    } catch {
      this.check.set({ state: 'failed' });
    }
  }

  private async reloadSlots(): Promise<void> {
    try {
      this.slots.set(await this.api.slots(this.data.profile.id));
      if (!this.slot()) {
        this.slotId.set(null);
        this.check.set({ state: 'idle' });
      }
    } catch {
      this.check.set({ state: 'idle' });
    }
  }
}
