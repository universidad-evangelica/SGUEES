import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CData } from 'src/app/FxAPI/CData';
import { IResult } from 'src/app/FxAPI/IResult';
import { BanReporteFiltro } from './models/ban-reporte-filtro';

@Injectable({ providedIn: 'root' })
export class BanReporteRepository {
	readonly xController = 'BAN_REPORTE';

	constructor(private objData: CData) {}

	obtenerDefiniciones(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDefiniciones', null, environment.UrlCONTAAPI);
	}

	consultar(filtro: BanReporteFiltro): Observable<IResult> {
		return this.objData.Post(filtro, this.xController, 'Consultar', environment.UrlCONTAAPI);
	}

	obtenerPdf(filtro: BanReporteFiltro): Observable<Blob> {
		return this.objData.PostBlob(filtro, this.xController, 'getPDF', environment.UrlCONTAAPI);
	}
}
