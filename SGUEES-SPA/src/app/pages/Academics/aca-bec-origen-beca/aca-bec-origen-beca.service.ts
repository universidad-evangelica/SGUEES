import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaBecOrigenBeca } from './models/aca-bec-origen-beca';
import { AcaBecOrigenBecaRepository } from './aca-bec-origen-beca.repository';

const ESTADO_FIELD = 'ACTIVO';
const NOMBRES_POR_CODIGO_ORIGEN_BECA: Record<string, string> = {
	INTERNA: 'Beca interna',
	EXTERNA: 'Beca externa',
	MIXTA: 'Beca mixta',
};
const CODIGOS_ORIGEN_BECA = Object.keys(NOMBRES_POR_CODIGO_ORIGEN_BECA);

type AcaBecOrigenBecaFormOptions = {
	onCodigoOrigenChanged?: (codigoOrigen: string) => void;
};

@Injectable({ providedIn: 'root' })
export class AcaBecOrigenBecaService {
	constructor(private repo: AcaBecOrigenBecaRepository) {}

	getNombreOrigenPorCodigo(codigoOrigen: string | null | undefined): string | null {
		const codigo = `${codigoOrigen ?? ''}`.trim().toUpperCase();
		return NOMBRES_POR_CODIGO_ORIGEN_BECA[codigo] ?? null;
	}

	normalizarCodigoNombre(model: AcaBecOrigenBeca): AcaBecOrigenBeca {
		const codigo = `${model.CODIGO_ORIGEN ?? ''}`.trim().toUpperCase();
		const nombreAmarrado = this.getNombreOrigenPorCodigo(codigo);

		return {
			...model,
			CODIGO_ORIGEN: codigo,
			NOMBRE_ORIGEN: nombreAmarrado ?? `${model.NOMBRE_ORIGEN ?? ''}`.trim(),
			DESCRIPCION: `${model.DESCRIPCION ?? ''}`.trim(),
		};
	}

	esValido(model: AcaBecOrigenBeca, msg: Function): boolean {
		model = this.normalizarCodigoNombre(model);

		if (!model.CODIGO_ORIGEN || model.CODIGO_ORIGEN.trim() === '') {
			msg('Debe ingresar el codigo del origen de beca.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_ORIGEN.trim().length > 20) {
			msg('El codigo del origen de beca no puede superar 20 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_ORIGEN || model.NOMBRE_ORIGEN.trim() === '') {
			msg('Debe ingresar el nombre del origen de beca.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_ORIGEN.trim().length > 100) {
			msg('El nombre del origen de beca no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION && model.DESCRIPCION.trim().length > 300) {
			msg('La descripcion del origen de beca no puede superar 300 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_ORIGEN_BECA', Value: param.CORR_ORIGEN_BECA }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_ORIGEN_BECA', Value: model.CORR_ORIGEN_BECA }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_ORIGEN_BECA', Value: model.CORR_ORIGEN_BECA }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_ORIGEN_BECA', Value: model.CORR_ORIGEN_BECA }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_ORIGEN_BECA',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_ORIGEN', caption: 'Codigo', width: 140 },
			{ dataField: 'NOMBRE_ORIGEN', caption: 'Origen beca', width: 260 },
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 320 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_ORIGEN_BECA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: AcaBecOrigenBecaFormOptions): any {
		return [
			{ dataField: 'CORR_ORIGEN_BECA', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO_ORIGEN',
				label: { text: 'Codigo' },
				editorType: 'dxSelectBox',
				colSpan: 2,
				editorOptions: {
					dataSource: CODIGOS_ORIGEN_BECA,
					acceptCustomValue: true,
					searchEnabled: true,
					showClearButton: true,
					maxLength: 20,
					placeholder: 'Codigo...',
					onCustomItemCreating: (e: any) => {
						e.customItem = `${e.text ?? ''}`.trim().toUpperCase();
					},
					onValueChanged: (e: any) => {
						options?.onCodigoOrigenChanged?.(e.value);
					},
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_ORIGEN',
				label: { text: 'Origen beca' },
				colSpan: 5,
				editorOptions: { placeholder: 'Origen beca...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				editorType: 'dxTextArea',
				colSpan: 8,
				editorOptions: { placeholder: 'Descripcion...', maxLength: 300, minHeight: 300 },
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_ORIGEN_BECA) {
			xWhere.push({ Parameter: 'CORR_ORIGEN_BECA', Value: param.CORR_ORIGEN_BECA });
		}

		return xWhere;
	}
}
