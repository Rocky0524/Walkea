import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send login credentials to the API', () => {
    const credentials = { email: 'demo@walkea.test', password: '123456' };

    service.login(credentials).subscribe();

    const request = httpTesting.expectOne('http://localhost:8000/api/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);

    request.flush({ token: 'jwt-token' });
  });
});
