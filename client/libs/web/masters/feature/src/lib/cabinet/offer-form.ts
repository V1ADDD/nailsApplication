import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { toProblem, type Problem, type Schemas } from '@nails/shared/core/data-access';
import { MastersApi } from '@nails/shared/masters/data-access';
import { ProblemAlert } from '@nails/web/common/ui';
import { Notifier } from '../feedback/notifier';
import { formStyles } from './form.styles';

type PriceKind = Schemas['PriceKind'];

const maxPrice = 100000;
const minDuration = 5;
const maxDuration = 720;
const defaultDuration = 60;
const priceKinds: readonly { value: PriceKind; label: string }[] = [
  { value: 'exact', label: 'Точная цена' },
  { value: 'from', label: 'Цена от' },
  { value: 'free', label: 'Бесплатно' }
];

@Component({
  selector: 'app-offer-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, ProblemAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: formStyles,
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <app-problem-alert [problem]="problem()" />
      <mat-form-field>
        <mat-label>Услуга</mat-label>
        <mat-select formControlName="serviceId" required>
          @for (category of categories(); track category.id) {
            <mat-optgroup [label]="category.name">
              @for (service of category.services; track service.id) {
                <mat-option [value]="service.id">{{ service.name }}</mat-option>
              }
            </mat-optgroup>
          }
        </mat-select>
      </mat-form-field>
      <div class="row">
        <mat-form-field>
          <mat-label>Тип цены</mat-label>
          <mat-select formControlName="priceKind" (selectionChange)="syncPrice()">
            @for (kind of priceKinds; track kind.value) {
              <mat-option [value]="kind.value">{{ kind.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Цена, р</mat-label>
          <input
            matInput
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            [max]="maxPrice"
            formControlName="price"
          />
        </mat-form-field>
      </div>
      <mat-form-field>
        <mat-label>Длительность, мин</mat-label>
        <input
          matInput
          type="number"
          inputmode="numeric"
          step="5"
          [min]="minDuration"
          [max]="maxDuration"
          formControlName="durationMinutes"
          required
        />
        <mat-hint>От {{ minDuration }} минут до {{ maxDuration / 60 }} часов</mat-hint>
      </mat-form-field>
      <div class="actions">
        <button mat-flat-button type="submit" [disabled]="busy() || form.invalid">
          {{ offer() ? 'Сохранить' : 'Добавить в прайс' }}
        </button>
        @if (offer()) {
          <button mat-button type="button" (click)="cancelled.emit()">Отмена</button>
        }
      </div>
    </form>
  `
})
export class OfferForm {
  readonly offer = input.required<Schemas['OfferResponse'] | null>();
  readonly categories = input.required<readonly Schemas['CategoryResponse'][]>();
  readonly saved = output();
  readonly cancelled = output();
  protected readonly priceKinds = priceKinds;
  protected readonly maxPrice = maxPrice;
  protected readonly minDuration = minDuration;
  protected readonly maxDuration = maxDuration;
  private readonly api = inject(MastersApi);
  private readonly notifier = inject(Notifier);
  protected readonly busy = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    serviceId: ['', Validators.required],
    priceKind: ['exact' as PriceKind, Validators.required],
    price: [0, [Validators.required, Validators.min(0), Validators.max(maxPrice)]],
    durationMinutes: [defaultDuration, [Validators.required, Validators.min(minDuration), Validators.max(maxDuration)]]
  });

  constructor() {
    effect(() => {
      const offer = this.offer();
      this.problem.set(null);
      if (offer) {
        this.form.setValue({
          serviceId: offer.serviceId,
          priceKind: offer.price.kind,
          price: offer.price.amount,
          durationMinutes: offer.durationMinutes
        });
      } else {
        this.form.reset();
      }
      this.syncPrice();
    });
  }

  protected syncPrice(): void {
    const price = this.form.controls.price;
    if (this.form.controls.priceKind.value === 'free') {
      price.setValue(0);
      price.disable();
    } else {
      price.enable();
    }
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.busy.set(true);
    this.problem.set(null);
    try {
      const request = this.form.getRawValue();
      const offer = this.offer();
      if (offer) {
        await this.api.updateOffer(offer.id, request);
        this.notifier.success('Услуга обновлена.');
      } else {
        await this.api.addOffer(request);
        this.notifier.success('Услуга добавлена в прайс.');
        this.form.reset();
        this.syncPrice();
      }
      this.saved.emit();
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.busy.set(false);
    }
  }
}
