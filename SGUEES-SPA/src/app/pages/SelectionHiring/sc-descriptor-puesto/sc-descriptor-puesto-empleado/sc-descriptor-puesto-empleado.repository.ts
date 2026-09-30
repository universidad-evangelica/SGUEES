// Qué hace: llama a la API de empleados cargados en el descriptor.
// Cómo lo hace: GetAll, disponibles, alta y baja sobre SC_DESCRIPTOR_PUESTO_EMPLEADO.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScDescriptorPuestoEmpleadoRepository {
	readonly xController = 'SC_DESCRIPTOR_PUESTO_EMPLEADO';

	constructor(private objData: CData) {}

	// Qué hace: lista los empleados ya cargados en el descriptor.
	// Cómo lo hace: GET GetAll con el correlativo del descriptor.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: lista empleados que tienen el puesto y la unidad del descriptor.
	// Cómo lo hace: GET GetDisponibles con el correlativo del descriptor.
	getDisponibles(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDisponibles', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: carga un empleado en el descriptor.
	// Cómo lo hace: POST con el correlativo del empleado.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: quita un empleado del descriptor.
	// Cómo lo hace: DELETE con descriptor y empleado.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
