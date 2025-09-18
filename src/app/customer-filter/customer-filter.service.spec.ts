import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CustomerFilterService } from './customer-filter.service';
import { EventsResponse } from './models';

describe('CustomerFilterService', () => {
  let service: CustomerFilterService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(CustomerFilterService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should request the events definition JSON once', () => {
    const response: EventsResponse = { events: [] };
    let received: EventsResponse | undefined;

    service.getEvents().subscribe((value) => (received = value));

    const request = http.expectOne('https://br-fe-assignment.github.io/customer-events/events.json');
    expect(request.request.method).toBe('GET');

    request.flush(response);
    expect(received).toEqual(response);
  });
});
