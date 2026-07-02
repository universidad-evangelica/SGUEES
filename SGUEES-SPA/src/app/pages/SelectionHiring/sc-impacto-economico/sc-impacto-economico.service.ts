import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
<<<<<<< Updated upstream
import { buildRemoteGridWhere, createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';
=======
import { buildEstadoColumn } from 'src/app/shared/mtto/mtto-grid.helpers';
>>>>>>> Stashed changes
import { ScImpactoEconomico } from './models/sc-impacto-economico';
import { ScImpactoEconomicoRepository } from './sc-impacto-economico.repository';

const ESTADO_FIELD = 'ESTADO_IMPACTO_ECONOMICO';

@Injectable({ providedIn: 'root' })
export class ScImpactoEconomicoService {
	constructor(private repo: ScImpactoEconomicoRepository) {}

	esValido(model: ScImpactoEconomico, msg: Function): boolean {
		if (!model.DESCRIPCION || model.DESCRIPCION.trim() === '') {
			msg('Debe ingresar la descripcion del impacto economico.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION.trim().length > 150) {
			msg('La descripcion del impacto economico no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	getDistinctValues(param: any): Observable<IResult> {
		return this.repo.getDistinctValues(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: param.CORR_IMPACTO_ECONOMICO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	activar(model: any): Observable<IResult> {
		return this.repo.activar(model, [{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	desactivar(model: any): Observable<IResult> {
		return this.repo.desactivar(model, [{ Parameter: 'CORR_IMPACTO_ECONOMICO', Value: model.CORR_IMPACTO_ECONOMICO }]);
	}

	getColumns(): any[] {
		return [
<<<<<<< Updated upstream
			{
				type: 'buttons',
				name: 'btnAcciones',
				caption: 'Options',
				width: 150,
				minWidth: 150,
				allowResizing: false,
				fixed: true,
				fixedPosition: 'left',
				alignment: 'center',
				buttons: [
					{ hint: editHint, icon: 'edit', stylingMode: 'text', cssClass: editCssClass, onClick: editClick },
					{ hint: deleteHint, icon: 'trash', stylingMode: 'text', cssClass: deleteCssClass, onClick: deleteClick },
					{
						hint: activarHint,
						icon: 'refresh',
						stylingMode: 'text',
						cssClass: activateCssClass,
						visible: (event: any) => !event.row?.data?.ESTADO_IMPACTO_ECONOMICO,
						onClick: activarClick,
					},
					{
						hint: desactivarHint,
						icon: 'close',
						stylingMode: 'text',
						cssClass: deactivateCssClass,
						visible: (event: any) => !!event.row?.data?.ESTADO_IMPACTO_ECONOMICO,
						onClick: desactivarClick,
					},
				],
			},
			{
				dataField: 'CORR_IMPACTO_ECONOMICO',
				caption: 'Corr.',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 300 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
=======
			{ dataField: 'CORR_IMPACTO_ECONOMICO', caption: 'Corr.', width: 100 },
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 300 },
			buildEstadoColumn('ESTADO_IMPACTO_ECONOMICO'),
>>>>>>> Stashed changes
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 200 },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 200 },
			{
				dataField: 'FECHA_CREA',
				caption: 'Fecha Crea',
				width: 200,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_CREA'),
			},
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 200 },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 200 },
			{
				dataField: 'FECHA_ACTU',
				caption: 'Fecha Actu',
				width: 200,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_ACTU'),
			},
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_IMPACTO_ECONOMICO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_IMPACTO_ECONOMICO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				colSpan: 5,
				editorType: 'dxTextBox',
				editorOptions: { placeholder: 'Descripcion impacto economico...', showClearButton: true, maxLength: 150 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ESTADO_IMPACTO_ECONOMICO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		return buildRemoteGridWhere(param, ESTADO_FIELD);
	}
}
