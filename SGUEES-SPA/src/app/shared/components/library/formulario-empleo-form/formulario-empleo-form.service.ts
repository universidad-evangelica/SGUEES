import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class FormularioEmpleoFormService {
	private readonly controller = 'SC_SOLICITUD_EMPLEO_PUBLICO';

	constructor(private http: HttpClient) {}

	validarToken(token: string): Observable<IResult> {
		const params = new HttpParams().set('TOKEN', token);
		return this.http.get<IResult>(
			`${environment.UrlSELECCIONCONTRATACIONAPI}${this.controller}/ValidarToken`,
			{ params }
		);
	}

	completar(data: any): Observable<IResult> {
		return this.http.post<IResult>(
			`${environment.UrlSELECCIONCONTRATACIONAPI}${this.controller}/Completar`,
			data
		);
	}
}
