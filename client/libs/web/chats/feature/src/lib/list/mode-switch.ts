import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { SessionStore, toProblem } from '@nails/shared/core/data-access';
import { Toasts } from '@nails/web/common/overlays';
import type { ChatRole } from '@nails/shared/chats/data-access';

@Component({
  selector: 'app-mode-switch',
  imports: [MatButtonToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    mat-button-toggle-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
    }
  `,
  template: `
    <mat-button-toggle-group
      aria-label="Режим чатов"
      [value]="session.mode()"
      [disabled]="busy()"
      (change)="switch($event.value)"
    >
      <mat-button-toggle value="client">Как клиент</mat-button-toggle>
      <mat-button-toggle value="master">Как мастер</mat-button-toggle>
    </mat-button-toggle-group>
  `
})
export class ModeSwitch {
  protected readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(Toasts);
  protected readonly busy = signal(false);

  protected async switch(mode: ChatRole): Promise<void> {
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
