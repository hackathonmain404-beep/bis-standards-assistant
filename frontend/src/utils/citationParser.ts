export interface CitationSegment {
  type: 'text' | 'citation';
  content: string;
  citationIndex?: number;
}

/**
 * Splits response text into segments of plain text and inline citation markers like [1], [2].
 */
export function parseCitations(text: string): CitationSegment[] {
  if (!text) return [];

  const citationRegex = /\[(\d+)\]/g;
  const segments: CitationSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = citationRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const citationIndex = parseInt(match[1], 10);
    segments.push({
      type: 'citation',
      content: match[0],
      citationIndex,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}
