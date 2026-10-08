import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  viewChild
} from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { MastersApi, MasterSearchStore } from '@nails/shared/masters/data-access';
import { Icon } from '@nails/web/common/ui';

type Suggestion = Schemas['SuggestionResponse'];

const typingDelay = 250;
const blurDelay = 150;
const minQueryLength = 2;

@Component({
  selector: 'app-search-bar',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      position: relative;
      display: block;
    }
    .field {
      position: relative;
      display: flex;
      align-items: center;
    }
    .lead {
      position: absolute;
      left: var(--app-space-4);
      color: var(--app-color-text-secondary);
      pointer-events: none;
    }
    input {
      width: 100%;
      min-height: 3rem;
      padding: 0 var(--app-space-12) 0 var(--app-space-12);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      background: var(--app-color-surface-sunken);
      color: var(--app-color-text);
      font: inherit;
      font-size: var(--app-font-size-md);
    }
    input::placeholder {
      color: var(--app-color-text-muted);
    }
    input:focus {
      outline: 2px solid var(--app-color-primary);
      outline-offset: -1px;
      background: var(--app-color-surface);
    }
    input::-webkit-search-cancel-button {
      display: none;
    }
    .clear {
      position: absolute;
      right: var(--app-space-1);
      display: grid;
      place-items: center;
      width: var(--app-tap-target);
      height: var(--app-tap-target);
      border: 0;
      border-radius: var(--app-radius-full);
      background: none;
      color: var(--app-color-text-secondary);
      cursor: pointer;
    }
    .clear:hover {
      background: var(--app-color-surface-muted);
    }
    .panel {
      position: absolute;
      inset: calc(100% + var(--app-space-2)) 0 auto;
      z-index: var(--app-z-overlay);
      padding: var(--app-space-2);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-lg);
      background: var(--app-color-surface);
      box-shadow: var(--app-shadow-lg);
    }
    .title {
      margin: 0;
      padding: var(--app-space-2) var(--app-space-3);
      color: var(--app-color-text-muted);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      align-items: center;
      gap: var(--app-space-3);
      min-height: var(--app-tap-target);
      padding: var(--app-space-2) var(--app-space-3);
      border-radius: var(--app-radius-md);
      cursor: pointer;
    }
    li.active,
    li:hover {
      background: var(--app-color-primary-soft);
    }
    li app-icon {
      color: var(--app-color-primary);
    }
    .name {
      flex: 1;
      min-width: 0;
      color: var(--app-color-text);
      font-weight: var(--app-font-weight-semibold);
    }
    .category {
      color: var(--app-color-text-muted);
      font-size: var(--app-font-size-sm);
    }
  `,
  template: `
    <div class="field">
      <app-icon class="lead" name="search" [size]="20" />
      <label class="visually-hidden" for="masters-search">Поиск мастеров</label>
      <input
        #input
        id="masters-search"
        type="search"
        role="combobox"
        autocomplete="off"
        enterkeyhint="search"
        placeholder="Мастер, услуга, район..."
        aria-controls="masters-suggestions"
        aria-autocomplete="list"
        [attr.aria-expanded]="open()"
        [attr.aria-activedescendant]="activeIndex() >= 0 ? 'masters-suggestion-' + activeIndex() : null"
        [value]="text()"
        (input)="type($event)"
        (keydown)="keydown($event)"
        (focus)="focused()"
        (blur)="blurred()"
      />
      @if (text()) {
        <button type="button" class="clear" aria-label="Очистить поиск" (click)="clear()">
          <app-icon name="x" [size]="18" />
        </button>
      }
    </div>
    @if (open()) {
      <div class="panel">
        <p class="title" id="masters-suggestions-title">Услуги</p>
        <ul id="masters-suggestions" role="listbox" aria-labelledby="masters-suggestions-title">
          @for (suggestion of suggestions(); track suggestion.kind + suggestion.id; let index = $index) {
            <li
              role="option"
              [id]="'masters-suggestion-' + index"
              [class.active]="index === activeIndex()"
              [attr.aria-selected]="index === activeIndex()"
              (pointerdown)="$event.preventDefault()"
              tabindex="-1"
              (click)="pick(suggestion)"
              (keydown.enter)="pick(suggestion)"
            >
              <app-icon [name]="suggestion.kind === 'category' ? 'sparkles' : 'search'" [size]="18" />
              <span class="name">{{ suggestion.name }}</span>
              @if (suggestion.kind === 'subcategory') {
                <span class="category">{{ suggestion.categoryName }}</span>
              }
            </li>
          }
        </ul>
      </div>
    }
  `
})
export class SearchBar {
  private readonly store = inject(MasterSearchStore);
  private readonly api = inject(MastersApi);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly text = linkedSignal(() => this.store.query());
  protected readonly suggestions = signal<Suggestion[]>([]);
  protected readonly activeIndex = signal(-1);
  protected readonly open = signal(false);

  private typingTimer: ReturnType<typeof setTimeout> | undefined;
  private blurTimer: ReturnType<typeof setTimeout> | undefined;
  private request = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.typingTimer);
      clearTimeout(this.blurTimer);
    });
  }

  protected type(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.text.set(value);
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.store.query.set(value);
      void this.loadSuggestions(value);
    }, typingDelay);
  }

  protected keydown(event: KeyboardEvent): void {
    const count = this.suggestions().length;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (count === 0) {
          return;
        }
        event.preventDefault();
        this.open.set(true);
        this.activeIndex.update((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + count) % count);
        return;
      case 'Enter': {
        const suggestion = this.open() ? this.suggestions()[this.activeIndex()] : undefined;
        event.preventDefault();
        if (suggestion) {
          this.pick(suggestion);
        } else {
          this.commit();
        }
        return;
      }
      case 'Escape':
        event.preventDefault();
        if (this.open()) {
          this.close();
        } else {
          this.clear();
        }
        return;
    }
  }

  protected focused(): void {
    clearTimeout(this.blurTimer);
    if (this.suggestions().length > 0) {
      this.open.set(true);
    }
  }

  protected blurred(): void {
    this.blurTimer = setTimeout(() => this.close(), blurDelay);
  }

  protected pick(suggestion: Suggestion): void {
    clearTimeout(this.typingTimer);
    this.store.filters.update((filters) => ({ ...filters, serviceId: suggestion.id }));
    this.store.query.set('');
    this.text.set('');
    this.suggestions.set([]);
    this.close();
  }

  protected clear(): void {
    clearTimeout(this.typingTimer);
    this.text.set('');
    this.store.query.set('');
    this.suggestions.set([]);
    this.close();
    this.input().nativeElement.focus();
  }

  private commit(): void {
    clearTimeout(this.typingTimer);
    this.store.query.set(this.text());
    this.close();
  }

  private close(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  private async loadSuggestions(value: string): Promise<void> {
    const request = ++this.request;
    if (value.trim().length < minQueryLength) {
      this.suggestions.set([]);
      this.close();
      return;
    }
    try {
      const suggestions = await this.api.suggestions(value);
      if (request === this.request) {
        this.suggestions.set(suggestions);
        this.activeIndex.set(-1);
        this.open.set(suggestions.length > 0 && document.activeElement === this.input().nativeElement);
      }
    } catch {
      this.suggestions.set([]);
    }
  }
}
