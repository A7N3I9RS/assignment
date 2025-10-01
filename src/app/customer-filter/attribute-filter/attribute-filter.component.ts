import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import {
  AttributeFilter,
  AttributeOperator,
  AttributeValue,
  EventProperty,
  NUMBER_OPERATORS,
  OperatorOption,
  RangeValue,
  STRING_OPERATORS
} from '../models';

@Component({
  selector: 'app-attribute-filter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule
  ],
  templateUrl: './attribute-filter.component.html',
  styleUrl: './attribute-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeFilterComponent implements OnInit, AfterViewInit {
  readonly attribute = input.required<AttributeFilter>();
  readonly availableAttributes = input<EventProperty[]>([]);
  readonly eventLabel = input<string | undefined>(undefined);
  readonly stringOperators = input<OperatorOption[]>(STRING_OPERATORS);
  readonly numberOperators = input<OperatorOption[]>(NUMBER_OPERATORS);

  readonly propertyChange = output<string | undefined>();
  readonly operatorChange = output<AttributeOperator | undefined>();
  readonly valueChange = output<AttributeValue>();
  readonly remove = output<void>();

  private readonly destroyRef = inject(DestroyRef);

  readonly attributeControl = new FormControl('', { nonNullable: true });

  private readonly attributeAutocomplete = viewChild<MatAutocomplete>(MatAutocomplete);

  readonly filteredAttributes = signal<EventProperty[]>([]);

  private readonly selectedOperatorOption = signal<OperatorOption | undefined>(undefined);

  readonly operatorOptions = computed(() => {
    const attribute = this.attribute();
    return attribute.propertyType === 'number' ? this.numberOperators() : this.stringOperators();
  });

  readonly showSingleValueInput = computed(
    () => this.selectedOperatorOption()?.valueRequirement === 'single'
  );
  readonly showRangeInput = computed(
    () => this.selectedOperatorOption()?.valueRequirement === 'range'
  );
  readonly inputType = computed(() => this.selectedOperatorOption()?.inputType ?? 'text');

  readonly singleValue = computed(() => {
    const attribute = this.attribute();
    const value = attribute.value;
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    return undefined;
  });

  readonly rangeValue = computed<RangeValue>(() => {
    const value = this.attribute().value;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const range = value as RangeValue;
      return { from: range.from ?? null, to: range.to ?? null };
    }

    return { from: null, to: null };
  });

  constructor() {
    effect(() => {
      const attribute = this.attribute();
      const currentProperty = attribute.property ?? '';
      if (this.attributeControl.value !== currentProperty) {
        this.attributeControl.setValue(currentProperty, { emitEvent: false });
      }

      if (
        currentProperty &&
        !this.availableAttributes().some((attr) => attr.property === currentProperty)
      ) {
        this.attributeControl.setValue('', { emitEvent: false });
      }

      const option = this.operatorOptions().find((item) => item.value === attribute.operator);
      this.selectedOperatorOption.set(option);
      this.updateFilteredAttributes(this.attributeControl.value);
      this.syncAutocompleteSelection();
    });

    effect(() => {
      this.availableAttributes();
      this.updateFilteredAttributes(this.attributeControl.value);
      this.syncAutocompleteSelection();
    });
  }

  ngOnInit(): void {
    this.attributeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.updateFilteredAttributes(value);
      });
  }

  ngAfterViewInit(): void {
    const autocomplete = this.attributeAutocomplete();
    if (!autocomplete) {
      return;
    }

    autocomplete.options.changes
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncAutocompleteSelection());

    this.syncAutocompleteSelection();
  }

  onAttributeSelected(property: string): void {
    this.propertyChange.emit(property);
  }

  clearAttribute(): void {
    this.attributeControl.setValue('', { emitEvent: false });
    this.propertyChange.emit(undefined);
  }

  onOperatorSelected(operator: AttributeOperator | null): void {
    this.operatorChange.emit(operator ?? undefined);
  }

  onSingleValueChange(event: Event): void {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    const rawValue = target?.value ?? '';
    const option = this.selectedOperatorOption();
    if (!option) {
      this.valueChange.emit(undefined);
      return;
    }

    if (option.inputType === 'number') {
      if (rawValue === '') {
        this.valueChange.emit(undefined);
        return;
      }

      const numericValue = Number(rawValue);
      this.valueChange.emit(Number.isFinite(numericValue) ? numericValue : undefined);
      return;
    }

    this.valueChange.emit(rawValue === '' ? undefined : rawValue);
  }

  onRangeChange(part: 'from' | 'to', event: Event): void {
    const target = event.target instanceof HTMLInputElement ? event.target : null;
    const rawValue = target?.value ?? '';
    const numericValue = rawValue === '' ? null : Number(rawValue);
    const sanitized = numericValue !== null && !Number.isFinite(numericValue) ? null : numericValue;
    const current = this.rangeValue();
    const next: RangeValue = { ...current, [part]: sanitized };
    this.valueChange.emit(next);
  }

  private updateFilteredAttributes(query: string | null): void {
    const search = (query ?? '').toLowerCase();
    this.filteredAttributes.set(
      this.availableAttributes().filter((attr) => attr.property.toLowerCase().includes(search))
    );
  }

  private syncAutocompleteSelection(): void {
    const autocomplete = this.attributeAutocomplete();
    if (!autocomplete) {
      return;
    }

    const selectedProperty = this.attribute().property;

    const options = autocomplete.options;
    if (!options) {
      return;
    }

    options.forEach((option: MatOption<string>) => {
      const shouldSelect = !!selectedProperty && option.value === selectedProperty;

      if (shouldSelect) {
        if (!option.selected) {
          option.select(false);
        }
      } else if (option.selected) {
        option.deselect(false);
      }
    });
  }
}
