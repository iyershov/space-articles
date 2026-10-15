import { TestBed } from '@angular/core/testing';
import { SearchComponent } from './search';

describe('SearchComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SearchComponent] });
  });

  it('synchronizes later model changes without emitting them as user edits', async () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.componentRef.setInput('inputId', 'test-search');
    fixture.componentRef.setInput('searchTerm', 'Mars');
    const listener = vi.fn();
    fixture.componentInstance.searchChange.subscribe(listener);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Mars');
    expect(input.id).toBe('test-search');

    fixture.componentRef.setInput('searchTerm', 'Moon');
    await fixture.whenStable();
    expect(input.value).toBe('Moon');

    fixture.componentRef.setInput('searchTerm', null);
    await fixture.whenStable();
    expect(input.value).toBe('');
    await new Promise(resolve => setTimeout(resolve, 350));
    expect(listener).not.toHaveBeenCalled();
  });

  it('emits debounced user input and clear actions', async () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.componentRef.setInput('inputId', 'test-search');
    const listener = vi.fn();
    fixture.componentInstance.searchChange.subscribe(listener);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Mars';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await vi.waitFor(() => expect(listener).toHaveBeenLastCalledWith('Mars'));
    await fixture.whenStable();

    const clear = fixture.nativeElement.querySelector('[aria-label="Clear search"]') as HTMLButtonElement;
    clear.click();
    await vi.waitFor(() => expect(listener).toHaveBeenLastCalledWith(''));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(input.value).toBe('');
  });
});
