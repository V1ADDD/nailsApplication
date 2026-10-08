import { ViewportScroller } from '@angular/common';
import { inject, provideAppInitializer, type EnvironmentProviders } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

const pathOf = (url: string): string => url.split(/[?#]/)[0] ?? url;

export function provideScrollToTopOnPathChange(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const scroller = inject(ViewportScroller);
    let lastPath = '';
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => pathOf(event.urlAfterRedirects))
      )
      .subscribe((path) => {
        if (path !== lastPath) {
          scroller.scrollToPosition([0, 0]);
        }
        lastPath = path;
      });
  });
}
