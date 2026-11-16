// Qué hace: repositorio HTTP para contratos del empleado (GEN_EMPLEADO_CONTRATO).
// Cómo lo hace: invoca endpoints de consulta, plantillas activas, borrador, emisión, finalización, anulación y archivo firmado.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';
import { GenEmpleadoContratoAccion } from './models/gen-empleado-contrato';

@Injectable({ providedIn: 'root' })
export class GenEmpleadoContratoRepository {
	readonly xController = 'GEN_EMPLEADO_CONTRATO';

	constructor(private objData: CData) {}

	// Qué hace: obtiene la lista histórica de contratos del empleado abierto.
	// Cómo lo hace: GET GEN_EMPLEADO_CONTRATO/GetAll filtrando por CORR_EMPLEADO.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: obtiene un contrato completo incluyendo el HTML congelado CUERPO_CONTRATO.
	// Cómo lo hace: GET GEN_EMPLEADO_CONTRATO/Get por CORR_EMPLEADO_CONTRATO.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: lista las plantillas con versión activa listas para generar contratos.
	// Cómo lo hace: GET GEN_EMPLEADO_CONTRATO/GetPlantillasActivas.
	getPlantillasActivas(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPlantillasActivas', [], environment.UrlGENERALAPI);
	}

	// Qué hace: genera una vista previa HTML del contrato sin guardarlo en base de datos.
	// Cómo lo hace: POST GEN_EMPLEADO_CONTRATO/Preview con plantilla, puesto y fechas actuales del modal.
	preview(model: GenEmpleadoContratoAccion): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Preview', environment.UrlGENERALAPI);
	}

	// Qué hace: asigna y genera un contrato inicial en estado BORRADOR.
	// Cómo lo hace: POST GEN_EMPLEADO_CONTRATO/Post con plantilla, puesto opcional y fechas.
	create(model: GenEmpleadoContratoAccion): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Post', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza o regenera un contrato en estado BORRADOR.
	// Cómo lo hace: PUT GEN_EMPLEADO_CONTRATO/Put con las fechas, plantilla y HTML opcional.
	update(model: GenEmpleadoContratoAccion): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Put', [], environment.UrlGENERALAPI);
	}

	// Qué hace: emite oficialmente un contrato BORRADOR dejándolo VIGENTE e inmutable.
	// Cómo lo hace: PUT GEN_EMPLEADO_CONTRATO/Emitir con CORR_EMPLEADO_CONTRATO.
	emitir(corrEmpleadoContrato: number): Observable<IResult> {
		return this.objData.Put(
			{ CORR_EMPLEADO_CONTRATO: corrEmpleadoContrato },
			this.xController,
			'Emitir',
			[],
			environment.UrlGENERALAPI
		);
	}

	// Qué hace: marca un contrato VIGENTE como FINALIZADO.
	// Cómo lo hace: PUT GEN_EMPLEADO_CONTRATO/Finalizar con CORR_EMPLEADO_CONTRATO.
	finalizar(corrEmpleadoContrato: number): Observable<IResult> {
		return this.objData.Put(
			{ CORR_EMPLEADO_CONTRATO: corrEmpleadoContrato },
			this.xController,
			'Finalizar',
			[],
			environment.UrlGENERALAPI
		);
	}

	// Qué hace: anula un contrato BORRADOR o VIGENTE registrando su motivo.
	// Cómo lo hace: PUT GEN_EMPLEADO_CONTRATO/Anular con CORR_EMPLEADO_CONTRATO y MOTIVO_ANULACION.
	anular(corrEmpleadoContrato: number, motivoAnulacion: string): Observable<IResult> {
		return this.objData.Put(
			{ CORR_EMPLEADO_CONTRATO: corrEmpleadoContrato, MOTIVO_ANULACION: motivoAnulacion },
			this.xController,
			'Anular',
			[],
			environment.UrlGENERALAPI
		);
	}

	// Qué hace: sube el archivo PDF o imagen firmado correspondiente al contrato.
	// Cómo lo hace: POST GEN_EMPLEADO_CONTRATO/PostDoc mediante FormData multipart.
	postDoc(corrEmpleadoContrato: number, file: File): Observable<IResult> {
		const formData = new FormData();
		formData.append('CORR_EMPLEADO_CONTRATO', String(corrEmpleadoContrato));
		formData.append('file', file, file.name);
		return this.objData.Post(formData, this.xController, 'PostDoc', environment.UrlGENERALAPI);
	}

	// Qué hace: descarga como Blob el documento firmado almacenado para previsualizarlo o descargarlo.
	// Cómo lo hace: GET GEN_EMPLEADO_CONTRATO/GetDoc como responseType blob.
	getDoc(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xController, 'GetDoc', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: elimina un contrato que aún permanece en estado BORRADOR.
	// Cómo lo hace: DELETE GEN_EMPLEADO_CONTRATO/Delete por CORR_EMPLEADO_CONTRATO.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Delete', xWhere, environment.UrlGENERALAPI);
	}
}

