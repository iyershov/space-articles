import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Article } from '../interfaces';
import { ArticleService } from '../services/article.service';

interface ArticlesState {
  articles: Article[];
  filteredArticles: Article[];
  currentArticle: Article | null;
  searchTerm: string | null;
  loading: boolean;
  loadingArticle: boolean;
  error: string | null;
  articleError: string | null;
}

export const ArticlesStore = signalStore(
  { providedIn: 'root' },
  withState<ArticlesState>({
    articles: [],
    filteredArticles: [],
    currentArticle: null,
    searchTerm: null,
    loading: false,
    loadingArticle: false,
    error: null,
    articleError: null
  }),
  withMethods((store, articleService = inject(ArticleService)) => ({
    loadArticles: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          articleService.getArticles$().pipe(
            tapResponse({
              next: articles => {
                patchState(store, {
                  articles,
                  filteredArticles: articles
                });
              },
              error: (error: HttpErrorResponse) => {
                patchState(store, {
                  error: 'Failed to load articles'
                });
                console.error('Error loading articles:', error);
              },
              finalize: () => {
                patchState(store, {
                  loading: false
                });
              }
            })
          )
        )
      )
    ),

    loadArticleById: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loadingArticle: true, articleError: null })),
        switchMap(id =>
          articleService.getArticleById$(id).pipe(
            tapResponse({
              next: article => {
                patchState(store, {
                  currentArticle: article
                });
              },
              error: (error: HttpErrorResponse) => {
                patchState(store, {
                  articleError: 'Failed to load article'
                });
                console.error('Error loading article:', error);
              },
              finalize: () => {
                patchState(store, {
                  loadingArticle: false
                });
              }
            })
          )
        )
      )
    ),

    updateSearchTerm(searchTerm: string | null): void {
      const articles = store.articles();
      const filteredArticles = articleService.filterArticles(articles, searchTerm ?? '');

      patchState(store, {
        searchTerm,
        filteredArticles
      });
    },

    resetSearch(): void {
      patchState(store, {
        searchTerm: '',
        filteredArticles: store.articles()
      });
    },

    clearCurrentArticle(): void {
      patchState(store, {
        currentArticle: null,
        articleError: null
      });
    }
  })),

  withComputed(state => {
    const isSearching = computed(() => {
      const searchTerm = state.searchTerm();
      return searchTerm
        ? searchTerm?.length > 0
        : false;
    });
    const filteredCount = computed(() =>
      isSearching()
        ? state.filteredArticles().length
        : 0
    );
    const hasResults = computed(() => state.filteredArticles().length > 0);
    const noResultsMessage = computed(() =>
      isSearching() && !hasResults()
        ? 'No articles found matching your search criteria.'
        : null
    );
    return {
      filteredCount,
      hasResults,
      noResultsMessage
    };
  })
)
