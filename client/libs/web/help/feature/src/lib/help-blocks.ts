import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Schemas } from '@nails/shared/core/data-access';
import { Icon, type IconName } from '@nails/web/common/ui';
import { HelpInlineText } from './help-inline-text';

type HelpNoteTone = NonNullable<Schemas['HelpNoteTone']>;

const noteIcons: Readonly<Record<HelpNoteTone, IconName>> = {
  info: 'info',
  tip: 'sparkles',
  warning: 'alert-triangle'
};

@Component({
  selector: 'app-help-blocks',
  imports: [RouterLink, Icon, HelpInlineText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
      font-size: var(--app-font-size-md);
      line-height: 1.65;
      color: var(--app-color-text-secondary);
    }
    h2 {
      margin-top: var(--app-space-2);
      color: var(--app-color-text);
    }
    ul {
      display: grid;
      gap: var(--app-space-1-5);
      margin: 0;
      padding-left: var(--app-space-5);
    }
    ol {
      display: grid;
      gap: var(--app-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
      counter-reset: step;
    }
    ol li {
      display: flex;
      align-items: flex-start;
      gap: var(--app-space-3);
      counter-increment: step;
    }
    ol li::before {
      content: counter(step);
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 1.625rem;
      height: 1.625rem;
      margin-top: 0.125rem;
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
      line-height: 1;
    }
    .note {
      display: flex;
      align-items: flex-start;
      gap: var(--app-space-3);
      padding: var(--app-space-3) var(--app-space-4);
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-md);
      font-size: var(--app-font-size-sm);
      line-height: var(--app-line-height);
    }
    .note app-icon {
      margin-top: 0.125rem;
    }
    .note.info {
      background: var(--app-color-tint-sky);
      border-color: transparent;
    }
    .note.info app-icon {
      color: var(--app-color-tint-sky-fg);
    }
    .note.tip {
      background: var(--app-color-success-soft);
      border-color: var(--app-color-success-border);
    }
    .note.tip app-icon {
      color: var(--app-color-success-text);
    }
    .note.warning {
      background: var(--app-color-warning-soft);
      border-color: var(--app-color-warning-border);
    }
    .note.warning app-icon {
      color: var(--app-color-warning-text);
    }
    figure {
      display: grid;
      justify-items: center;
      gap: var(--app-space-2);
      margin: 0;
    }
    figure a {
      display: block;
      max-width: 100%;
      border-radius: var(--app-radius-md);
    }
    img {
      max-width: min(100%, 24rem);
      height: auto;
      border: 1px solid var(--app-color-border);
      border-radius: var(--app-radius-md);
      box-shadow: var(--app-shadow-sm);
    }
    figcaption {
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-muted);
    }
    .related {
      display: grid;
      gap: var(--app-space-2);
      margin-top: var(--app-space-2);
      padding-top: var(--app-space-4);
      border-top: 1px solid var(--app-color-border);
    }
    .related p {
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text-muted);
    }
    .related ul {
      padding: 0;
      list-style: none;
    }
    .related a {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-2);
      min-height: var(--app-tap-target);
      color: var(--app-color-primary);
      font-size: var(--app-font-size-sm);
      font-weight: var(--app-font-weight-semibold);
      text-decoration: none;
    }
    .related a:hover {
      text-decoration: underline;
    }
  `,
  template: `
    @for (block of blocks(); track $index) {
      @switch (block.type) {
        @case ('heading') {
          <h2>{{ block.text }}</h2>
        }
        @case ('paragraph') {
          <p><app-help-inline-text [text]="block.text ?? ''" /></p>
        }
        @case ('list') {
          <ul>
            @for (item of block.items ?? []; track item) {
              <li><app-help-inline-text [text]="item" /></li>
            }
          </ul>
        }
        @case ('steps') {
          <ol>
            @for (item of block.items ?? []; track item) {
              <li>
                <span><app-help-inline-text [text]="item" /></span>
              </li>
            }
          </ol>
        }
        @case ('note') {
          <div class="note" [class]="block.tone ?? 'info'">
            <app-icon [name]="noteIcon(block.tone)" [size]="18" />
            <span><app-help-inline-text [text]="block.text ?? ''" /></span>
          </div>
        }
        @case ('image') {
          @if (block.image; as image) {
            <figure>
              <a [href]="image.url" target="_blank" rel="noopener" aria-label="Открыть картинку полностью">
                <img [src]="image.url" [alt]="image.alt" [width]="image.width" [height]="image.height" loading="lazy" />
              </a>
              @if (image.caption) {
                <figcaption>{{ image.caption }}</figcaption>
              }
            </figure>
          }
        }
        @case ('related') {
          <nav class="related" aria-label="Похожие статьи">
            <p>{{ block.text ?? 'Похожие статьи' }}</p>
            <ul>
              @for (articleId of block.articleIds ?? []; track articleId) {
                <li>
                  <a [routerLink]="['/help', articleId]">
                    <app-icon name="chevron-right" [size]="16" />
                    {{ titles().get(articleId) ?? articleId }}
                  </a>
                </li>
              }
            </ul>
          </nav>
        }
      }
    }
  `
})
export class HelpBlocks {
  readonly blocks = input.required<readonly Schemas['HelpBlockResponse'][]>();
  readonly titles = input.required<ReadonlyMap<string, string>>();

  protected noteIcon(tone: HelpNoteTone | null): IconName {
    return noteIcons[tone ?? 'info'];
  }
}
