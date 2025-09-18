export interface EventProperty {
  property: string;
  type: 'string' | 'number';
}

export interface EventDefinition {
  type: string;
  properties: EventProperty[];
}

export type AttributeOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'greaterThan'
  | 'lessThan'
  | 'between';

export type ValueRequirement = 'none' | 'single' | 'range';

export interface OperatorOption {
  value: AttributeOperator;
  label: string;
  valueRequirement: ValueRequirement;
  inputType: 'text' | 'number';
}

export interface RangeValue {
  from?: number | null;
  to?: number | null;
}

export type AttributeValue = string | number | RangeValue | undefined;

export interface AttributeFilter {
  id: number;
  property?: string;
  propertyType?: EventProperty['type'];
  operator?: AttributeOperator;
  value?: AttributeValue;
}

export interface FilterStep {
  id: number;
  eventType?: string;
  attributes: AttributeFilter[];
}

export interface EventsResponse {
  events: EventDefinition[];
}

export const STRING_OPERATORS: OperatorOption[] = [
  { value: 'equals', label: 'Equals', valueRequirement: 'single', inputType: 'text' },
  { value: 'notEquals', label: 'Not equals', valueRequirement: 'single', inputType: 'text' },
  { value: 'contains', label: 'Contains', valueRequirement: 'single', inputType: 'text' },
  { value: 'notContains', label: 'Does not contain', valueRequirement: 'single', inputType: 'text' },
  { value: 'startsWith', label: 'Starts with', valueRequirement: 'single', inputType: 'text' },
  { value: 'endsWith', label: 'Ends with', valueRequirement: 'single', inputType: 'text' },
  { value: 'isEmpty', label: 'Is empty', valueRequirement: 'none', inputType: 'text' },
  { value: 'isNotEmpty', label: 'Is not empty', valueRequirement: 'none', inputType: 'text' }
];

export const NUMBER_OPERATORS: OperatorOption[] = [
  { value: 'equals', label: 'Equals', valueRequirement: 'single', inputType: 'number' },
  { value: 'greaterThan', label: 'Greater than', valueRequirement: 'single', inputType: 'number' },
  { value: 'lessThan', label: 'Less than', valueRequirement: 'single', inputType: 'number' },
  { value: 'between', label: 'Between', valueRequirement: 'range', inputType: 'number' }
];
