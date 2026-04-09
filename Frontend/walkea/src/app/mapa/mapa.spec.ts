import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MapaComponent } from './mapa';
import { MarcadorService } from '../services/marcador.service';
import { TipoMarcadorService } from '../services/tipo-marcador.service';

describe('MapaComponent', () => {
  let component: MapaComponent;
  let fixture: ComponentFixture<MapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaComponent],
      providers: [
        provideRouter([]),
        {
          provide: MarcadorService,
          useValue: {
            obtenerTodos: () => of([]),
          },
        },
        {
          provide: TipoMarcadorService,
          useValue: {
            obtenerTodos: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaComponent);
    component = fixture.componentInstance;

    spyOn(component as any, 'initMap').and.stub();
    spyOn(component as any, 'cargarTipos').and.stub();
    spyOn(component as any, 'cargarMarcadores').and.stub();
    spyOn(component as any, 'obtenerUbicacionReal').and.stub();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the filter when the same marker type is selected twice', () => {
    component.filtroActivo = 2;

    component.filtrarPorTipo(2);

    expect(component.filtroActivo).toBeNull();
  });
});
