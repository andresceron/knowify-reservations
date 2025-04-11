import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routes/reservation/reservation.component').then(m => m.ReservationComponent),
  },
  {
    path: 'review',
    loadComponent: () => import('./routes/review/review.component').then(m => m.ReviewComponent),
  },
];
