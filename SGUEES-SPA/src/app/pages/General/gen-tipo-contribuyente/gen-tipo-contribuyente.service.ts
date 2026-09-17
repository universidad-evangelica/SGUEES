// Qué hace: servicio de negocio del catálogo Tipo Contribuyente.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario (patrón sc-frecuencia).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenTipoContribuyente } from './models/gen-tipo-contribuyente';
import { GenTipoContribuyenteRepository } from './gen-tipo-contribuyente.repository';

const ESTADO_FIELD = 'ACTIVO_TIPO_CONTRIBUYENTE';

@Injectable({ providedIn: 'root' })
export class GenTipoContribuyenteService {
	constructor(private repo: GenTipoContribuyenteRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige nombre (máx 25).
	esValido(model: GenTipoContribuyente, msg: Function): boolean {
		if (!model.NOMBRE_TIPO_CONTRIBUYENTE || model.NOMBRE_TIPO_CONTRIBUYENTE.trim() === '') {
			msg('Debe ingresar el nombre del tipo de contribuyente.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_TIPO_CONTRIBUYENTE.trim().length > 25) {
			msg('El nombre no puede superar 25 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_TIPO_CONTRIBUYENTE', Value: param.CORR_TIPO_CONTRIBUYENTE }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_TIPO_CONTRIBUYENTE', Value: model.CORR_TIPO_CONTRIBUYENTE }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_TIPO_CONTRIBUYENTE', Value: model.CORR_TIPO_CONTRIBUYENTE }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_TIPO_CONTRIBUYENTE', Value: model.CORR_TIPO_CONTRIBUYENTE },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_TIPO_CONTRIBUYENTE',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_TIPO_CONTRIBUYENTE', caption: 'Tipo contribuyente', width: 280, minWidth: 180 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_TIPO_CONTRIBUYENTE',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_CONTRIBUYENTE', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_CONTRIBUYENTE',
				label: { text: 'Nombre' },
				colSpan: 5,
				editorOptions: { placeholder: 'Nombre tipo contribuyente...', showClearButton: true, maxLength: 25 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO_TIPO_CONTRIBUYENTE', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_TIPO_CONTRIBUYENTE) {
			xWhere.push({ Parameter: 'CORR_TIPO_CONTRIBUYENTE', Value: param.CORR_TIPO_CONTRIBUYENTE });
		}
		return xWhere;
	}
}
