import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  const pipe = new HighlightPipe();

  function render(text: string, searchTerm: string | null): HTMLDivElement {
    const element = document.createElement('div');
    element.innerHTML = pipe.transform(text, searchTerm);
    return element;
  }

  it.each(['(', '.', '[', '+', '\\', '*', '?', '$'])('matches %s literally', keyword => {
    const text = `Before ${keyword} after`;
    const element = render(text, keyword);

    expect(element.textContent).toBe(text);
    expect([...element.querySelectorAll('mark')].map(mark => mark.textContent)).toEqual([keyword]);
  });

  it('handles overlapping and duplicate keywords without nesting highlights', () => {
    const element = render('Orbiter orbit', 'orbit\tORBITER\n orbit');

    expect(element.textContent).toBe('Orbiter orbit');
    expect([...element.querySelectorAll('mark')].map(mark => mark.textContent))
      .toEqual(['Orbiter', 'orbit']);
    expect(element.querySelector('mark mark')).toBeNull();
  });

  it('does not match keywords against generated markup', () => {
    const element = render('Mars highlight mark', 'mars highlight mark');

    expect(element.textContent).toBe('Mars highlight mark');
    expect([...element.querySelectorAll('mark')].map(mark => mark.textContent))
      .toEqual(['Mars', 'highlight', 'mark']);
    expect([...element.querySelectorAll('mark')].every(mark => mark.className === 'highlight'))
      .toBe(true);
  });

  it.each([null, '', '   ', 'img'])('renders HTML-like article text as text for %s', term => {
    const text = '<img src="invalid" onerror="alert(1)"> & "Mars"';
    const element = render(text, term);

    expect(element.querySelector('img')).toBeNull();
    expect(element.textContent).toBe(text);
  });

  it('handles empty text', () => {
    expect(pipe.transform('', 'Mars')).toBe('');
  });
});
