import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sml-ui',
  imports: [CommonModule],
  templateUrl: './sml-ui.component.html',
  styleUrl: './sml-ui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmlUiComponent {}
