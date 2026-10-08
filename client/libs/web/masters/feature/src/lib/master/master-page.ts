import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { toProblem } from '@nails/shared/core/data-access';
import { masterResource } from '@nails/shared/masters/data-access';
import { EmptyState, ErrorState, LoadingState } from '@nails/web/common/ui';
import { PhonePipe } from '../format/phone-pipe';
import { groupByCategory } from '../price-list/group-by-category';
import { PriceList } from '../price-list/price-list';

const notFound = 404;

@Component({
  selector: 'app-master-page',
  imports: [MatButtonModule, RouterLink, EmptyState, ErrorState, LoadingState, PhonePipe, PriceList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .about {
      white-space: pre-line;
      max-width: 70ch;
    }
    .contacts {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2) var(--app-space-5);
      color: var(--mat-sys-on-surface-variant);
    }
    .contacts a {
      color: var(--mat-sys-primary);
    }
  `,
  template: `
    <a mat-button routerLink="/masters">Все мастера</a>
    @if (master.hasValue()) {
      <h1>{{ master.value().displayName }}</h1>
      <div class="contacts">
        <span>{{ master.value().cityName }}, {{ master.value().address }}</span>
        <a [href]="'tel:' + master.value().phone">{{ master.value().phone | phone }}</a>
      </div>
      @if (master.value().about) {
        <p class="about">{{ master.value().about }}</p>
      }
      <h2>Прайс</h2>
      <app-price-list [groups]="groups()" />
    } @else if (missing()) {
      <app-empty-state title="Мастер не найден." />
    } @else if (master.error()) {
      <app-error-state title="Не удалось загрузить страницу мастера." (retry)="master.reload()" />
    } @else {
      <app-loading-state />
    }
  `
})
export class MasterPage {
  readonly id = input<string>();
  protected readonly master = masterResource(this.id);
  protected readonly missing = computed(() => {
    const error = this.master.error();
    return error !== undefined && toProblem(error).status === notFound;
  });
  protected readonly groups = computed(() =>
    this.master.hasValue() ? groupByCategory(this.master.value().offers) : []
  );
}
