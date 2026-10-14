import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaBecEntidadFinanciadoraLookup, AcaBecFinanciador, AcaBecTipoLookup } from './models/aca-bec-financiador';
import { AcaBecFinanciadorRepository } from './aca-bec-financiador.repository';

const ESTADO_FIELD = 'ACTIVO';

type AcaBecFinanciadorFormOptions = {
	tiposBeca?: AcaBecTipoLookup[];
	entidadesFinanciadoras?: AcaBecEntidadFinanciadoraLookup[];
};

@Injectable({ providedIn: 'root' })
export class AcaBecFinanciadorService {
	readonly conceptosCobertura = ['ARANCELES', 'ARANCELES_CONVENIO', 'CUOTA_MINIMA', 'SEGUN_CONVENIO'];

	constructor(private repo: AcaBecFinanciadorRepository) {}

	normalizar(model: AcaBecFinanciador): AcaBecFinanciador {
		return {
			...model,
			CONCEPTO_COBERTURA: `${model.CONCEPTO_COBERTURA ?? ''}`.trim().toUpperCase(),
			PORCENTAJE_COBERTURA: Number(model.PORCENTAJE_COBERTURA ?? 0),
			MONTO_MAXIMO: model.MONTO_MAXIMO === undefined || model.MONTO_MAXIMO === null ? null : Number(model.MONTO_MAXIMO),
			ACTIVO: model.ACTIVO ?? true,
		};
	}

	esValido(model: AcaBecFinanciador, msg: Function): boolean {
		model = this.normalizar(model);

		if (!model.CORR_BECA || model.CORR_BECA <= 0) {
			msg('Debe seleccionar el tipo de beca.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_ENTIDAD_FINANCIADORA || model.CORR_ENTIDAD_FINANCIADORA <= 0) {
			msg('Debe seleccionar la entidad financiadora.', NotifyType.Warning);
			return false;
		}

		if (!model.CONCEPTO_COBERTURA) {
			msg('Debe ingresar el concepto de cobertura.', NotifyType.Warning);
			return false;
		}

		if (model.CONCEPTO_COBERTURA.length > 50) {
			msg('El concepto de cobertura no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.PORCENTAJE_COBERTURA < 0 || model.PORCENTAJE_COBERTURA > 100) {
			msg('El porcentaje de cobertura debe estar entre 0 y 100.', NotifyType.Warning);
			return false;
		}

		if (model.MONTO_MAXIMO !== null && model.MONTO_MAXIMO !== undefined && model.MONTO_MAXIMO < 0) {
			msg('El monto maximo no puede ser negativo.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_BECA_FINANCIADOR', Value: param.CORR_BECA_FINANCIADOR }]);
	}

	getTiposBeca(): Observable<IResult> {
		return this.repo.getTiposBeca();
	}

	getEntidadesFinanciadoras(): Observable<IResult> {
		return this.repo.getEntidadesFinanciadoras();
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_BECA_FINANCIADOR', Value: model.CORR_BECA_FINANCIADOR }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_BECA_FINANCIADOR', Value: model.CORR_BECA_FINANCIADOR }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_BECA_FINANCIADOR', Value: model.CORR_BECA_FINANCIADOR }]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_BECA_FINANCIADOR', caption: 'Corr.', width: 90, dataType: 'number', filterOperations: ['=', '<', '>', '<=', '>='] },
			{ dataField: 'NOMBRE_BECA', caption: 'Tipo de beca', minWidth: 280 },
			{ dataField: 'NOMBRE_ENTIDAD', caption: 'Entidad financiadora', minWidth: 280 },
			{ dataField: 'CONCEPTO_COBERTURA', caption: 'Concepto', width: 180 },
			{ dataField: 'PORCENTAJE_COBERTURA', caption: 'Cobertura %', width: 130, dataType: 'number', format: '#,##0.##' },
			{ dataField: 'MONTO_MAXIMO', caption: 'Monto maximo', width: 140, dataType: 'number', format: '#,##0.00' },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_BECA_FINANCIADOR',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: AcaBecFinanciadorFormOptions): any {
		const tiposBeca = options?.tiposBeca ?? [];
		const entidadesFinanciadoras = options?.entidadesFinanciadoras ?? [];

		return [
			{
				itemType: 'group',
				caption: 'Datos generales',
				colCount: 12,
				colSpan: 8,
				items: [
					{ dataField: 'CORR_BECA_FINANCIADOR', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
					{
						dataField: 'CORR_BECA',
						label: { text: 'Tipo de beca' },
						editorType: 'dxSelectBox',
						colSpan: 10,
						editorOptions: {
							dataSource: tiposBeca,
							valueExpr: 'CORR_BECA',
							displayExpr: 'NOMBRE_BECA',
							searchEnabled: true,
							showClearButton: true,
							placeholder: 'Tipo de beca...',
						},
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
					},
					{
						dataField: 'CORR_ENTIDAD_FINANCIADORA',
						label: { text: 'Entidad financiadora' },
						editorType: 'dxSelectBox',
						colSpan: 12,
						editorOptions: {
							dataSource: entidadesFinanciadoras,
							valueExpr: 'CORR_ENTIDAD_FINANCIADORA',
							displayExpr: 'NOMBRE_ENTIDAD',
							searchEnabled: true,
							showClearButton: true,
							placeholder: 'Entidad financiadora...',
						},
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Cobertura',
				colCount: 12,
				colSpan: 8,
				items: [
					{
						dataField: 'CONCEPTO_COBERTURA',
						label: { text: 'Concepto cobertura' },
						editorType: 'dxSelectBox',
						colSpan: 6,
						editorOptions: {
							dataSource: this.conceptosCobertura,
							acceptCustomValue: true,
							searchEnabled: true,
							showClearButton: true,
							placeholder: 'Concepto...',
							maxLength: 50,
						},
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
					},
					{
						dataField: 'PORCENTAJE_COBERTURA',
						label: { text: 'Cobertura %' },
						editorType: 'dxNumberBox',
						colSpan: 3,
						editorOptions: {
							min: 0,
							max: 100,
							format: '#,##0.##',
							showSpinButtons: true,
							placeholder: '0.00',
						},
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
					},
					{
						dataField: 'MONTO_MAXIMO',
						label: { text: 'Monto maximo' },
						editorType: 'dxNumberBox',
						colSpan: 3,
						editorOptions: {
							min: 0,
							format: '#,##0.00',
							showSpinButtons: true,
							showClearButton: true,
							placeholder: 'Sin limite',
						},
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Configuracion',
				colCount: 12,
				colSpan: 8,
				items: [
					{
						dataField: 'ACTIVO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						colSpan: 4,
						editorOptions: { text: 'Activo' },
					},
				],
			},
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_BECA_FINANCIADOR) {
			xWhere.push({ Parameter: 'CORR_BECA_FINANCIADOR', Value: param.CORR_BECA_FINANCIADOR });
		}

		if (param.CORR_BECA) {
			xWhere.push({ Parameter: 'CORR_BECA', Value: param.CORR_BECA });
		}

		if (param.CORR_ENTIDAD_FINANCIADORA) {
			xWhere.push({ Parameter: 'CORR_ENTIDAD_FINANCIADORA', Value: param.CORR_ENTIDAD_FINANCIADORA });
		}

		return xWhere;
	}
}
