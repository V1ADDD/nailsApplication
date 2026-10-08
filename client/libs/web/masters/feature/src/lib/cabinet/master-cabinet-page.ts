import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CatalogStore, toProblem, type Problem, type Schemas } from '@nails/shared/core/data-access';
import { MastersApi, myMasterResource } from '@nails/shared/masters/data-access';
import { ErrorState, LoadingState, ProblemAlert } from '@nails/web/common/ui';
import { Notifier } from '../feedback/notifier';
import { groupByCategory } from '../price-list/group-by-category';
import { PriceList } from '../price-list/price-list';
import { MasterProfileForm } from './master-profile-form';
import { OfferForm } from './offer-form';

const profileMissing = 'master-profile-missing';

@Component({
  selector: 'app-master-cabinet-page',
  imports: [
    MatButtonModule,
    RouterLink,
    ErrorState,
    LoadingState,
    ProblemAlert,
    PriceList,
    MasterProfileForm,
    OfferForm
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .lead {
      max-width: 70ch;
      color: var(--mat-sys-on-surface-variant);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
    }
  `,
  template: `
    <h1>Кабинет мастера</h1>
    @if (!catalog.hasValue() && catalog.error()) {
      <app-error-state title="Не удалось загрузить каталог услуг." (retry)="catalog.reload()" />
    } @else if (!catalog.hasValue()) {
      <app-loading-state />
    } @else if (me.hasValue()) {
      @if (me.value().offers.length > 0) {
        <a mat-stroked-button [routerLink]="['/masters', me.value().id]">Открыть мою страницу</a>
      } @else {
        <p class="lead" role="status">Добавьте в прайс хотя бы одну услугу, чтобы клиенты нашли вас в поиске.</p>
      }
      <h2>Профиль</h2>
      <app-master-profile-form [profile]="me.value()" [cities]="catalog.value().cities" (saved)="me.reload()" />
      <h2>Прайс</h2>
      <app-price-list [groups]="groups()">
        <ng-template let-offer>
          <div class="actions">
            @if (deleting() === offer.id) {
              <button mat-flat-button type="button" [disabled]="busy()" (click)="deleteOffer(offer.id)">
                Удалить из прайса
              </button>
              <button mat-button type="button" (click)="deleting.set(null)">Оставить</button>
            } @else {
              <button mat-button type="button" (click)="editing.set(offer)">Изменить</button>
              <button mat-button type="button" (click)="deleting.set(offer.id)">Удалить</button>
            }
          </div>
        </ng-template>
      </app-price-list>
      <app-problem-alert [problem]="problem()" />
      <h2>{{ editing() ? 'Изменить услугу' : 'Добавить услугу' }}</h2>
      <app-offer-form
        [offer]="editing()"
        [categories]="catalog.value().categories"
        (saved)="offerSaved()"
        (cancelled)="editing.set(null)"
      />
    } @else if (missing()) {
      <p class="lead">
        Создайте профиль мастера. Клиенты увидят его в поиске, когда в прайсе появится хотя бы одна услуга.
      </p>
      <app-master-profile-form [profile]="null" [cities]="catalog.value().cities" (saved)="me.reload()" />
    } @else if (me.error()) {
      <app-error-state title="Не удалось загрузить кабинет мастера." (retry)="me.reload()" />
    } @else {
      <app-loading-state />
    }
  `
})
export class MasterCabinetPage {
  protected readonly catalog = inject(CatalogStore).catalog;
  protected readonly me = myMasterResource();
  private readonly api = inject(MastersApi);
  private readonly notifier = inject(Notifier);
  protected readonly editing = signal<Schemas['OfferResponse'] | null>(null);
  protected readonly deleting = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly problem = signal<Problem | null>(null);
  protected readonly missing = computed(() => {
    const error = this.me.error();
    return error !== undefined && toProblem(error).code === profileMissing;
  });
  protected readonly groups = computed(() => (this.me.hasValue() ? groupByCategory(this.me.value().offers) : []));

  protected offerSaved(): void {
    this.editing.set(null);
    this.me.reload();
  }

  protected async deleteOffer(id: string): Promise<void> {
    this.busy.set(true);
    this.problem.set(null);
    try {
      await this.api.deleteOffer(id);
      this.deleting.set(null);
      if (this.editing()?.id === id) {
        this.editing.set(null);
      }
      this.notifier.success('Услуга удалена из прайса.');
      this.me.reload();
    } catch (error) {
      this.problem.set(toProblem(error));
    } finally {
      this.busy.set(false);
    }
  }
}
