import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, Article } from '../interfaces';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly httpClient = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);

  getArticles$(): Observable<Article[]> {
    return this.httpClient.get<ApiResponse>(`${this.environmentService.apiUrl}/articles/`)
      .pipe(
        map(response => response.results)
      );
  }

  getArticleById$(id: number): Observable<Article> {
    return this.httpClient.get<Article>(`${this.environmentService.apiUrl}/articles/${id}/`);
  }

  filterArticles(articles: Article[], searchTerm: string): Article[] {
    if (!searchTerm.trim()) {
      return articles;
    }

    const keywords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);

    const articlesWithScore = articles.map(article => {
      let titleMatches = 0;
      let summaryMatches = 0;

      keywords.forEach(keyword => {
        const titleText = article.title.toLowerCase();
        const summaryText = article.summary.toLowerCase();

        if (titleText.includes(keyword)) {
          titleMatches++;
        }
        if (summaryText.includes(keyword)) {
          summaryMatches++;
        }
      });

      const totalMatches = titleMatches + summaryMatches;
      const score = titleMatches * 2 + summaryMatches;

      return {
        article,
        matches: totalMatches,
        score
      };
    });

    return articlesWithScore
      .filter(item => item.matches > 0)
      .toSorted((a, b) => b.score - a.score)
      .map(item => item.article);
  }
}
