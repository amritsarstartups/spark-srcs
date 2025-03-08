import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { FirebaseApiService } from './firebase.service';

export abstract class AbstractApiService {
  protected readonly http = inject(HttpClient);
  protected readonly firebase = inject(FirebaseApiService);
}
