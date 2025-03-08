import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BooksListComponent } from '@sml/ui';

@Component({
  selector: 'sml-root',
  imports: [RouterModule, BooksListComponent],
  template: `
    <!-- <router-outlet /> -->
    <sml-books-list />
  `,
})
export class AppComponent {}
