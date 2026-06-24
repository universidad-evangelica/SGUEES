import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IResult } from './IResult';
import { IParam } from './IParam';

@Injectable({
	providedIn: 'root',
})
export class CData {
	UrlAPI = '';

	constructor(private http: HttpClient) {}

	Get(xController: string, xMetodo: string, xQueryList?: IParam[], xUrlAPI?: string): Observable<IResult> {
		if (xUrlAPI === undefined) {
			xUrlAPI = this.UrlAPI;
		}

		let parametros = new HttpParams();

		if (xQueryList !== undefined) {
			if (xQueryList !== null) {
				xQueryList.forEach(param => {
					parametros = parametros.append(param.Parameter, param.Value);
				});
			}
		}

		return this.http.get<IResult>(xUrlAPI + xController + '/' + xMetodo, { params: parametros });
	}

  GetBlob(xController: string, xMetodo: string, xQueryList?: IParam[], xUrlAPI?: string): Observable<Blob> {
		if (xUrlAPI === undefined) {
			xUrlAPI = this.UrlAPI;
		}

		let parametros = new HttpParams();

		if (xQueryList !== undefined) {
			if (xQueryList !== null) {
				xQueryList.forEach(param => {
					parametros = parametros.append(param.Parameter, param.Value);
				});
			}
		}

		return this.http.get<Blob>(xUrlAPI + xController + '/' + xMetodo, { params: parametros, responseType: 'blob' as 'json' });
	}

	Post(xContent: any, xController: string, xMetodo: string, xUrlAPI?: string): Observable<IResult> {
		if (xUrlAPI === undefined) {
			xUrlAPI = this.UrlAPI;
		}

		return this.http.post<IResult>(xUrlAPI + xController + '/' + xMetodo, xContent);
	}

	PostBlob(xContent: any, xController: string, xMetodo: string, xUrlAPI?: string): Observable<Blob> {
		if (xUrlAPI === undefined) {
			xUrlAPI = this.UrlAPI;
		}

		return this.http.post<Blob>(xUrlAPI + xController + '/' + xMetodo, xContent, {
			responseType: 'blob' as 'json',
		});
	}

	Put(xContent: any, xController: string, xMetodo: string, xWhere: IParam[], xUrlAPI?: string): Observable<IResult> {
		if (xUrlAPI === undefined) {
			xUrlAPI = this.UrlAPI;
		}

		let parametros = new HttpParams();

		if (xWhere !== null) {
			xWhere.forEach(param => {
				parametros = parametros.append(param.Parameter, param.Value);
			});
		}

		return this.http
			.put<IResult>(xUrlAPI + xController + '/' + xMetodo, xContent, { params: parametros })
			.pipe(map((response: any) => response));
	}

	Delete(xController: string, xMetodo: string, xWhere: IParam[], xUrlAPI?: string): any {
		if (xUrlAPI === undefined) {
			xUrlAPI = this.UrlAPI;
		}

		let parametros = new HttpParams();

		if (xWhere !== null) {
			xWhere.forEach(param => {
				parametros = parametros.append(param.Parameter, param.Value);
			});
		}

		return this.http
			.delete<IResult>(xUrlAPI + xController + '/' + xMetodo, { params: parametros })
			.pipe(map((response: any) => response));
	}
}
