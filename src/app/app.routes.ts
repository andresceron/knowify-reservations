import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routes/reservation/reservation.component').then(m => m.ReservationComponent),
  },
  {
    path: 'reservation',
    loadComponent: () => import('./routes/reservation/reservation.component').then(m => m.ReservationComponent),
  },
  {
    path: 'review',
    loadComponent: () => import('./routes/review/review.component').then(m => m.ReviewComponent),
  },
  {
    path: 'confirmation',
    children: [
      {
        path: '',
        loadComponent: () => import('./routes/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./routes/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'reservation',
    pathMatch: 'full'
  },
];
