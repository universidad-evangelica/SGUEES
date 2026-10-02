import { Component, HostBinding, OnDestroy, OnInit, } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppInfoService, AuthService, readOwnedSessionToken, ScreenService, ThemeService } from './shared/services';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  jwtHelper = new JwtHelperService();
  isPublicPortal = this.resolvePublicPortal();
  private routerSub?: Subscription;

  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter((cl) => this.screen.sizes[cl]).join(' ');
  }

  constructor(private authService: AuthService,
              private themeService: ThemeService,
              private screen: ScreenService,
              private router: Router,
              public appInfo: AppInfoService) {
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isPublicPortal = this.resolvePublicPortal();
      });
  }

  get avisoInactividadVisible(): boolean {
    return this.authService.idleWarningVisible;
  }

  get segundosInactividad(): number {
    return this.authService.idleSecondsLeft;
  }

  // Qué hace: deja la sesión abierta cuando la persona sigue usando el sistema.
  // Cómo lo hace: reinicia el plazo de 1 día y cierra el aviso.
  continuarSesion(): void {
    this.authService.registrarActividad();
  }

  isAuthenticated() {
    if (this.authService.loggedIn) {
      return true;
    }
    // Qué hace: mantiene el marco de la aplicación hasta entrar al login.
    // Cómo lo hace: evita la pantalla negra mientras la ruta anterior todavía está activa.
    return this.authService.cerrandoSesion && !this.esRutaLogin();
  }

  ngOnDestroy(): void {
    this.screen.breakpointSubscription.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  ngOnInit(): void {
		if (this.authService.loggedIn) {
			const token = readOwnedSessionToken();
			if (token) {
				this.authService.decodedToken = this.jwtHelper.decodeToken(token);
			}
		}
    this.isPublicPortal = this.resolvePublicPortal();
	}

  private esRutaLogin(): boolean {
    const path = `${this.router.url || ''}`.split('?')[0];
    return (
      path.includes('login-form') ||
      path.includes('recuperar-contrasena') ||
      path.includes('reset-password') ||
      path.includes('create-account') ||
      path.includes('change-password')
    );
  }

  private resolvePublicPortal(): boolean {
    const path = `${this.router.url || ''} ${window.location.pathname || ''}`.split('?')[0];
    return path.includes('formulario-empleo');
  }
}
