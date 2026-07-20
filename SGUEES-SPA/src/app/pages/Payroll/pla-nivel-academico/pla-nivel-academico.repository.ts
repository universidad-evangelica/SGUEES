// Acceso HTTP al API Nivel Académico (controller PLA_NIVEL_ACADEMICO).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: agrupa las llamadas HTTP al controlador PLA_NIVEL_ACADEMICO.
export class PlaNivelAcademicoRepository {
	readonly xController = 'PLA_NIVEL_ACADEMICO';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de niveles académicos.
	// Cómo: GET GetAll al controlador PLA_NIVEL_ACADEMICO con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: consulta un nivel académico puntual.
	// Cómo: GET Get al controlador PLA_NIVEL_ACADEMICO con la llave en xWhere.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: crea un nivel académico nuevo.
	// Cómo: POST con el modelo al controlador PLA_NIVEL_ACADEMICO.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: actualiza un nivel académico existente.
	// Cómo: PUT con el modelo y la llave en xWhere al controlador PLA_NIVEL_ACADEMICO.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: elimina un nivel académico.
	// Cómo: DELETE con la llave en xWhere al controlador PLA_NIVEL_ACADEMICO.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlTALENTOHUMANONAPI);
	}

	// Qué hace: cambia el estado activo/inactivo de un nivel académico.
	// Cómo: PUT a ActivarInactivar con el modelo y la llave en xWhere.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlTALENTOHUMANONAPI);
	}
}
