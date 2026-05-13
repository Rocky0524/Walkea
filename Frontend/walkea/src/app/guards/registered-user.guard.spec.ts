import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth';
import { registeredUserGuard } from './registered-user.guard';

describe('registeredUserGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => registeredUserGuard(...guardParameters));

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dashboardTree: UrlTree;
  let loginTree: UrlTree;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isGuestMode', 'isAuthenticated']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    dashboardTree = {} as UrlTree;
    loginTree = {} as UrlTree;

    routerSpy.createUrlTree.and.callFake((commands: readonly unknown[]) => {
      if (commands[0] === '/app/dashboard') {
        return dashboardTree;
      }

      return loginTree;
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('redirige al dashboard si es invitado', () => {
    authServiceSpy.isGuestMode.and.returnValue(true);

    const result = executeGuard({} as never, {} as never);

    expect(result).toBe(dashboardTree);
  });

  it('redirige al login si no esta autenticado', () => {
    authServiceSpy.isGuestMode.and.returnValue(false);
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = executeGuard({} as never, {} as never);

    expect(result).toBe(loginTree);
  });

  it('permite el acceso si es usuario registrado', () => {
    authServiceSpy.isGuestMode.and.returnValue(false);
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = executeGuard({} as never, {} as never);

    expect(result).toBeTrue();
  });
});
