export interface HelpInlineSegment {
  text: string;
  strong: boolean;
}

const strongMarker = '**';

export function parseHelpInline(text: string): HelpInlineSegment[] {
  return text
    .split(strongMarker)
    .map((part, index) => ({ text: part, strong: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);
}

export function plainHelpText(text: string): string {
  return text.split(strongMarker).join('');
}
