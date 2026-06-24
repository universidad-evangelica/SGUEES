import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CData } from 'src/app/FxAPI/CData';
import { IResult } from 'src/app/FxAPI/IResult';
import { ConReporteFiltro } from './models/con-reporte-filtro';

@Injectable({
	providedIn: 'root',
})
export class ConReporteRepository {
	readonly xController = 'CON_REPORTE';

	constructor(private objData: CData) {}

	getDefiniciones(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDefiniciones', null, environment.UrlCONTAAPI);
	}

	getConfiReportes(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetConfiReportes', null, environment.UrlCONTAAPI);
	}

	consultar(filtro: ConReporteFiltro): Observable<IResult> {
		return this.objData.Post(filtro, this.xController, 'Consultar', environment.UrlCONTAAPI);
	}

	getPDF(filtro: ConReporteFiltro): Observable<Blob> {
		return this.objData.PostBlob(filtro, this.xController, 'getPDF', environment.UrlCONTAAPI);
	}
}
