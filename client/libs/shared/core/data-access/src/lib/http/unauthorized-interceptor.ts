import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionStore } from '../identity/session-store';
import { apiPaths } from './api-paths';

const unauthorized = 401;
const sessionPaths: readonly string[] = [apiPaths.me, apiPaths.signIn];

export const unauthorizedInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionStore);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === unauthorized && !sessionPaths.includes(request.url)) {
        session.markSignedOut();
      }
      return throwError(() => error);
    })
  );
};
