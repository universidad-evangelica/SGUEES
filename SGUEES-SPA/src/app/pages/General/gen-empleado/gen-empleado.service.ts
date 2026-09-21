// Qué hace: servicio de negocio del browse/formulario de Empleado.
// Cómo: GetAll/Get/Iniciar + personales + documentos (repos anidados, patrón sc-descriptor-puesto).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenEmpleadoRepository } from './gen-empleado.repository';
import { GenPersonaTipoDocumentoIdentidadRepository } from './gen-persona-tipo-documento-identidad/gen-persona-tipo-documento-identidad.repository';

const ESTADO_FIELD = 'ACTIVO_EMPLEADO';

@Injectable({ providedIn: 'root' })
export class GenEmpleadoService {
	constructor(
		private repo: GenEmpleadoRepository,
		private documentosRepo: GenPersonaTipoDocumentoIdentidadRepository
	) {}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_EMPLEADO', Value: param.CORR_EMPLEADO }]);
	}

	iniciar(model: any): Observable<IResult> {
		return this.repo.iniciar(model);
	}

	getPersonaNatural(corrPersona: number): Observable<IResult> {
		return this.repo.getPersonaNatural([{ Parameter: 'CORR_PERSONA', Value: corrPersona }]);
	}

	createPersonaNatural(model: any): Observable<IResult> {
		return this.repo.createPersonaNatural(model);
	}

	updatePersonaNatural(model: any): Observable<IResult> {
		return this.repo.updatePersonaNatural(model, [
			{ Parameter: 'CORR_PERSONA_NATURAL', Value: model.CORR_PERSONA_NATURAL },
		]);
	}

	deletePersonaNatural(model: any): Observable<IResult> {
		return this.repo.deletePersonaNatural([
			{ Parameter: 'CORR_PERSONA_NATURAL', Value: model.CORR_PERSONA_NATURAL },
		]);
	}

	// Qué hace: elimina un empleado del browse.
	// Cómo: DELETE por CORR_EMPLEADO (empresa va por claim en API).
	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_EMPLEADO', Value: model.CORR_EMPLEADO }]);
	}

	/** Qué hace: sube fotografía del empleado (guarda archivo y retorna FOTO_URL). */
	subirFoto(corrPersona: number, file: File): Observable<IResult> {
		return this.repo.subirFoto(corrPersona, file);
	}

	/** Qué hace: obtiene blob de la foto del empleado para mostrar en UI. */
	getFoto(corrPersona: number): Observable<Blob> {
		return this.repo.getFoto(corrPersona);
	}

	// Qué hace: lista catálogo activo + valores de documentos de la persona.
	// Cómo: repo anidado GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD.GetAll.
	getDocumentosIdentidad(corrPersona: number): Observable<IResult> {
		return this.documentosRepo.getAll([{ Parameter: 'CORR_PERSONA', Value: corrPersona ?? 0 }]);
	}

	// Qué hace: guarda documentos del tab (body List Table; CORR_PERSONA en query).
	saveDocumentosIdentidad(corrPersona: number, documentos: any[]): Observable<IResult> {
		return this.documentosRepo.saveAll(corrPersona, documentos);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_EMPLEADO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_EMPLEADO', caption: 'Persona', width: 280, minWidth: 200 },
			{ dataField: 'DUI', caption: 'DUI', width: 120, minWidth: 100 },
			{
				dataField: 'FECHA_INGRESO',
				caption: 'Fecha ingreso',
				width: 130,
				dataType: 'date',
				format: 'dd/MM/yyyy',
			},
			{ dataField: 'CORREO_INSTITUCIONAL', caption: 'Correo', width: 220, minWidth: 160 },
			{ dataField: 'TELEFONO_INSTITUCIONAL', caption: 'Teléfono', width: 130, minWidth: 110 },
			{ dataField: 'LOGIN_SISTEMA_WEB', caption: 'Login', width: 140, minWidth: 110 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_EMPLEADO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param?.CORR_EMPLEADO) {
			xWhere.push({ Parameter: 'CORR_EMPLEADO', Value: param.CORR_EMPLEADO });
		}
		return xWhere;
	}
}
