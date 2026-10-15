import { Component, input, linkedSignal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Article } from '../../interfaces';
import { HighlightPipe, OrdinalDatePipe, TruncatePipe } from '../../pipes';

@Component({
  selector: 'app-article-card',
  imports: [
    MatCardModule,
    RouterLink,
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

  protected readonly imageAvailable = linkedSignal(() => !!this.article().image_url?.trim());

  onImageError(): void {
    this.imageAvailable.set(false);
  }
}
