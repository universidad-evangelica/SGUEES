// Qué hace: servicio de negocio del catálogo de Facultades.
// Cómo lo hace: valida, ejecuta el CRUD vía repositorio y arma columnas/formulario (patrón gen-actividad-economica).
//               Las reglas que dependen de carreras y períodos (desactivar, eliminar) las valida el API.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaFacultades } from './models/aca-facultades';
import { AcaFacultadesRepository } from './aca-facultades.repository';

const ESTADO_FIELD = 'ACTIVO';
const MAX_CODIGO = 20;
const MAX_NOMBRE = 200;

@Injectable({ providedIn: 'root' })
export class AcaFacultadesService {
	constructor(private repo: AcaFacultadesRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige código (máx 20) y nombre (máx 200), sin contar espacios sobrantes.
	esValido(model: AcaFacultades, msg: Function): boolean {
		const codigo = `${model.CODIGO_FACULTAD ?? ''}`.trim();
		const nombre = `${model.NOMBRE_FACULTAD ?? ''}`.trim();

		if (!codigo) {
			msg('Debe ingresar el código de la facultad.', NotifyType.Warning);
			return false;
		}
		if (codigo.length > MAX_CODIGO) {
			msg(`El código no puede superar ${MAX_CODIGO} caracteres.`, NotifyType.Warning);
			return false;
		}
		if (!nombre) {
			msg('Debe ingresar el nombre de la facultad.', NotifyType.Warning);
			return false;
		}
		if (nombre.length > MAX_NOMBRE) {
			msg(`El nombre no puede superar ${MAX_NOMBRE} caracteres.`, NotifyType.Warning);
			return false;
		}
		return true;
	}

	// Qué hace: deja código y nombre sin espacios sobrantes antes de enviarlos.
	normalizar(model: AcaFacultades): AcaFacultades {
		return {
			...model,
			CODIGO_FACULTAD: `${model.CODIGO_FACULTAD ?? ''}`.trim().toUpperCase(),
			NOMBRE_FACULTAD: `${model.NOMBRE_FACULTAD ?? ''}`.trim(),
		};
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_FACULTAD', Value: param.CORR_FACULTAD }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_FACULTAD', Value: model.CORR_FACULTAD }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_FACULTAD', Value: model.CORR_FACULTAD }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_FACULTAD', Value: model.CORR_FACULTAD }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_FACULTAD',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_FACULTAD', caption: 'Código', width: 110, minWidth: 90 },
			{ dataField: 'NOMBRE_FACULTAD', caption: 'Nombre', width: 360, minWidth: 220 },
            {dataField:'NOMBRE_DECANO',caption:'Decano',width:260,minWidth:180},
			{
				dataField: 'CARRERAS_ACTIVAS',
				caption: 'Carreras activas',
				width: 140,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'SEDES', caption: 'Sedes', width: 200, minWidth: 140 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_FACULTAD',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_FACULTAD', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO_FACULTAD',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: MAX_CODIGO },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_FACULTAD',
				label: { text: 'Nombre' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre de la facultad...', showClearButton: true, maxLength: MAX_NOMBRE },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 1 },
            {dataField:'CORR_DECANO',label:{text:'Decano de la facultad'},template:'decanoLookup',colSpan:4},
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_FACULTAD) {
			xWhere.push({ Parameter: 'CORR_FACULTAD', Value: param.CORR_FACULTAD });
		}
		return xWhere;
	}
}
