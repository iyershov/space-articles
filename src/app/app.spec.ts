import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../environments/environment';
import { AppComponent } from './app';
import { routes } from './app.routes';
import type { ApiResponse, Article } from './interfaces';
import { ArticlesStore } from './store';

const article: Article = {
  id: 101,
  title: 'Mars mission reaches orbit',
  summary: 'The spacecraft has reached Mars after a successful launch.',
  url: 'https://example.com/mars',
  image_url: 'https://example.com/mars.jpg',
  news_site: 'Space News',
  published_at: '2026-10-14T12:00:00Z',
  updated_at: '2026-10-14T12:00:00Z'
};
const articlesUrl = `${environment.apiUrl}/articles/`;

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(withXhr()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  function flushArticles(articles: Article[]): void {
    TestBed.inject(HttpTestingController).expectOne(articlesUrl).flush({
      count: articles.length, next: null, previous: null, results: articles
    } satisfies ApiResponse);
  }

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should load articles on the homepage route', async () => {
    const harness = await RouterTestingHarness.create('/');
    const request = TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/articles/`);

    expect(request.request.method).toBe('GET');
    expect(harness.routeNativeElement?.querySelector('mat-spinner')).toBeTruthy();

    request.flush({
      count: 1,
      next: null,
      previous: null,
      results: [article]
    } satisfies ApiResponse);
    await harness.fixture.whenStable();

    const page = harness.routeNativeElement;
    expect(page?.querySelector('mat-spinner')).toBeNull();
    expect(page?.querySelectorAll('app-article-card').length).toBe(1);
    expect(page?.querySelector('.article-title')?.textContent).toContain(article.title);

    const input = page?.querySelector('input');
    expect(page?.querySelector('label')?.htmlFor).toBe(input?.id);
    const link = page?.querySelector('a.article-link');
    expect(link?.getAttribute('href')).toBe('/article/101');
    expect(link?.getAttribute('aria-label')).toBe(`Read article: ${article.title}`);
  });

  it.each([
    { name: 'empty response', articles: [] },
    { name: 'nonmatching filter', articles: [article] }
  ])('does not refetch a loaded list with $name', async ({ articles }) => {
    const http = TestBed.inject(HttpTestingController);
    const store = TestBed.inject(ArticlesStore);
    const harness = await RouterTestingHarness.create('/');
    flushArticles(articles);
    store.updateSearchTerm('unmatched');
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.querySelectorAll('app-article-card').length).toBe(0);

    await harness.navigateByUrl('/article/101');
    http.expectOne(`${articlesUrl}101/`).flush(article);
    await harness.fixture.whenStable();
    await harness.navigateByUrl('/');

    http.expectNone(articlesUrl);
    expect(store.loaded()).toBe(true);
    expect(store.searchTerm()).toBe('unmatched');
    expect(harness.routeNativeElement?.querySelector('input')?.value).toBe('unmatched');
    expect(harness.routeNativeElement?.querySelector('.no-results')?.textContent)
      .toContain('No articles found');
  });

  it('loads changed route parameters and hides the previous article if a later request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create('/article/101');
    http.expectOne(`${articlesUrl}101/`).flush(article);
    await harness.fixture.whenStable();
    const firstComponent = harness.routeDebugElement?.componentInstance;

    await harness.navigateByUrl('/article/102');
    expect(harness.routeDebugElement?.componentInstance).toBe(firstComponent);
    expect(TestBed.inject(ArticlesStore).currentArticle()).toBeNull();
    http.expectOne(`${articlesUrl}102/`).flush({ ...article, id: 102, title: 'Lunar mission' });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Lunar mission');

    await harness.navigateByUrl('/article/103');
    http.expectOne(`${articlesUrl}103/`).flush({}, { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.querySelector('h1')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('.error-container')?.textContent)
      .toContain('Failed to load article');
  });

  it.each(['', '   '])('shows a detail-page fallback for a missing image URL %j', async imageUrl => {
    const harness = await RouterTestingHarness.create('/article/101');
    TestBed.inject(HttpTestingController).expectOne(`${articlesUrl}101/`)
      .flush({ ...article, image_url: imageUrl });
    await harness.fixture.whenStable();

    const page = harness.routeNativeElement;
    expect(page?.querySelector('img')).toBeNull();
    expect(page?.querySelector('.article-image-container')?.textContent)
      .toContain('No image available');
    expect(page?.querySelector('h1')?.textContent).toContain(article.title);
    expect(page?.querySelector('button')?.textContent).toContain('Back to homepage');
  });

  it('replaces a failed detail image and restores images when the route changes', async () => {
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create('/article/101');
    http.expectOne(`${articlesUrl}101/`).flush(article);
    await harness.fixture.whenStable();
    const firstComponent = harness.routeDebugElement?.componentInstance;
    const slot = harness.routeNativeElement?.querySelector('.article-image-container');
    const image = slot?.querySelector('img') as HTMLImageElement;

    image.dispatchEvent(new Event('error'));
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.querySelector('.article-image-container')).toBe(slot);
    expect(slot?.querySelector('img')).toBeNull();
    expect(slot?.textContent).toContain('No image available');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(article.title);

    await harness.navigateByUrl('/article/102');
    http.expectOne(`${articlesUrl}102/`).flush({
      ...article, id: 102, image_url: 'https://example.com/new-image.jpg'
    });
    await harness.fixture.whenStable();

    expect(harness.routeDebugElement?.componentInstance).toBe(firstComponent);
    expect(harness.routeNativeElement?.querySelector('img')?.getAttribute('src'))
      .toBe('https://example.com/new-image.jpg');
    expect(harness.routeNativeElement?.querySelector('.article-image-placeholder')).toBeNull();
  });

  it('cancels a pending detail request on leave and supports reopening the article', async () => {
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create('/article/101');
    const first = http.expectOne(`${articlesUrl}101/`);
    await harness.navigateByUrl('/');
    expect(first.cancelled).toBe(true);
    expect(TestBed.inject(ArticlesStore).currentArticle()).toBeNull();
    flushArticles([article]);
    await harness.fixture.whenStable();

    await harness.navigateByUrl('/article/101');
    http.expectOne(`${articlesUrl}101/`).flush(article);
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(article.title);
  });

  it.each(['0', '-1', '1.5', 'invalid', 'Infinity', '9007199254740992'])(
    'redirects an invalid article id %s to the homepage without requesting the article', async id => {
      const http = TestBed.inject(HttpTestingController);
      const harness = await RouterTestingHarness.create(`/article/${id}`);
      await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe('/'));
      http.expectNone(request => request.url !== articlesUrl);
      flushArticles([]);
      await harness.fixture.whenStable();
      expect(harness.routeNativeElement?.querySelector('app-search')).toBeTruthy();
    }
  );
});
