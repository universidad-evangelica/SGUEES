import { Injectable } from '@angular/core';
import {
	HttpInterceptor,
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse,
	HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			catchError(error => {
				if (error instanceof HttpErrorResponse) {
					if (error.error instanceof Blob) {
						return new Promise<any>((resolve, reject) => {
							const reader = new FileReader();
							reader.onload = (e: Event) => {
								try {
									const errmsg = JSON.parse((e.target as any).result);
									reject(
										new HttpErrorResponse({
											error: errmsg,
											headers: error.headers,
											status: error.status,
											statusText: error.statusText,
											url: error.url?.toString(),
										})
									);
								} catch (err) {
									reject(error);
								}
							};
							reader.onerror = e => {
								reject(error);
							};
							reader.readAsText(error.error);
						});
					}

					if (error.status === 401) {
						return throwError(() => error.statusText);
					}
					const applicationError = error.headers.get('Application-Error');
					if (applicationError) {
						return throwError(() => applicationError);
					}
					const serverError = error.error;
					let modalStateErrors = '';
					if (serverError && typeof serverError === 'object') {
						for (const key in serverError) {
              if (key == 'errors') {
                for (const errorDeta in serverError[key]) {
                  modalStateErrors += errorDeta + ':"' + serverError[key][errorDeta] + '"\n';
                }
              } else if (key == 'status') {
                if (serverError[key]) {
                  modalStateErrors += 'Status:' + serverError[key] + '\n';
                }
              } else if (key == 'title') {
                if (serverError[key]) {
                  modalStateErrors += serverError[key] + '\n';
                }
              } else if (key == 'ErrorMessage') {
                if (serverError[key]) {
                  modalStateErrors += 'Error: ' + serverError[key] + '\n';
                }
              }
						}
					}
					return throwError(() => modalStateErrors || serverError || error.message || ' Server Error');
					//return throwError(() => error.message);
				} else {
					return throwError(() => 'Server Error');
				}
			})
		);
	}
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ErrorInterceptorProvider = {
	provide: HTTP_INTERCEPTORS,
	useClass: ErrorInterceptor,
	multi: true,
};
