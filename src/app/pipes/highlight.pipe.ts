import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(text: string, searchTerm: string | null): string {
    if (!searchTerm || !text) {
      return text;
    }

    const highlightedText = searchTerm
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 0)
      .reduce(
        (acc, keyword) => {
          const regex = new RegExp(`(${keyword})`, 'gi');
          return acc.replace(regex, '<mark class="highlight">$1</mark>');
        },
        text
      );

    return highlightedText;
  }
}
