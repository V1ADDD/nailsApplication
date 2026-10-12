import type { Router } from '@angular/router';
import { appPaths, returnToParameter } from '@nails/web/core/feature';

export function goToSignIn(router: Router, returnTo: string): void {
  void router.navigate(['/', appPaths.signIn], { queryParams: { [returnToParameter]: returnTo } });
}
