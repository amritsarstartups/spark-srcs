import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BookApiService } from '@sml/data';
import { environment } from '@sml/environments';

@Component({
  selector: 'sml-books-list',
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.css',
})
export class BooksListComponent {
  private readonly _bookApi = inject(BookApiService);

  protected readonly list$ = this._bookApi.getAll();
}
