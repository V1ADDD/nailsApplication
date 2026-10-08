import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import type { EnvironmentProviders } from '@angular/core';
import { unauthorizedInterceptor } from './unauthorized-interceptor';

export function provideCoreHttp(): EnvironmentProviders {
  return provideHttpClient(
    withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    withInterceptors([unauthorizedInterceptor])
  );
}
