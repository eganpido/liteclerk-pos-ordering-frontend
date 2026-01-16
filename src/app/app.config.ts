import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // I-import kini
import { authInterceptor } from './auth.interceptor'; // I-import ang imong gi-save nga file
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),

    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};