import { Pipe, PipeTransform } from '@angular/core';
import { getSearchKeywords } from '../utils/search';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(text: string, searchTerm: string | null): string {
    const keywords = getSearchKeywords(searchTerm);
    if (!text || !keywords.length) {
      return escapeHtml(text);
    }

    const pattern = keywords
      .toSorted((a, b) => b.length - a.length)
      .map(keyword => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const matches = text.matchAll(new RegExp(pattern, 'gi'));
    let result = '';
    let offset = 0;

    for (const match of matches) {
      result += escapeHtml(text.slice(offset, match.index));
      result += `<mark class="highlight">${escapeHtml(match[0])}</mark>`;
      offset = match.index + match[0].length;
    }

    return result + escapeHtml(text.slice(offset));
  }
}
