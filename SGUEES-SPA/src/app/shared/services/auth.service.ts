import { Injectable, NgZone } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs/operators';
import { Observable, lastValueFrom, of } from 'rxjs';
import notify from 'devextreme/ui/notify';

const defaultPath = '/';
const SESSION_CONTEXT_KEY = 'sguees_session_context';
const SESSION_ID_KEY = 'sguees_session_id';
const LAST_ACTIVITY_KEY = 'sguees_last_activity';
const INACTIVIDAD_MS = 24 * 60 * 60 * 1000;
const AVISO_INACTIVIDAD_MS = 20 * 1000;

// Qué hace: devuelve el token solo si esta pestaña aceptó la sesión vigente.
// Cómo lo hace: compara el id de localStorage con el id propio de la pestaña.
export function readOwnedSessionToken(): string {
	const token = localStorage.getItem('token') || '';
	const localId = localStorage.getItem(SESSION_ID_KEY) || '';
	const tabId = sessionStorage.getItem(SESSION_ID_KEY) || '';
	if (!token || !localId || localId !== tabId) {
		return '';
	}
	return token;
}

interface SessionContext {
	NOMBRE_EMPRESA?: string;
	CODIGO_SUITE?: string;
	NOMBRE_INSTANCIA?: string;
}

export interface IUser {
  user: string;
  name?: string;
  avatarUrl?: string;
}

export interface IResponse {
  isOk: boolean;
  data?: IUser;
  message?: string;
}

/*export const defaultUser: IUser = {
  email: 'jheart@dx-email.com',
  name: 'John Heart',
  avatarUrl: 'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/01.png',
};*/

@Injectable()
export class AuthService {
  readonly urlMtto = environment.UrlSEGURIDADAPI + 'SEG_USUARIO/';
	jwtHelper = new JwtHelperService();
	decodedToken: any;
	mainMenu: any;
	public urlIntentaAcceder = '';
	idleWarningVisible = false;
	idleSecondsLeft = 20;
	private lastActivityWrite = 0;

	private _lastAuthenticatedPath: string = defaultPath;
	private sessionContext: SessionContext = {};

	set lastAuthenticatedPath(value: string) {
		this._lastAuthenticatedPath = value;
	}

	constructor(private router: Router, private http: HttpClient, private zone: NgZone) {
		this.loadSessionContext();
		this.adoptExistingSession();
		this.listenForOtherTabs();
		this.vigilarInactividad();
	}

  private extractErrorMessage(error: any, fallback: string): string {
    const payload = error?.error;

    if (payload?.ErrorMessage && typeof payload.ErrorMessage === 'string') {
      return payload.ErrorMessage;
    }

    if (payload?.message && typeof payload.message === 'string') {
      return payload.message;
    }

    if (payload?.title && typeof payload.title === 'string') {
      return payload.title;
    }

    if (payload?.errors && typeof payload.errors === 'object') {
      const firstKey = Object.keys(payload.errors)[0];
      const firstError = firstKey ? payload.errors[firstKey] : null;
      if (Array.isArray(firstError) && firstError.length > 0) {
        return String(firstError[0]);
      }
      if (typeof firstError === 'string' && firstError.trim()) {
        return firstError;
      }
    }

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (error?.message && typeof error.message === 'string') {
      return error.message;
    }

    return fallback;
  }

	logIn(login: string, password: string): any {
		return this.http
			.post(this.urlMtto + 'login', { LOGIN_SISTEMA: login, CLAVE_USUARIO: password, CODIGO_SUITE: 'SGUEES' })
			.pipe(
				map((response: any) => {
					if (response) {
            if (response.Result)
            {
              // Verificar si requiere cambio de contraseña
              if (!response.Data.REQUIERE_CAMBIO_CLAVE) {
                this.applyLoginSession(response.Data);
              }
              // Siempre retornar la respuesta completa (incluyendo REQUIERE_CAMBIO_CLAVE)
            } else {
              // El componente de login muestra el mensaje al usuario.
            }
					}
					return response;
				})
			);
	}

  async getUser() {
    try {
      return {
        isOk: true,
        data: this.decodedToken.LOGIN_SISTEMA,
      };
    } catch {
      return {
        isOk: false,
        data: null,
      };
    }
  }

