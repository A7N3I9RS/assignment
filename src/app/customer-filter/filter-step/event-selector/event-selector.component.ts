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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { EventDefinition, FilterStep } from '../../models';

@Component({
  selector: 'app-filter-step-event-selector',
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
  templateUrl: './event-selector.component.html',
  styleUrl: './event-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'event-column',
    '[class.attributes-present]': 'hasAttributes()'
  }
})
export class EventSelectorComponent implements OnInit, AfterViewInit {
  readonly step = input.required<FilterStep>();
  readonly events = input.required<EventDefinition[]>();

  readonly eventSelect = output<string>();
  readonly clearEvent = output<void>();

  private readonly destroyRef = inject(DestroyRef);

  readonly eventControl = new FormControl<string | null>(null);

  private readonly eventAutocomplete = viewChild<MatAutocomplete>(MatAutocomplete);

  readonly filteredEventOptions = signal<EventDefinition[]>([]);

  readonly hasAttributes = computed(
    () => !!this.step().eventType && this.step().attributes.length > 0
  );

  private readonly syncEventEffect = effect(() => {
    const currentStep = this.step();
    const selected = currentStep.eventType ?? null;

    if (this.eventControl.value !== selected) {
      this.eventControl.setValue(selected, { emitEvent: false });
    }

    this.updateFilteredEvents(this.eventControl.value);
    this.syncAutocompleteSelection(currentStep.eventType);
  });

  ngOnInit(): void {
    this.eventControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.updateFilteredEvents(value);

        if ((value ?? '') === '' && this.step().eventType) {
          this.clearEvent.emit();
        }
      });
  }

  ngAfterViewInit(): void {
    const autocomplete = this.eventAutocomplete();
    if (!autocomplete) {
      return;
    }

    autocomplete.options.changes
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncAutocompleteSelection(this.step().eventType));

    this.syncAutocompleteSelection(this.step().eventType);
  }

  onEventSelected(eventType: string): void {
    this.eventSelect.emit(eventType);
  }

  clearSelection(): void {
    this.eventControl.setValue(null);
  }

  private updateFilteredEvents(query: string | null): void {
    const search = (query ?? '').toLowerCase();
    const events = this.events();
    this.filteredEventOptions.set(
      events.filter((event) => event.type.toLowerCase().includes(search))
    );
  }

  private syncAutocompleteSelection(selectedEventType?: string | null): void {
    const autocomplete = this.eventAutocomplete();
    if (!autocomplete) {
      return;
    }

    const options = autocomplete.options;
    if (!options) {
      return;
    }

    options.forEach((option: MatOption<string>) => {
      const shouldSelect = !!selectedEventType && option.value === selectedEventType;

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
