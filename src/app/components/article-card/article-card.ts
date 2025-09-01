import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Article } from '../../interfaces';
import { HighlightPipe, OrdinalDatePipe, TruncatePipe } from '../../pipes';

@Component({
  selector: 'app-article-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    HighlightPipe,
    OrdinalDatePipe,
    TruncatePipe
  ],
  templateUrl: './article-card.html',
  styleUrl: './article-card.scss'
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();
  readonly searchTerm = input<string | null>('');

  private readonly router = inject(Router);

  navigateToArticle(): void {
    this.router.navigate(['/article', this.article().id]);
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }
}
