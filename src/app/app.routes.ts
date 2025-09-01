import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components')
      .then(m => m.ArticlesComponent)
  },
  {
    path: 'article/:id',
    loadComponent: () => import('./components')
      .then(m => m.ArticleDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
