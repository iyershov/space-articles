import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { ArticlesStore } from '../../store';

@Component({
  selector: 'app-article-detail',
  imports: [
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly articlesStore = inject(ArticlesStore);

  protected readonly article = this.articlesStore.currentArticle;
  protected readonly loading = this.articlesStore.loadingArticle;
  protected readonly error = this.articlesStore.articleError;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(id => {
      if (!Number.isSafeInteger(id) || id <= 0) {
        this.articlesStore.clearCurrentArticle();
        void this.router.navigate(['/'], { replaceUrl: true });
        return;
      }
      this.articlesStore.loadArticleById(id);
    });
  }

  ngOnDestroy(): void {
    this.articlesStore.clearCurrentArticle();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
