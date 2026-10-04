import { describe, it, expect } from 'vitest';
import { parseCitations } from '../utils/citationParser';

describe('citationParser', () => {
  it('parses text without citations into a single text segment', () => {
    const text = 'This standard prescribes safety requirements.';
    const segments = parseCitations(text);
    expect(segments).toEqual([
      { type: 'text', content: 'This standard prescribes safety requirements.' },
    ]);
  });

  it('parses text containing [1] and [2] citations correctly', () => {
    const text = 'Covered under IS 14543 [1] and raw materials under IS 6911 [2].';
    const segments = parseCitations(text);
    expect(segments).toHaveLength(5);
    expect(segments[0]).toEqual({ type: 'text', content: 'Covered under IS 14543 ' });
    expect(segments[1]).toEqual({ type: 'citation', content: '[1]', citationIndex: 1 });
    expect(segments[2]).toEqual({ type: 'text', content: ' and raw materials under IS 6911 ' });
    expect(segments[3]).toEqual({ type: 'citation', content: '[2]', citationIndex: 2 });
    expect(segments[4]).toEqual({ type: 'text', content: '.' });
  });

  it('handles empty string gracefully', () => {
    expect(parseCitations('')).toEqual([]);
  });
});