  async createAccount(email: string, password: string) {
    try {
      // Send request

      this.router.navigate(['/auth/create-account']);
      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'No se pudo crear la cuenta',
      };
    }
  }

  async changePassword(password: string, recoveryCode: string, loginSistema: string) {
    try {
      const response: any = await lastValueFrom(
        this.http.post(this.urlMtto + 'restablecer-contrasena', {
          LOGIN_SISTEMA: loginSistema,
          RESET_TOKEN: recoveryCode,
          CLAVE_USUARIO_NUEVA: password,
        })
      );

      if (response?.Result === false) {
        const backendMessage =
          response?.ErrorMessage ||
          response?.errorMessage ||
          response?.message;

        return {
          isOk: false,
          message: backendMessage || 'No fue posible restablecer la contraseña',
        };
      }

      return {
        isOk: response?.Result !== false,
      };
    } catch (error: any) {
      return {
        isOk: false,
        message: this.extractErrorMessage(error, 'No fue posible restablecer la contraseña'),
      };
    }
  }

  async resetPassword(loginSistema: string) {
    try {
      const response: any = await lastValueFrom(
        this.http.post(this.urlMtto + 'solicitar-restablecer-contrasena', {
          LOGIN_SISTEMA: loginSistema,
        })
      );

      if (response?.Result === false) {
        return {
          isOk: false,
          message: response?.ErrorMessage || 'No fue posible enviar el correo de recuperación',
        };
      }

      return {
        isOk: response?.Result !== false,
      };
    } catch (error: any) {
      return {
        isOk: false,
        message: this.extractErrorMessage(error, 'No fue posible enviar el correo de recuperación'),
      };
    }
  }

  get loggedIn(): boolean {
		const token = readOwnedSessionToken();
		return !!token && !this.jwtHelper.isTokenExpired(token);
	}

	getCorrEmpresaSesion(): number {
		const token = readOwnedSessionToken();
		if (!token || this.jwtHelper.isTokenExpired(token)) {
			return 0;
		}

		this.ensureDecodedToken();

		const value = Number(this.decodedToken?.CORR_EMPRESA ?? 0);
		return Number.isFinite(value) ? value : 0;
	}

	getNombreEmpresaSesion(): string {
		const fromToken = `${this.decodedToken?.NOMBRE_EMPRESA ?? ''}`.trim();
		const fromSession = `${this.sessionContext.NOMBRE_EMPRESA ?? ''}`.trim();

		if (fromToken) {
			return fromToken;
		}

		if (fromSession) {
			return fromSession;
		}

		const corrEmpresa = this.getCorrEmpresaSesion();
		return corrEmpresa > 0 ? `Empresa #${corrEmpresa}` : 'Sin empresa asignada';
	}

	getInstanciaSesion(): string {
		const fromSessionName = `${this.sessionContext.NOMBRE_INSTANCIA ?? ''}`.trim();
		if (fromSessionName) {
			return fromSessionName;
		}

		const fromToken = `${this.decodedToken?.CODIGO_SUITE ?? ''}`.trim();
		const fromSession = `${this.sessionContext.CODIGO_SUITE ?? ''}`.trim();

		return fromToken || fromSession || 'SGUEES';
	}

	applyLoginSession(loginData: any): void {
		if (!loginData?.TOKEN) {
			return;
		}

		const sessionId = this.createSessionId();
		sessionStorage.setItem(SESSION_ID_KEY, sessionId);
		localStorage.setItem('token', loginData.TOKEN);
		localStorage.setItem(SESSION_ID_KEY, sessionId);
		this.marcarActividad(true);
		this.decodedToken = this.jwtHelper.decodeToken(loginData.TOKEN);
		this.mainMenu = loginData.OPCIONES;
		this.persistSessionContext({
			NOMBRE_EMPRESA: loginData.NOMBRE_EMPRESA ?? '',
			CODIGO_SUITE: loginData.CODIGO_SUITE ?? this.decodedToken?.CODIGO_SUITE ?? 'SGUEES',
		});
	}

	updateSessionContext(context: SessionContext): void {
		this.persistSessionContext(context);
	}

	private loadSessionContext(): void {
		try {
			const raw = localStorage.getItem(SESSION_CONTEXT_KEY);
			this.sessionContext = raw ? JSON.parse(raw) : {};
		} catch {
			this.sessionContext = {};
		}
	}

	private persistSessionContext(context: SessionContext): void {
		this.sessionContext = {
			...this.sessionContext,
			...context,
		};
		localStorage.setItem(SESSION_CONTEXT_KEY, JSON.stringify(this.sessionContext));
	}

	private clearSessionContext(): void {
		this.sessionContext = {};
		localStorage.removeItem(SESSION_CONTEXT_KEY);
	}

	private ensureDecodedToken(): void {
		if (this.decodedToken) {
			return;
		}

		const token = readOwnedSessionToken();
		if (!token || this.jwtHelper.isTokenExpired(token)) {
			return;
		}

		try {
			this.decodedToken = this.jwtHelper.decodeToken(token);
		} catch {
			this.decodedToken = null;
		}
	}

	tieneEmpresaAsignada(): boolean {
		return this.getCorrEmpresaSesion() > 0;
	}

	private handlingSessionExpiry = false;
	private sessionClosing = false;

	get isHandlingSessionExpiry(): boolean {
		return this.handlingSessionExpiry;
	}

	// Qué hace: indica que esta pestaña va hacia el login porque la sesión terminó.
	// Cómo lo hace: el shell lo usa para no desmontar la vista antes de llegar al login.
	get cerrandoSesion(): boolean {
		return this.sessionClosing;
	}

	handleSessionExpired(): void {
		if (this.handlingSessionExpiry || this.sessionClosing) {
			return;
		}

		this.handlingSessionExpiry = true;
		this.sessionClosing = true;
		this.clearOwnedSession();
		this.decodedToken = {} as any;
		this.mainMenu = [];

		notify(
			{
				message: 'Su sesión expiró. Ingrese nuevamente para continuar.',
				width: 'auto',
				shading: false,
				closeOnClick: true,
				closeOnOutsideClick: true,
			},
			'warning',
			8000
		);

		void this.router.navigate(['/login-form']).finally(() => {
			this.handlingSessionExpiry = false;
			this.sessionClosing = false;
		});
	}

	async logOut(): Promise<void> {
		this.sessionClosing = true;
		this.clearOwnedSession();
		this.decodedToken = {} as any;
		this.mainMenu = [];
		void this.router.navigate(['/login-form']).finally(() => {
			this.sessionClosing = false;
		});
	}

	// Qué hace: toma la sesión ya guardada al recargar esta pestaña.
	// Cómo lo hace: copia el id vigente a sessionStorage. Si otra pestaña ya tiene otro id, no lo adopta.
	private adoptExistingSession(): void {
		const token = localStorage.getItem('token') || '';
		if (!token || this.jwtHelper.isTokenExpired(token)) {
			return;
		}

		let localId = localStorage.getItem(SESSION_ID_KEY) || '';
		const tabId = sessionStorage.getItem(SESSION_ID_KEY) || '';
		if (localId && tabId && localId !== tabId) {
			return;
		}

		if (!localId) {
			localId = this.createSessionId();
			localStorage.setItem(SESSION_ID_KEY, localId);
		}

		sessionStorage.setItem(SESSION_ID_KEY, localId);
		if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
			this.marcarActividad(true);
		}
		this.ensureDecodedToken();
	}

	// Qué hace: escucha el login o el cierre de sesión hecho en otra pestaña.
	// Cómo lo hace: el evento storage solo llega a las demás pestañas, no a la que escribió.
	private listenForOtherTabs(): void {
		window.addEventListener('storage', (event: StorageEvent) => {
			if (event.key === LAST_ACTIVITY_KEY) {
				this.revisarInactividad();
				return;
			}
			if (event.key !== SESSION_ID_KEY && event.key !== 'token') {
				return;
			}
			this.zone.run(() => this.onForeignSessionChanged());
		});
	}

	// Qué hace: saca de la aplicación a esta pestaña si ya no es dueña de la sesión.
	// Cómo lo hace: limpia el estado en memoria y abre el login. No borra el token nuevo de la otra pestaña.
	private onForeignSessionChanged(): void {
		const tabId = sessionStorage.getItem(SESSION_ID_KEY) || '';
		if (!tabId) {
			return;
		}

		const localId = localStorage.getItem(SESSION_ID_KEY) || '';
		const token = localStorage.getItem('token') || '';
		const replacedByOtherLogin = !!localId && localId !== tabId;
		const closedElsewhere = !token;
		if (!replacedByOtherLogin && !closedElsewhere) {
			return;
		}

		sessionStorage.removeItem(SESSION_ID_KEY);
		this.decodedToken = {} as any;
		this.mainMenu = [];
		this.sessionClosing = true;
		notify(
			{
				message: replacedByOtherLogin
					? 'Se inició sesión en otra pestaña. Ingrese nuevamente en esta ventana.'
					: 'La sesión se cerró. Ingrese nuevamente.',
				width: 'auto',
				shading: false,
				closeOnClick: true,
				closeOnOutsideClick: true,
			},
			'warning',
			8000
		);

		const path = (this.router.url || '').split('?')[0];
		if (path !== '/login-form') {
			void this.router.navigate(['/login-form']).finally(() => {
				this.sessionClosing = false;
			});
			return;
		}
		this.sessionClosing = false;
	}

	// Qué hace: borra token e id de la sesión de esta pestaña.
	// Cómo lo hace: limpia localStorage y el id propio de sessionStorage.
	private clearOwnedSession(): void {
		localStorage.removeItem('token');
		localStorage.removeItem(SESSION_ID_KEY);
		localStorage.removeItem(LAST_ACTIVITY_KEY);
		sessionStorage.removeItem(SESSION_ID_KEY);
		this.idleWarningVisible = false;
		this.clearSessionContext();
	}

	// Qué hace: renueva el plazo de 1 día sin actividad.
	// Cómo lo hace: guarda la hora actual. Si el aviso está abierto, lo cierra.
	registrarActividad(): void {
		this.marcarActividad(true);
	}

	// Qué hace: cuenta 1 día sin uso y avisa los últimos 20 segundos.
	// Cómo lo hace: escucha mouse, teclado y toque fuera de Angular, y revisa el plazo cada segundo.
	private vigilarInactividad(): void {
		const eventos = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];
		this.zone.runOutsideAngular(() => {
			eventos.forEach((nombre) => {
				window.addEventListener(nombre, () => this.marcarActividad(false), { passive: true });
			});
			window.setInterval(() => this.revisarInactividad(), 1000);
		});
	}

	private marcarActividad(forzar: boolean): void {
		if (this.sessionClosing || !readOwnedSessionToken()) {
			return;
		}

		const ahora = Date.now();
		if (!forzar && !this.idleWarningVisible && ahora - this.lastActivityWrite < 1000) {
			return;
		}

		this.lastActivityWrite = ahora;
		localStorage.setItem(LAST_ACTIVITY_KEY, String(ahora));
		if (this.idleWarningVisible) {
			this.idleWarningVisible = false;
			this.idleSecondsLeft = 20;
			this.zone.run(() => {
				this.idleWarningVisible = false;
				this.idleSecondsLeft = 20;
			});
		}
	}

	private revisarInactividad(): void {
		if (this.sessionClosing || this.handlingSessionExpiry || !readOwnedSessionToken()) {
			if (this.idleWarningVisible) {
				this.zone.run(() => {
					this.idleWarningVisible = false;
				});
			}
			return;
		}

		const ultima = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || '0');
		if (!ultima) {
			this.marcarActividad(true);
			return;
		}

		const restante = INACTIVIDAD_MS - (Date.now() - ultima);
		if (restante <= 0) {
			this.zone.run(() => this.cerrarPorInactividad());
			return;
		}

		if (restante <= AVISO_INACTIVIDAD_MS) {
			const segundos = Math.max(1, Math.ceil(restante / 1000));
			this.zone.run(() => {
				this.idleSecondsLeft = segundos;
				this.idleWarningVisible = true;
			});
			return;
		}

		if (this.idleWarningVisible) {
			this.zone.run(() => {
				this.idleWarningVisible = false;
				this.idleSecondsLeft = 20;
			});
		}
	}

	// Qué hace: cierra la sesión al cumplirse 1 día sin actividad.
	// Cómo lo hace: usa el mismo cierre que Salir, sin preguntar por los cambios del formulario.
	private cerrarPorInactividad(): void {
		if (this.sessionClosing || !readOwnedSessionToken()) {
			return;
		}

		this.idleWarningVisible = false;
		notify(
			{
				message: 'La sesión se cerró por inactividad.',
				width: 'auto',
				shading: false,
				closeOnClick: true,
				closeOnOutsideClick: true,
			},
			'warning',
			8000
		);
		void this.logOut();
	}

	private createSessionId(): string {
		const cryptoRef = window.crypto;
		if (cryptoRef?.randomUUID) {
			return cryptoRef.randomUUID();
		}
		return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	}

	getMenu(): Observable<any> {
		return this.http.get<any>(this.urlMtto + 'menu/', {}).pipe(
			map((response: any) => {
				if (Array.isArray(response?.Data)) {
					this.mainMenu = response.Data;
				}

				return response;
			})
		);
	}

	getMainMenu(): Observable<any[]> {
		if (Array.isArray(this.mainMenu)) {
			return of(this.mainMenu);
		}

		return this.getMenu().pipe(
			map((response: any) => response?.Data ?? [])
		);
	}

  //seccion para mostrar los modulos en el home dependiendo de los permisos del usuario
  /** Misma regla que CBaseComponent / Home: permiso de lectura en el JWT. */
	hasReadPermission(permissionKey: string): boolean {
		const token = this.decodedToken;
		if (!token || !this.loggedIn) {
			return false;
		}

		const perm = token[permissionKey];
		return typeof perm === 'string' && perm.includes('R');
	}

	/** Claves posibles para una URL (ruta completa, hoja, primer segmento). */
	resolvePermissionKeysFromUrl(url: string): string[] {
		const path = url.split('?')[0];
		const segments = path.split('/').filter(Boolean);
		const keys: string[] = [];

		if (segments.length === 0) {
			return ['/'];
		}

		keys.push('/' + segments.join('/'));
		keys.push('/' + segments[segments.length - 1]);
		keys.push('/' + segments[0]);

		return [...new Set(keys)];
	}

	canAccessUrl(url: string): boolean {
		const path = url.split('?')[0];

		if (path === '/' || path === '/home') {
			return true;
		}

		if (path === '/profile' || path.startsWith('/profile/')) {
			return true;
		}

		return this.resolvePermissionKeysFromUrl(path).some((key) => this.hasReadPermission(key));
	}
}

