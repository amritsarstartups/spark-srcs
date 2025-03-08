import { EMPTY, Observable } from 'rxjs';
import { BookModel } from '../models';
import { AbstractApiService } from './abstract-api.service';
import { Injectable } from '@angular/core';
import { FirebaseApiService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class BookApiService extends FirebaseApiService<BookModel.Book> {
  constructor() {
    super('books');
  }

  public createItem(book: BookModel.ManageBook): Observable<BookModel.Book> {
    return this.post(book);
  }

  public getItem(id: BookModel.Id): Observable<BookModel.Book> {
    return this.get(id);
  }

  public getAllItems(): Observable<BookModel.Book[]> {
    return this.getAll();
  }
}
