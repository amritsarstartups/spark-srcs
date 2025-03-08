import { makeEnvironmentProviders } from '@angular/core';
import { BookApiService } from './book-api.service';
import { provideHttpClient } from '@angular/common/http';

export const provideSmlApi = () =>
  makeEnvironmentProviders([provideHttpClient(), BookApiService]);
