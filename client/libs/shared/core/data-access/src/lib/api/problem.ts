import { HttpErrorResponse } from '@angular/common/http';

export interface Problem {
  status: number;
  code: string;
  title: string;
  errors: readonly string[];
}

interface ProblemBody {
  code?: unknown;
  title?: unknown;
  errors?: unknown;
}

const unexpectedTitle = 'Что-то пошло не так. Попробуйте ещё раз.';
const unreachableTitle = 'Нет связи с сервером. Попробуйте ещё раз.';

function readErrors(errors: unknown): string[] {
  if (typeof errors !== 'object' || errors === null) {
    return [];
  }
  return Object.values(errors as Record<string, unknown>)
    .flatMap((messages): unknown[] => (Array.isArray(messages) ? (messages as unknown[]) : []))
    .filter((message): message is string => typeof message === 'string');
}

export function toProblem(error: unknown): Problem {
  if (!(error instanceof HttpErrorResponse)) {
    return { status: 0, code: 'unexpected', title: unexpectedTitle, errors: [] };
  }
  if (error.status === 0) {
    return { status: 0, code: 'unreachable', title: unreachableTitle, errors: [] };
  }
  const payload: unknown = error.error;
  const body: ProblemBody = typeof payload === 'object' && payload !== null ? payload : {};
  return {
    status: error.status,
    code: typeof body.code === 'string' ? body.code : 'unexpected',
    title: typeof body.title === 'string' ? body.title : unexpectedTitle,
    errors: readErrors(body.errors)
  };
}
