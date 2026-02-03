import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
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
        message: 'Failed to create account',
      };
    }
  }

  async changePassword(email: string, recoveryCode: string) {
    try {
      // Send request

      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to change password',
      };
    }
  }

  async resetPassword(email: string) {
    try {
      // Send request

      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to reset password',
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

	getMenu(): Observable<any[]> {
		return this.http.get<any[]>(this.urlMtto + 'menu/', {});
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

		const isAuthForm = ['login-form', 'reset-password', 'create-account', 'change-password/:recoveryCode'].includes(
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
