import { afterNextRender, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

@Directive({ selector: '[appScrollSentinel]' })
export class ScrollSentinel {
  readonly reached = output();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.reached.emit();
        }
      });
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
