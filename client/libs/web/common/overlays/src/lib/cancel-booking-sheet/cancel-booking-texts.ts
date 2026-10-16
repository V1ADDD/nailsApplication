export interface BookingSummary {
  readonly name: string;
  readonly details: string;
}

export interface CancelBookingTexts {
  readonly heading: string;
  readonly summary?: BookingSummary;
  readonly reasons: readonly string[];
  readonly otherReason: string;
  readonly otherPlaceholder: string;
  readonly mutualLabel: string;
  readonly mutualDefault: boolean;
  readonly warning: string;
  readonly backLabel: string;
  readonly submitLabel: string;
}

interface CancelBookingRequest {
  readonly reason: string;
  readonly mutual: boolean;
}

export interface CancelBookingData {
  readonly texts: CancelBookingTexts;
  readonly submit: (request: CancelBookingRequest) => Promise<void>;
  readonly describeError: (error: unknown) => string;
}
