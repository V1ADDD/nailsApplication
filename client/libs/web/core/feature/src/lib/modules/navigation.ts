import { InjectionToken } from '@angular/core';
import type { NavigationItem } from './module-manifest';

export const navigationItems = new InjectionToken<readonly NavigationItem[]>('navigationItems');
