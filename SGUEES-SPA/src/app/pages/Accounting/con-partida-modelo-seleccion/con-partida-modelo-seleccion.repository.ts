import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaModeloSeleccionRepository {
	constructor(private objData: CData) {}

	getModelos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get('CON_PARTIDA_MODELO', 'GetAll', xWhere, environment.UrlCONTAAPI);
	}

	crearPartidaModelo(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, 'CON_PARTIDA', 'CrearPartidaModelo', xWhere, environment.UrlCONTAAPI);
	}
}
