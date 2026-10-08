import type { Schemas } from '@nails/shared/core/data-access';
import { plainHelpText } from './help-inline';

type HelpSection = Schemas['HelpSectionResponse'];
type HelpArticle = Schemas['HelpArticleResponse'];
type HelpBlock = Schemas['HelpBlockResponse'];

export interface HelpSearchResult {
  article: HelpArticle;
  section: HelpSection;
  snippet: string;
}

const snippetRadius = 70;
const titleWeight = 6;
const keywordWeight = 4;
const summaryWeight = 2;
const bodyWeight = 1;

function blockText(block: HelpBlock): string {
  return [block.text ?? '', ...(block.items ?? [])].map(plainHelpText).join(' ');
}

function snippetOf(text: string, term: string): string {
  const at = text.toLocaleLowerCase().indexOf(term);
  if (at < 0) {
    return '';
  }
  const start = Math.max(0, at - snippetRadius);
  const end = Math.min(text.length, at + term.length + snippetRadius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

function scoreOf(article: HelpArticle, body: string, words: readonly string[]): number {
  const title = article.title.toLocaleLowerCase();
  const summary = (article.summary ?? '').toLocaleLowerCase();
  const keywords = article.keywords.join(' ').toLocaleLowerCase();
  const text = body.toLocaleLowerCase();
  let score = 0;
  for (const word of words) {
    const wordScore =
      (title.includes(word) ? titleWeight : 0) +
      (keywords.includes(word) ? keywordWeight : 0) +
      (summary.includes(word) ? summaryWeight : 0) +
      (text.includes(word) ? bodyWeight : 0);
    if (wordScore === 0) {
      return 0;
    }
    score += wordScore;
  }
  return score;
}

export function helpSearchTerms(query: string): string[] {
  return query
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);
}

export function searchHelp(sections: readonly HelpSection[], query: string): HelpSearchResult[] {
  const words = helpSearchTerms(query);
  if (words.length === 0) {
    return [];
  }
  return sections
    .flatMap((section) =>
      section.articles.map((article) => {
        const body = article.blocks.map(blockText).join(' ');
        return {
          result: { article, section, snippet: snippetOf(body, words[0] ?? '') || (article.summary ?? '') },
          score: scoreOf(article, body, words)
        };
      })
    )
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.result);
}

export function findHelpArticle(
  sections: readonly HelpSection[],
  articleId: string | undefined
): { article: HelpArticle; section: HelpSection } | null {
  for (const section of sections) {
    const article = section.articles.find((candidate) => candidate.id === articleId);
    if (article) {
      return { article, section };
    }
  }
  return null;
}

export interface HelpHighlightSegment {
  text: string;
  match: boolean;
}

export function highlightSegments(text: string, terms: readonly string[]): HelpHighlightSegment[] {
  const lower = text.toLocaleLowerCase();
  const marked = new Array<boolean>(text.length).fill(false);
  for (const term of terms) {
    let at = lower.indexOf(term);
    while (at >= 0 && term.length > 0) {
      marked.fill(true, at, at + term.length);
      at = lower.indexOf(term, at + term.length);
    }
  }
  const segments: HelpHighlightSegment[] = [];
  for (let index = 0; index < text.length; index++) {
    const last = segments.at(-1);
    if (last !== undefined && last.match === marked[index]) {
      last.text += text.charAt(index);
    } else {
      segments.push({ text: text.charAt(index), match: marked[index] ?? false });
    }
  }
  return segments;
}
