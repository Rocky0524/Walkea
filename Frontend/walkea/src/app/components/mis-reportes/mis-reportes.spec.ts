import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../auth';
import { MarcadorService } from '../../services/marcador.service';
import { MisReportes } from './mis-reportes';

describe('MisReportes', () => {
  let component: MisReportes;
  let fixture: ComponentFixture<MisReportes>;

  const authMock = {
    me: jasmine.createSpy('me').and.returnValue(of({ id_usuario: 1 }))
  };

  const marcadorMock = {
    obtenerTodos: jasmine.createSpy('obtenerTodos').and.returnValue(of([])),
    normalizarLista: jasmine.createSpy('normalizarLista').and.returnValue([])
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisReportes],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: MarcadorService, useValue: marcadorMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisReportes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show fallback location when coordinates are not available', () => {
    const texto = component.textoUbicacion({
      id_marcador: 1,
      id_tipo_marcador: 1,
      titulo: 'Titulo',
      descripcion: 'x',
      latitud: 0,
      longitud: 0,
      estado: 'activo',
      vida: 10
    });

    expect(texto).toBe('No disponible');
  });
});
