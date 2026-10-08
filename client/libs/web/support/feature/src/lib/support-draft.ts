import { Injectable, signal } from '@angular/core';

interface SupportDraftValue {
  text: string;
  contact: string;
}

@Injectable({ providedIn: 'root' })
export class SupportDraft {
  readonly value = signal<SupportDraftValue>({ text: '', contact: '' });
}
