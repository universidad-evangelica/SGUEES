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

	// Qué hace: activa o inactiva la carga desde el descriptor.
	// Cómo lo hace: PUT Activar con el bit de la carga.
	cambiarActivo(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Activar', [], environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: activa o inactiva la carga desde el empleado.
	// Cómo lo hace: PUT ActivarPorEmpleado con el permiso de gen-empleado.
	cambiarActivoPorEmpleado(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarPorEmpleado', [], environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: quita un empleado del descriptor.
	// Cómo lo hace: DELETE con descriptor y empleado.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: lista los descriptores ya asignados al empleado.
	// Cómo lo hace: GET GetPorEmpleado con el correlativo del empleado.
	getPorEmpleado(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPorEmpleado', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: lista descriptores activos del puesto y la unidad del empleado.
	// Cómo lo hace: GET GetDisponiblesPorEmpleado con el correlativo del empleado.
	getDisponiblesPorEmpleado(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDisponiblesPorEmpleado', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: asigna un descriptor al empleado.
	// Cómo lo hace: POST PostPorEmpleado con el permiso de gen-empleado.
	asignarPorEmpleado(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PostPorEmpleado', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: quita un descriptor del empleado.
	// Cómo lo hace: DELETE DeletePorEmpleado con descriptor y empleado.
	quitarPorEmpleado(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DeletePorEmpleado', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: pide el PDF formato corto del descriptor para el empleado abierto.
	// Cómo lo hace: POST getPDFFormatoCorto con el permiso de impresión de gen-empleado.
	getPDFFormatoCorto(model: { CORR_DESCRIPTOR_PUESTO: number; CORR_EMPLEADO: number }): Observable<Blob> {
		return this.objData.PostBlob(model, this.xController, 'getPDFFormatoCorto', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: pide el PDF formato extenso del descriptor para el empleado abierto.
	// Cómo lo hace: POST getPDFFormatoExtenso con el permiso de impresión de gen-empleado.
	getPDFFormatoExtenso(model: { CORR_DESCRIPTOR_PUESTO: number; CORR_EMPLEADO: number }): Observable<Blob> {
		return this.objData.PostBlob(model, this.xController, 'getPDFFormatoExtenso', environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
