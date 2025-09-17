import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { App } from './app';
import { provideHttpClient } from '@angular/common/http';

const EVENTS_ENDPOINT = 'https://br-fe-assignment.github.io/customer-events/events.json';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    fixture.detectChanges();
    httpMock.expectOne(EVENTS_ENDPOINT).flush({ events: [] });
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpMock.expectOne(EVENTS_ENDPOINT).flush({ events: [] });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('CUSTOMER FILTER');
  });
});
