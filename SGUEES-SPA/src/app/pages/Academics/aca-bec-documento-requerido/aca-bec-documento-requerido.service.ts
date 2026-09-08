import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaBecDocumentoRequerido, AcaBecTipoLookup } from './models/aca-bec-documento-requerido';
import { AcaBecDocumentoRequeridoRepository } from './aca-bec-documento-requerido.repository';

const ESTADO_FIELD = 'ACTIVO';

type AcaBecDocumentoRequeridoFormOptions = {
	tiposBeca?: AcaBecTipoLookup[];
};

@Injectable({ providedIn: 'root' })
export class AcaBecDocumentoRequeridoService {
	readonly areasReceptoras = ['BECAS', 'CONTRAPARTE', 'FINANZAS', 'REGISTRO', 'TALENTO_HUMANO'];

	constructor(private repo: AcaBecDocumentoRequeridoRepository) {}

	normalizar(model: AcaBecDocumentoRequerido): AcaBecDocumentoRequerido {
		return {
			...model,
			NOMBRE_DOCUMENTO: `${model.NOMBRE_DOCUMENTO ?? ''}`.trim(),
			AREA_RECEPTORA: `${model.AREA_RECEPTORA ?? ''}`.trim().toUpperCase(),
			OBLIGATORIO: model.OBLIGATORIO ?? true,
			ACTIVO: model.ACTIVO ?? true,
		};
	}

	esValido(model: AcaBecDocumentoRequerido, msg: Function): boolean {
		model = this.normalizar(model);

		if (!model.CORR_BECA || model.CORR_BECA <= 0) {
			msg('Debe seleccionar el tipo de beca.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_DOCUMENTO) {
			msg('Debe ingresar el nombre del documento requerido.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_DOCUMENTO.length > 200) {
			msg('El nombre del documento requerido no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.AREA_RECEPTORA) {
			msg('Debe seleccionar o ingresar el area receptora.', NotifyType.Warning);
			return false;
		}

		if (model.AREA_RECEPTORA.length > 40) {
			msg('El area receptora no puede superar 40 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_BECA_DOCUMENTO_REQUERIDO', Value: param.CORR_BECA_DOCUMENTO_REQUERIDO }]);
	}

	getTiposBeca(): Observable<IResult> {
		return this.repo.getTiposBeca();
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_BECA_DOCUMENTO_REQUERIDO', Value: model.CORR_BECA_DOCUMENTO_REQUERIDO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_BECA_DOCUMENTO_REQUERIDO', Value: model.CORR_BECA_DOCUMENTO_REQUERIDO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_BECA_DOCUMENTO_REQUERIDO', Value: model.CORR_BECA_DOCUMENTO_REQUERIDO }]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_BECA_DOCUMENTO_REQUERIDO', caption: 'Corr.', width: 90, dataType: 'number', filterOperations: ['=', '<', '>', '<=', '>='] },
			{ dataField: 'NOMBRE_BECA', caption: 'Tipo de beca', width: 280 },
			{ dataField: 'NOMBRE_DOCUMENTO', caption: 'Documento requerido', minWidth: 360 },
			{ dataField: 'AREA_RECEPTORA', caption: 'Area receptora', width: 160 },
			{ dataField: 'OBLIGATORIO', caption: 'Obligatorio', width: 120, dataType: 'boolean' },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_BECA_DOCUMENTO_REQUERIDO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: AcaBecDocumentoRequeridoFormOptions): any {
		const tiposBeca = options?.tiposBeca ?? [];

		return [
			{
				itemType: 'group',
				caption: 'Datos generales',
				colCount: 12,
				colSpan: 8,
				items: [
					{ dataField: 'CORR_BECA_DOCUMENTO_REQUERIDO', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
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
						dataField: 'NOMBRE_DOCUMENTO',
						label: { text: 'Documento requerido' },
						colSpan: 8,
						editorOptions: { placeholder: 'Documento requerido...', showClearButton: true, maxLength: 200 },
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
					},
					{
						dataField: 'AREA_RECEPTORA',
						label: { text: 'Area receptora' },
						editorType: 'dxSelectBox',
						colSpan: 4,
						editorOptions: {
							dataSource: this.areasReceptoras,
							acceptCustomValue: true,
							searchEnabled: true,
							showClearButton: true,
							placeholder: 'Area receptora...',
							maxLength: 40,
						},
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
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
						dataField: 'OBLIGATORIO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						colSpan: 4,
						editorOptions: { text: 'Obligatorio' },
					},
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

		if (param.CORR_BECA_DOCUMENTO_REQUERIDO) {
			xWhere.push({ Parameter: 'CORR_BECA_DOCUMENTO_REQUERIDO', Value: param.CORR_BECA_DOCUMENTO_REQUERIDO });
		}

		if (param.CORR_BECA) {
			xWhere.push({ Parameter: 'CORR_BECA', Value: param.CORR_BECA });
		}

		return xWhere;
	}
}
