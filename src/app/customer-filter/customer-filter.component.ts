import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { FilterStepComponent } from './filter-step/filter-step.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterStateService } from './filter-state.service';
import { AttributeOperator, AttributeValue } from './models';

@Component({
  selector: 'app-customer-filter',
  imports: [CommonModule, MatButtonModule, MatIconModule, FilterStepComponent, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './customer-filter.component.html',
  styleUrl: './customer-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FilterStateService]
})
export class CustomerFilterComponent implements OnInit {
  private readonly filterState =
    inject(FilterStateService, { optional: true, skipSelf: true }) ?? inject(FilterStateService);

  protected readonly events = this.filterState.events;
  protected readonly loading = this.filterState.loading;
  protected readonly loadingError = this.filterState.loadingError;
  protected readonly steps = this.filterState.steps;
  protected readonly canDiscard = this.filterState.canDiscard;

  ngOnInit(): void {
    this.filterState.initialize();
  }

  protected addStep(): void {
    this.filterState.addStep();
  }

  protected duplicateStep(stepId: number): void {
    this.filterState.duplicateStep(stepId);
  }

  protected removeStep(stepId: number): void {
    this.filterState.removeStep(stepId);
  }

  protected onEventSelect(event: { stepId: number; eventType?: string }): void {
    this.filterState.onEventSelect(event);
  }

  protected addAttribute(stepId: number): void {
    this.filterState.addAttribute(stepId);
  }

  protected removeAttribute(event: { stepId: number; attributeId: number }): void {
    this.filterState.removeAttribute(event);
  }

  protected onAttributePropertyChange(event: {
    stepId: number;
    attributeId: number;
    property?: string;
  }): void {
    this.filterState.onAttributePropertyChange(event);
  }

  protected onAttributeOperatorChange(event: {
    stepId: number;
    attributeId: number;
    operator?: AttributeOperator;
  }): void {
    this.filterState.onAttributeOperatorChange(event);
  }

  protected onAttributeValueChange(event: {
    stepId: number;
    attributeId: number;
    value: AttributeValue;
  }): void {
    this.filterState.onAttributeValueChange(event);
  }

  protected discardFilters(): void {
    this.filterState.discardFilters();
  }

  protected applyFilters(): void {
    this.filterState.applyFilters();
  }

  protected fetchEvents(): void {
    this.filterState.fetchEvents();
  }
}
