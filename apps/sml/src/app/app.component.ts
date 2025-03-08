import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SmlUiComponent } from '@sml/ui';

@Component({
  imports: [RouterModule, SmlUiComponent],
  selector: 'sml-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'sml';
}
