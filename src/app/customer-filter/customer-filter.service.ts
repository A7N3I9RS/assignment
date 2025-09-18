import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EventsResponse } from './models';

@Injectable({ providedIn: 'root' })
export class CustomerFilterService {
  private readonly http = inject(HttpClient);

  getEvents(): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(
      'https://br-fe-assignment.github.io/customer-events/events.json'
    );
  }
}
