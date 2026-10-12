import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastView } from './toast-view';

type ToastKind = 'info' | 'success' | 'error';

interface Toast {
  message: string;
  kind: ToastKind;
}

const toastDuration = 3500;

@Injectable({ providedIn: 'root' })
export class Toasts {
  private readonly snackBar = inject(MatSnackBar);
  private readonly queue: Toast[] = [];
  private showing = false;

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
    this.queue.push({ message, kind });
    if (!this.showing) {
      this.next();
    }
  }

  private next(): void {
    const toast = this.queue.shift();
    this.showing = toast !== undefined;
    if (!toast) {
      return;
    }
    const ref = this.snackBar.openFromComponent(ToastView, {
      data: toast.message,
      duration: toastDuration,
      politeness: 'polite',
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['app-toast', `app-toast-${toast.kind}`]
    });
    ref.afterDismissed().subscribe(() => this.next());
  }
}
