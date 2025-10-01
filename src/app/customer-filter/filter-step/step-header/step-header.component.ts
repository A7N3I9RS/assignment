import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { FilterStep } from '../../models';

@Component({
  selector: 'app-filter-step-header',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './step-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'step-header'
  }
})
export class StepHeaderComponent {
  readonly step = input.required<FilterStep>();
  readonly stepIndex = input(0);
  readonly isOnlyStep = input(false);

  readonly duplicate = output<number>();
  readonly remove = output<number>();

  onDuplicateStep(): void {
    this.duplicate.emit(this.step().id);
  }

  onRemoveStep(): void {
    this.remove.emit(this.step().id);
  }
}
