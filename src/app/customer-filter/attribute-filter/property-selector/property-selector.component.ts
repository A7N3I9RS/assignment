import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { AttributeFilter, EventProperty } from '../../models';

@Component({
  selector: 'app-property-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule
  ],
  templateUrl: './property-selector.component.html',
  styleUrl: './property-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertySelectorComponent implements OnInit, AfterViewInit {
  readonly attribute = input.required<AttributeFilter>();
  readonly availableAttributes = input<EventProperty[]>([]);

  readonly propertyChange = output<string | undefined>();

  private readonly destroyRef = inject(DestroyRef);

  readonly attributeControl = new FormControl('', { nonNullable: true });

  private readonly attributeAutocomplete = viewChild<MatAutocomplete>(MatAutocomplete);

  readonly filteredAttributes = signal<EventProperty[]>([]);

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
