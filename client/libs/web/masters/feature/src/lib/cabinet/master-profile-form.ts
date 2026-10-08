import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { formatPhone } from '@nails/shared/common/util';
import { toProblem, type Problem, type Schemas } from '@nails/shared/core/data-access';
import { MastersApi } from '@nails/shared/masters/data-access';
import { ProblemAlert } from '@nails/web/common/ui';
import { Notifier } from '../feedback/notifier';
import { formStyles } from './form.styles';

const displayNameMaxLength = 100;
const aboutMaxLength = 2000;
const phoneMaxLength = 32;
const addressMaxLength = 200;

@Component({
  selector: 'app-master-profile-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, ProblemAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: formStyles,
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <app-problem-alert [problem]="problem()" />
      <mat-form-field>
        <mat-label>Имя для клиентов</mat-label>
        <input matInput formControlName="displayName" [maxlength]="displayNameMaxLength" required />
      </mat-form-field>
      <mat-form-field>
        <mat-label>О себе</mat-label>
        <textarea matInput formControlName="about" rows="5" [maxlength]="aboutMaxLength"></textarea>
        <mat-hint>Опыт, материалы, условия приёма</mat-hint>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Телефон</mat-label>
        <input matInput type="tel" autocomplete="tel" formControlName="phone" [maxlength]="phoneMaxLength" required />
        <mat-hint>Например, +375 (29) 123-45-67</mat-hint>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Город</mat-label>
        <mat-select formControlName="cityId" required>
          @for (city of cities(); track city.id) {
            <mat-option [value]="city.id">{{ city.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Адрес</mat-label>
        <input
          matInput
          autocomplete="street-address"
          formControlName="address"
          [maxlength]="addressMaxLength"
          required
        />
        <mat-hint>Улица, дом и, если нужно, название салона</mat-hint>
      </mat-form-field>
      <div class="actions">
        <button mat-flat-button type="submit" [disabled]="busy() || form.invalid">
          {{ profile() ? 'Сохранить профиль' : 'Создать профиль' }}
        </button>
      </div>
    </form>
  `
})
export class MasterProfileForm {
  readonly profile = input.required<Schemas['MasterResponse'] | null>();
  readonly cities = input.required<readonly Schemas['CityResponse'][]>();
  readonly saved = output();
  protected readonly displayNameMaxLength = displayNameMaxLength;
  protected readonly aboutMaxLength = aboutMaxLength;
  protected readonly phoneMaxLength = phoneMaxLength;
  protected readonly addressMaxLength = addressMaxLength;
  private readonly api = inject(MastersApi);
  private readonly notifier = inject(Notifier);
  protected readonly busy = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    displayName: ['', [Validators.required, Validators.maxLength(displayNameMaxLength)]],
    about: ['', Validators.maxLength(aboutMaxLength)],
    phone: ['', [Validators.required, Validators.maxLength(phoneMaxLength)]],
    cityId: ['', Validators.required],
    address: ['', [Validators.required, Validators.maxLength(addressMaxLength)]]
  });

  constructor() {
    effect(() => {
      const profile = this.profile();
      if (profile) {
        const { displayName, about, phone, cityId, address } = profile;
        this.form.setValue({ displayName, about, phone: formatPhone(phone), cityId, address });
      }
    });
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.busy.set(true);
    this.problem.set(null);
    try {
      const request = this.form.getRawValue();
      const profile = this.profile();
      if (profile) {
        await this.api.updateProfile({ ...request, version: profile.version });
        this.notifier.success('Профиль сохранён.');
      } else {
        await this.api.createProfile(request);
        this.notifier.success('Профиль мастера создан.');
      }
      this.saved.emit();
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.busy.set(false);
    }
  }
}
