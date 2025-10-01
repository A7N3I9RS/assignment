import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepHeaderComponent } from './step-header.component';
import { FilterStep } from '../../models';

describe('StepHeaderComponent', () => {
  let fixture: ComponentFixture<StepHeaderComponent>;
  let component: StepHeaderComponent;

  const step: FilterStep = {
    id: 5,
    eventType: 'Signup',
    attributes: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StepHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('step', step);
    fixture.detectChanges();
  });

  it('should emit when duplicate or remove is requested', () => {
    const duplicateSpy = jasmine.createSpy('duplicate');
    const removeSpy = jasmine.createSpy('remove');

    component.duplicate.subscribe(duplicateSpy);
    component.remove.subscribe(removeSpy);

    component.onDuplicateStep();
    component.onRemoveStep();

    expect(duplicateSpy).toHaveBeenCalledWith(step.id);
    expect(removeSpy).toHaveBeenCalledWith(step.id);
  });
});
