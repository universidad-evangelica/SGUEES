import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PlaNivelAcademicoRepository {
	readonly xController = 'PLA_NIVEL_ACADEMICO';

	constructor(private objData: CData) {}

	// Solicita a la API el listado de niveles con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Consulta un nivel específico mediante sus filtros de identificación.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Envía un nuevo nivel académico al endpoint de mantenimiento.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlTALENTOHUMANONAPI);
	}

	// Envía al API la solicitud para actualizar el nivel identificado por sus claves.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Elimina el nivel identificado por los parámetros de búsqueda.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Cambia el estado activo/inactivo del nivel vía ActivarInactivar.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlTALENTOHUMANONAPI);
	}
}
