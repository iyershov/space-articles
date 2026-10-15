import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import type { Article } from '../interfaces';
import { ArticlesStore } from './articles.store';

const article: Article = {
  id: 101,
  title: 'Mars mission reaches orbit',
  summary: 'The spacecraft has arrived.',
  url: 'https://example.com/mars',
  image_url: 'https://example.com/mars.jpg',
  news_site: 'Space News',
  published_at: '2026-10-14T12:00:00Z',
  updated_at: '2026-10-14T12:00:00Z'
};
const lunarArticle: Article = { ...article, id: 102, title: 'Lunar mission launches' };
const articlesUrl = `${environment.apiUrl}/articles/`;

describe('ArticlesStore', () => {
  let store: InstanceType<typeof ArticlesStore>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()]
    });
    store = TestBed.inject(ArticlesStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  function flushArticles(articles: Article[]): void {
    http.expectOne(articlesUrl).flush({ count: articles.length, next: null, previous: null, results: articles });
  }

  it('preserves an active search during initial loading and refresh', () => {
    store.loadArticles();
    store.updateSearchTerm('Mars');
    flushArticles([article, lunarArticle]);

    expect(store.filteredArticles()).toEqual([article]);
    expect(store.filteredCount()).toBe(1);

    store.loadArticles();
    flushArticles([lunarArticle, article]);

    expect(store.filteredArticles()).toEqual([article]);
    expect(store.searchTerm()).toBe('Mars');
  });

  it('records a successful empty response as loaded', () => {
    store.loadArticles();
    flushArticles([]);

    expect(store.loaded()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.hasResults()).toBe(false);
  });

  it('keeps loading true when a list request replaces an older request', () => {
    store.loadArticles();
    const first = http.expectOne(articlesUrl);
    store.loadArticles();

    expect(first.cancelled).toBe(true);
    expect(store.loading()).toBe(true);
    expect(store.loaded()).toBe(false);

    flushArticles([article]);
    expect(store.loading()).toBe(false);
    expect(store.articles()).toEqual([article]);
  });

  it('clears old article data and keeps loading true for replacement detail requests', () => {
    store.loadArticleById(101);
    http.expectOne(`${articlesUrl}101/`).flush(article);
    store.loadArticleById(102);
    const second = http.expectOne(`${articlesUrl}102/`);

    expect(store.currentArticle()).toBeNull();
    store.loadArticleById(103);
    expect(second.cancelled).toBe(true);
    expect(store.loadingArticle()).toBe(true);

    http.expectOne(`${articlesUrl}103/`).flush({ ...article, id: 103 });
    expect(store.loadingArticle()).toBe(false);
    expect(store.currentArticle()?.id).toBe(103);
  });

  it('cancels a detail request when cleared and can load another article afterwards', () => {
    store.loadArticleById(101);
    const first = http.expectOne(`${articlesUrl}101/`);
    store.clearCurrentArticle();

    expect(first.cancelled).toBe(true);
    expect(store.loadingArticle()).toBe(false);
    expect(store.currentArticle()).toBeNull();
    expect(store.articleError()).toBeNull();

    store.loadArticleById(102);
    http.expectOne(`${articlesUrl}102/`).flush(lunarArticle);
    expect(store.currentArticle()).toEqual(lunarArticle);
  });

  it('can retry after a failed list request', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    store.loadArticles();
    http.expectOne(articlesUrl).flush({}, { status: 500, statusText: 'Server Error' });

    expect(store.loaded()).toBe(false);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Failed to load articles');

    store.loadArticles();
    expect(store.error()).toBeNull();
    flushArticles([article]);
    expect(store.loaded()).toBe(true);
    expect(store.hasResults()).toBe(true);
  });

  it('normalizes whitespace and repeated keywords while ranking title matches first', () => {
    const summaryMatch = { ...lunarArticle, summary: 'Observations of Mars' };
    store.loadArticles();
    flushArticles([summaryMatch, article]);
    store.updateSearchTerm(' Mars\tMARS\n mission ');

    expect(store.filteredArticles()).toEqual([article, summaryMatch]);
    store.updateSearchTerm(' \t\n ');
    expect(store.isSearching()).toBe(false);
    expect(store.filteredCount()).toBe(0);
    expect(store.noResultsMessage()).toBeNull();
  });
});
