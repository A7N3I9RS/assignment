import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CustomerFilterComponent } from './customer-filter/customer-filter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CustomerFilterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}
