import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Article } from '../../interfaces';
import { ArticleCardComponent } from './article-card';

const article: Article = {
  id: 101,
  title: 'Mars mission reaches orbit',
  summary: 'The spacecraft has reached Mars.',
  url: 'https://example.com/mars',
  image_url: 'https://example.com/mars.jpg',
  news_site: 'Space News',
  published_at: '2026-10-14T12:00:00Z',
  updated_at: '2026-10-14T12:00:00Z'
};

describe('ArticleCardComponent images', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ArticleCardComponent],
      providers: [provideRouter([])]
    });
  });

  it.each(['', '   '])('shows a fallback for a missing image URL %j', async imageUrl => {
    const fixture = TestBed.createComponent(ArticleCardComponent);
    fixture.componentRef.setInput('article', { ...article, image_url: imageUrl });
    await fixture.whenStable();
    const card = fixture.nativeElement as HTMLElement;

    expect(card.querySelector('img')).toBeNull();
    expect(card.querySelector('.article-image-container')?.textContent)
      .toContain('No image available');
    expect(card.querySelector('.article-title')?.textContent).toContain(article.title);
    expect(card.querySelector('a')?.getAttribute('href')).toBe('/article/101');
  });

  it('keeps the image slot when loading fails and restores the image for a new URL', async () => {
    const fixture = TestBed.createComponent(ArticleCardComponent);
    fixture.componentRef.setInput('article', article);
    await fixture.whenStable();
    const card = fixture.nativeElement as HTMLElement;
    const slot = card.querySelector('.article-image-container');
    const image = card.querySelector('img') as HTMLImageElement;

    image.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(card.querySelector('.article-image-container')).toBe(slot);
    expect(card.querySelector('img')).toBeNull();
    expect(slot?.textContent).toContain('No image available');
    expect(card.querySelector('mat-card')?.firstElementChild).toBe(slot);

    fixture.componentRef.setInput('article', {
      ...article,
      image_url: 'https://example.com/new-image.jpg'
    });
    await fixture.whenStable();

    expect(card.querySelector('.article-image-container')).toBe(slot);
    expect(card.querySelector('img')?.getAttribute('src')).toBe('https://example.com/new-image.jpg');
    expect(card.querySelector('.article-image-placeholder')).toBeNull();
  });
});
