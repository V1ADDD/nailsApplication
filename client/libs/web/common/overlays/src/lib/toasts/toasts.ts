import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastView } from './toast-view';

type ToastKind = 'info' | 'success' | 'error';

const toastDuration = 3500;

@Injectable({ providedIn: 'root' })
export class Toasts {
  private readonly snackBar = inject(MatSnackBar);

  info(message: string): void {
    this.show(message, 'info');
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  private show(message: string, kind: ToastKind): void {
    this.snackBar.openFromComponent(ToastView, {
      data: message,
      duration: toastDuration,
      politeness: 'polite',
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['app-toast', `app-toast-${kind}`]
    });
  }
}
