import { inject, Injectable, signal } from '@angular/core';
import type { Schemas } from '@nails/shared/core/data-access';
import { MastersApi } from './masters-api';
import { PagedList } from './paged-list';

type MyReview = Schemas['MyReviewResponse'];

interface ReviewCounts {
  readonly written: number;
  readonly about: number;
}

@Injectable()
export class MyReviewsStore {
  private readonly api = inject(MastersApi);
  private readonly countsSignal = signal<ReviewCounts>({ written: 0, about: 0 });
  readonly counts = this.countsSignal.asReadonly();
  readonly written = new PagedList<MyReview>(
    (page) => this.fetch(false, page),
    (review) => review.id
  );
  readonly about = new PagedList<MyReview>(
    (page) => this.fetch(true, page),
    (review) => review.id
  );

  list(about: boolean): PagedList<MyReview> {
    return about ? this.about : this.written;
  }

  private async fetch(about: boolean, page: number) {
    const response = await this.api.myReviews(about, page);
    this.countsSignal.set({ written: response.writtenCount, about: response.aboutCount });
    return response;
  }
}
