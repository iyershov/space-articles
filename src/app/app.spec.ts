import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { environment } from '../environments/environment';
import { AppComponent } from './app';
import { routes } from './app.routes';
import type { ApiResponse, Article } from './interfaces';

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
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should load articles on the homepage route', async () => {
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
  });
});
