import { booleanAttribute, Directive, input, output } from '@angular/core';

const swipeDistance = 50;
const ignoreAttribute = 'data-no-swipe';

interface SwipeStart {
  x: number;
  y: number;
}

function scrollsSideways(element: Element | null, boundary: Element): boolean {
  for (let node = element; node && node !== boundary; node = node.parentElement) {
    if (node.hasAttribute(ignoreAttribute)) {
      return true;
    }
    const overflow = getComputedStyle(node).overflowX;
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollWidth > node.clientWidth) {
      return true;
    }
  }
  return false;
}

@Directive({
  selector: '[appSwipe]',
  host: {
    '(pointerdown)': 'start($event)',
    '(pointerup)': 'end($event)',
    '(pointercancel)': 'cancel()'
  }
})
export class Swipe {
  readonly swipeAnyPointer = input(false, { transform: booleanAttribute });
  readonly swipeLeft = output();
  readonly swipeRight = output();
  private origin: SwipeStart | null = null;

  protected start(event: PointerEvent): void {
    const host = event.currentTarget as Element;
    const accepted = this.swipeAnyPointer() || event.pointerType === 'touch';
    this.origin =
      accepted && !scrollsSideways(event.target as Element, host) ? { x: event.clientX, y: event.clientY } : null;
  }

  protected end(event: PointerEvent): void {
    const origin = this.origin;
    this.origin = null;
    if (!origin) {
      return;
    }
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.abs(dx) < swipeDistance || Math.abs(dy) > Math.abs(dx)) {
      return;
    }
    if (dx < 0) {
      this.swipeLeft.emit();
    } else {
      this.swipeRight.emit();
    }
  }

  protected cancel(): void {
    this.origin = null;
  }
}
