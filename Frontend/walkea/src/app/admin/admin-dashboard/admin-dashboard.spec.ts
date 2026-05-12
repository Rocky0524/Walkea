import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

import { AdminDashboardComponent } from './admin-dashboard';

describe('AdminDashboard', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let httpTesting: HttpTestingController;

  function flushInitialRequests(): void {
    const usuariosRequest = httpTesting.expectOne(`${environment.apiUrl}/admin/usuarios`);
    expect(usuariosRequest.request.method).toBe('GET');
    usuariosRequest.flush([]);

    const reportesRequest = httpTesting.expectOne(`${environment.apiUrl}/admin/reportes`);
    expect(reportesRequest.request.method).toBe('GET');
    reportesRequest.flush([]);

    const auditoriaRequest = httpTesting.expectOne(`${environment.apiUrl}/admin/reportes-auditoria`);
    expect(auditoriaRequest.request.method).toBe('GET');
    auditoriaRequest.flush([]);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    flushInitialRequests();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