@Injectable()
export class AuthGuardService implements CanActivate {
	constructor(private router: Router, private authService: AuthService) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		const isLoggedIn = this.authService.loggedIn;

		let isAuthorized = false;
		let routerUrl: string;
		let routerList: Array<any>;

    const isPublicForm = route.routeConfig?.path === 'formulario-empleo';
    const isAuthForm = ['login-form', 'recuperar-contrasena', 'reset-password', 'formulario-empleo', 'create-account', 'change-password/:recoveryCode', 'change-password'].includes(
			route.routeConfig?.path || defaultPath
		);

		if (isLoggedIn && !this.authService.tieneEmpresaAsignada() && !isAuthForm) {
			void this.authService.logOut();
			notify(
				{
					message: 'Su usuario no tiene una empresa por defecto asignada. Solicite a administración que configure una empresa por defecto en el sistema.',
					width: 'auto',
					shading: false,
					closeOnClick: true,
					closeOnOutsideClick: true,
				},
				'warning',
				8000
			);
			return false;
		}

		// eslint-disable-next-line prefer-const
		routerList = state.url.slice(1).split('/');
		// Sin query/matrix params: JWT usa claves tipo `/sc-requisicion-personal`
		const primerSegmento = (routerList[0] || '').split('?')[0].split(';')[0];
		// eslint-disable-next-line prefer-const
		routerUrl = '/' + primerSegmento;

