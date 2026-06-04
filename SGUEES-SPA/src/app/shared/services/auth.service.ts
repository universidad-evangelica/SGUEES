import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs/operators';
import { Observable, lastValueFrom, of } from 'rxjs';
import notify from 'devextreme/ui/notify';

const defaultPath = '/';

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

	private _lastAuthenticatedPath: string = defaultPath;
	set lastAuthenticatedPath(value: string) {
		this._lastAuthenticatedPath = value;
	}

	constructor(private router: Router, private http: HttpClient) {}

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
                // Solo guardar token si NO requiere cambio de contraseña
                localStorage.setItem('token', response.Data.TOKEN);
                this.decodedToken = this.jwtHelper.decodeToken(response.Data.TOKEN);
                this.mainMenu = response.Data.OPCIONES;
                console.log(this.mainMenu)
              }
              // Siempre retornar la respuesta completa (incluyendo REQUIERE_CAMBIO_CLAVE)
            } else {
              notify(
                {
                  message: response.ErrorMessage,
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
		const token = localStorage.getItem('token') || '';

		if (!this.jwtHelper.isTokenExpired(token)) {
			return true;
		}
		return false;
	}

	async logOut(): Promise<void> {
		localStorage.removeItem('token');
		this.router.navigate(['/login-form']);
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

    const isAuthForm = ['login-form', 'recuperar-contrasena', 'reset-password', 'create-account', 'change-password/:recoveryCode', 'change-password'].includes(
			route.routeConfig?.path || defaultPath
		);

		// eslint-disable-next-line prefer-const
		routerList = state.url.slice(1).split('/');
		// eslint-disable-next-line prefer-const
		routerUrl = '/' + routerList[0];

		if (isLoggedIn && isAuthForm) {
			this.authService.lastAuthenticatedPath = defaultPath;
			this.router.navigate([defaultPath]);
			return false;
		}

		if (!isLoggedIn && !isAuthForm) {
			this.router.navigate(['/login-form']);
		}

		if (isLoggedIn) {
			if (routerUrl === '/' || routerUrl === '/home' || routerUrl === '/profile') {
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

		if ((isAuthorized === false || isLoggedIn === false) && isAuthForm === false) {
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
