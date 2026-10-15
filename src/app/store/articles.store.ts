import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, defer, switchMap } from 'rxjs';
import { Article } from '../interfaces';
import { ArticleService } from '../services/article.service';
import { getSearchKeywords } from '../utils/search';

interface ArticlesState {
  articles: Article[];
  currentArticle: Article | null;
  searchTerm: string;
  loaded: boolean;
  loading: boolean;
  loadingArticle: boolean;
  error: string | null;
  articleError: string | null;
}

export const ArticlesStore = signalStore(
  { providedIn: 'root' },
  withState<ArticlesState>({
    articles: [],
    currentArticle: null,
    searchTerm: '',
    loaded: false,
    loading: false,
    loadingArticle: false,
    error: null,
    articleError: null
  }),
  withComputed((store, articleService = inject(ArticleService)) => ({
    filteredArticles: computed(() =>
      articleService.filterArticles(store.articles(), store.searchTerm())
    ),
    isSearching: computed(() => getSearchKeywords(store.searchTerm()).length > 0)
  })),
  withComputed(store => ({
    filteredCount: computed(() => store.isSearching() ? store.filteredArticles().length : 0),
    hasResults: computed(() => store.filteredArticles().length > 0),
    noResultsMessage: computed(() =>
      store.isSearching() && !store.filteredArticles().length
        ? 'No articles found matching your search criteria.'
        : null
    )
  })),
  withMethods((store, articleService = inject(ArticleService)) => {
    const loadArticles = rxMethod<void>(
      switchMap(() =>
        defer(() => {
          patchState(store, { loading: true, error: null });
          return articleService.getArticles$().pipe(
            tapResponse({
              next: articles => patchState(store, { articles, loaded: true }),
              error: (error: HttpErrorResponse) => {
                patchState(store, { error: 'Failed to load articles' });
                console.error('Error loading articles:', error);
              },
              finalize: () => patchState(store, { loading: false })
            })
          );
        })
      )
    );

    const loadArticleById = rxMethod<number | null>(
      switchMap(id =>
        defer(() => {
          patchState(store, {
            currentArticle: null,
            articleError: null,
            loadingArticle: id !== null
          });
          if (id === null) {
            return EMPTY;
          }
          return articleService.getArticleById$(id).pipe(
            tapResponse({
              next: article => patchState(store, { currentArticle: article }),
              error: (error: HttpErrorResponse) => {
                patchState(store, { articleError: 'Failed to load article' });
                console.error('Error loading article:', error);
              },
              finalize: () => patchState(store, { loadingArticle: false })
            })
          );
        })
      )
    );

    return {
      loadArticles,
      loadArticleById,
      updateSearchTerm(searchTerm: string | null): void {
        patchState(store, { searchTerm: searchTerm ?? '' });
      },
      resetSearch(): void {
        patchState(store, { searchTerm: '' });
      },
      clearCurrentArticle(): void {
        loadArticleById(null);
      }
    };
  })
);
