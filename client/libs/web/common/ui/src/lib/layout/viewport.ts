import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

const mdWidth = 768;
const lgWidth = 1024;

@Injectable({ providedIn: 'root' })
export class Viewport {
  private readonly observer = inject(BreakpointObserver);

  readonly isMd = this.from(mdWidth);
  readonly isLg = this.from(lgWidth);

  private from(width: number): Signal<boolean> {
    const query = `(min-width: ${width}px)`;
    return toSignal(this.observer.observe(query).pipe(map((state) => state.matches)), {
      initialValue: this.observer.isMatched(query)
    });
  }
}
