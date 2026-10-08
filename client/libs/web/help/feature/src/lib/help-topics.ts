import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Schemas } from '@nails/shared/core/data-access';
import { Icon } from '@nails/web/common/ui';

type HelpSection = Schemas['HelpSectionResponse'];

@Component({
  selector: 'app-help-topics',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    nav {
      display: grid;
      gap: var(--app-space-1);
    }
    .section-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--app-space-2);
      width: 100%;
      min-height: var(--app-tap-target);
      padding: var(--app-space-2) var(--app-space-2-5);
      border: 0;
      border-radius: var(--app-radius-sm);
      background: none;
      color: var(--app-color-text);
      font: inherit;
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-bold);
      text-align: left;
      cursor: pointer;
    }
    .section-button:hover:not(:disabled) {
      background: var(--app-color-surface-muted);
    }
    .section-button:disabled {
      cursor: default;
    }
    .section-button app-icon {
      color: var(--app-color-text-muted);
      transition: transform var(--app-transition-fast);
    }
    .section-button[aria-expanded='false'] app-icon {
      transform: rotate(-90deg);
    }
    ul {
      display: grid;
      gap: var(--app-space-0-5);
      margin: var(--app-space-0-5) 0 var(--app-space-2);
      padding: 0 0 0 var(--app-space-2);
      list-style: none;
    }
    a {
      display: flex;
      align-items: center;
      min-height: var(--app-tap-target);
      padding: var(--app-space-1-5) var(--app-space-2-5);
      border-left: 2px solid var(--app-color-border);
      border-radius: 0 var(--app-radius-sm) var(--app-radius-sm) 0;
      color: var(--app-color-text-secondary);
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-medium);
      text-decoration: none;
    }
    a:hover {
      background: var(--app-color-surface-muted);
    }
    a[aria-current='page'] {
      border-left-color: var(--app-color-primary);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font-weight: var(--app-font-weight-bold);
    }
    .none {
      padding: 0 var(--app-space-2);
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-muted);
    }
  `,
  template: `
    <nav aria-label="Разделы справки">
      @for (entry of visible(); track entry.section.id) {
        <div>
          <button
            class="section-button"
            type="button"
            [attr.aria-expanded]="searching() || expanded().has(entry.section.id)"
            [attr.aria-controls]="'help-topics-' + entry.section.id"
            [disabled]="searching()"
            (click)="toggle(entry.section.id)"
          >
            <span>{{ entry.section.title }}</span>
            <app-icon name="chevron-down" [size]="16" />
          </button>
          @if (searching() || expanded().has(entry.section.id)) {
            <ul [id]="'help-topics-' + entry.section.id">
              @for (article of entry.articles; track article.id) {
                <li>
                  <a
                    [routerLink]="['/help', article.id]"
                    [attr.aria-current]="article.id === activeId() ? 'page' : null"
                    (click)="opened.emit()"
                    >{{ article.title }}</a
                  >
                </li>
              }
            </ul>
          }
        </div>
      } @empty {
        <p class="none">Подходящих статей нет.</p>
      }
    </nav>
  `
})
export class HelpTopics {
  readonly sections = input.required<readonly HelpSection[]>();
  readonly activeId = input<string | undefined>();
  readonly matchingIds = input<ReadonlySet<string> | null>(null);
  readonly opened = output();
  protected readonly searching = computed(() => this.matchingIds() !== null);
  protected readonly expanded = linkedSignal<ReadonlySet<string>>(() => {
    const active = this.sections().find((section) =>
      section.articles.some((article) => article.id === this.activeId())
    );
    return new Set(active ? [active.id] : this.sections().map((section) => section.id));
  });
  protected readonly visible = computed(() => {
    const matching = this.matchingIds();
    return this.sections()
      .map((section) => ({
        section,
        articles: matching ? section.articles.filter((article) => matching.has(article.id)) : section.articles
      }))
      .filter((entry) => entry.articles.length > 0);
  });

  protected toggle(sectionId: string): void {
    const next = new Set(this.expanded());
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    this.expanded.set(next);
  }
}
