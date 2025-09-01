import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticlesStore } from '../../store';

@Component({
  selector: 'app-article-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.scss'
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articlesStore = inject(ArticlesStore);

  protected readonly article = this.articlesStore.currentArticle;
  protected readonly loading = this.articlesStore.loadingArticle;
  protected readonly error = this.articlesStore.articleError;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.articlesStore.loadArticleById(id);
    }
    else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.articlesStore.clearCurrentArticle();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
