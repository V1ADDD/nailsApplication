import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { MasterProfile } from '@nails/shared/masters/data-access';
import { ProfileSection } from './profile-section';

@Component({
  selector: 'app-about-section',
  imports: [ProfileSection],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: var(--app-space-4);
    }
    :host(:empty) {
      display: none;
    }
    .about {
      margin: 0;
      white-space: pre-line;
      overflow-wrap: anywhere;
      color: var(--app-color-text-secondary);
    }
    ul {
      display: grid;
      gap: var(--app-space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: var(--app-space-3);
      align-items: start;
    }
    .year {
      padding: var(--app-space-0-5) var(--app-space-2);
      border-radius: var(--app-radius-full);
      background: var(--app-color-primary-soft);
      color: var(--app-color-primary);
      font-size: var(--app-font-size-xs);
      font-weight: var(--app-font-weight-bold);
    }
    .course {
      display: grid;
      gap: var(--app-space-0-5);
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .school {
      font-size: var(--app-font-size-sm);
      color: var(--app-color-text-muted);
    }
  `,
  template: `
    @let master = profile();
    @if (master.about.trim()) {
      <app-profile-section icon="user" heading="О себе" headingId="about">
        <p class="about">{{ master.about }}</p>
      </app-profile-section>
    }
    @if (master.courses.length > 0) {
      <app-profile-section icon="graduation-cap" heading="Обучение и курсы" headingId="courses">
        <ul>
          @for (course of master.courses; track $index) {
            <li>
              <span class="year">{{ course.year }}</span>
              <span class="course">
                <span>{{ course.title }}</span>
                <span class="school">{{ course.school }}</span>
              </span>
            </li>
          }
        </ul>
      </app-profile-section>
    }
  `
})
export class AboutSection {
  readonly profile = input.required<MasterProfile>();
}
