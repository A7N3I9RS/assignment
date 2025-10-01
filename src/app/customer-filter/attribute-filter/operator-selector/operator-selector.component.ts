import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { AttributeFilter, AttributeOperator, OperatorOption } from '../../models';

@Component({
  selector: 'app-operator-selector',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './operator-selector.component.html',
  styleUrl: './operator-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorSelectorComponent {
  readonly attribute = input.required<AttributeFilter>();
  readonly operatorOptions = input<OperatorOption[]>([]);

  readonly operatorChange = output<AttributeOperator | undefined>();

  readonly selectedOperatorOption = signal<OperatorOption | undefined>(undefined);

  private readonly selectedOperatorEffect = effect(() => {
    const attribute = this.attribute();
    const options = this.operatorOptions();
    const current = options.find((option) => option.value === attribute.operator);
    this.selectedOperatorOption.set(current);
  });

  onOperatorSelected(operator: AttributeOperator | null): void {
    const options = this.operatorOptions();
    const matched = options.find((option) => option.value === operator);
    this.selectedOperatorOption.set(matched);
    this.operatorChange.emit(operator ?? undefined);
  }
}
