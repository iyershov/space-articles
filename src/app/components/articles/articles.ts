import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ArticlesStore } from '../../store';
import { ArticleCardComponent } from '../article-card/article-card';
import { SearchComponent } from '../search/search';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    SearchComponent,
    ArticleCardComponent
  ],
  templateUrl: './articles.html',
  styleUrl: './articles.scss'
})
export class ArticlesComponent implements OnInit {
  private readonly articlesStore = inject(ArticlesStore);

  protected readonly articles = this.articlesStore.filteredArticles;
  protected readonly filteredCount = this.articlesStore.filteredCount;
  protected readonly loading = this.articlesStore.loading;
  protected readonly searchTerm = this.articlesStore.searchTerm;
  protected readonly hasResults = this.articlesStore.hasResults;
  protected readonly noResultsMessage = this.articlesStore.noResultsMessage;
  protected readonly error = this.articlesStore.error;

  ngOnInit(): void {
    if (!this.articles().length) {
      this.articlesStore.loadArticles();
    }
  }

  onSearchChange(searchTerm: string | null): void {
    this.articlesStore.updateSearchTerm(searchTerm);
  }

  retryLoadArticles(): void {
    this.articlesStore.loadArticles();
  }
}