		if (isLoggedIn && isAuthForm && !isPublicForm) {
			this.authService.lastAuthenticatedPath = defaultPath;
			this.router.navigate([defaultPath]);
			return false;
		}

		if (!isLoggedIn && !isAuthForm) {
			this.router.navigate(['/login-form']);
		}

		if (isLoggedIn) {
			// Utilidades globales: no requieren entrada en menú/JWT (el asistente filtra opciones por permiso R).
			const rutasUtilidad = ['/home', '/profile', '/asistente', '/ai-demo'];
			if (routerUrl === '/' || rutasUtilidad.includes(routerUrl)) {
				isAuthorized = true;
			} else if (
				this.authService.decodedToken[routerUrl] &&
				typeof this.authService.decodedToken[routerUrl] === 'string'
			) {
				if (this.authService.decodedToken[routerUrl].includes('R')) {
					this.authService.lastAuthenticatedPath = route.routeConfig?.path || '';
					isAuthorized = true;
				}
			}
		}

		if ((isAuthorized === false || isLoggedIn === false) && isAuthForm === false && !this.authService.cerrandoSesion) {
			if (routerUrl !== '/' && routerUrl !== '/home') {
				notify(
					{
						message: 'ACCESO NO AUTORIZADO!',
						width: 'auto',
						shading: false,
						closeOnClick: true,
						closeOnOutsideClick: true,
					},
					'error',
					500000
				);
			}
		}

		return (isLoggedIn && isAuthorized) || isAuthForm;
	}
}
