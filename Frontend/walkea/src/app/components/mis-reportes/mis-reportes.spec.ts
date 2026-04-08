import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisReportes } from './mis-reportes';

describe('MisReportes', () => {
  let component: MisReportes;
  let fixture: ComponentFixture<MisReportes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisReportes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisReportes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove a report after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const reporte = component.misReportes[0];

    component.eliminarReporte(reporte);

    expect(component.misReportes).not.toContain(reporte);
  });
});
