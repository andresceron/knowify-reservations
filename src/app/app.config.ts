import Aura from '@primeng/themes/aura';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none',
        },
      },
    }),
    provideFirebaseApp(() => initializeApp({ projectId: "knowify-cafe", appId: "1:908367346368:web:ad6bd1a9dd3468639d4b25", storageBucket: "knowify-cafe.firebasestorage.app", apiKey: "AIzaSyAgjFGFWY8rE_s1iSPfZjR1E1CfDhaeaMo", authDomain: "knowify-cafe.firebaseapp.com", messagingSenderId: "908367346368", measurementId: "G-QJJ6FV828C" })),
    provideFirestore(() => getFirestore()),
  ],
};
