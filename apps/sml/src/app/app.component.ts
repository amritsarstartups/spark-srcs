import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'sml-root',
  imports: [RouterModule],
  template: '<router-outlet />',
})
export class AppComponent {}
