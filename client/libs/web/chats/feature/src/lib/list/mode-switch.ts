import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { Toasts } from '@nails/web/common/overlays';
import { type SegmentedOption, SegmentedToggle } from '@nails/web/common/ui';
import type { ChatRole } from '@nails/shared/chats/data-access';

const modeOptions: readonly SegmentedOption[] = [
  { value: 'client', label: 'Как клиент' },
  { value: 'master', label: 'Как мастер' }
];

@Component({
  selector: 'app-mode-switch',
  imports: [SegmentedToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-segmented-toggle
      label="Режим чатов"
      [options]="options"
      [value]="session.mode()"
      [disabled]="busy()"
      (changed)="switch($event)"
    />
  `
})
export class ModeSwitch {
  protected readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);
  protected readonly busy = signal(false);
  protected readonly options = modeOptions;

  protected async switch(value: string): Promise<void> {
    const mode: ChatRole = value === 'master' ? 'master' : 'client';
    this.busy.set(true);
    try {
      await this.session.setMode(mode);
      await this.router.navigateByUrl('/chats');
    } catch (error) {
      this.toasts.error(toProblem(error).title);
    } finally {
      this.busy.set(false);
    }
  }
}
