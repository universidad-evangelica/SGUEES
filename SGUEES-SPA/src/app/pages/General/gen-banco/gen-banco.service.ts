import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

import { GenBancoRepository } from './gen-banco.repository';
import { GenBanco } from './models/gen-banco';

const ESTADO_FIELD = 'ESTADO_BANCO';

@Injectable({
	providedIn: 'root',
})
export class GenBancoService {
	constructor(private repo: GenBancoRepository) {}

	esValido(model: GenBanco, msg: Function): boolean {
		if (!model.NOMBRE_BANCO?.trim()) {
			msg('Debe digitar el nombre del banco.', NotifyType.Warning);
			return false;
		}

		if (!model.CLASE_BANCO?.trim()) {
			msg('Debe seleccionar la clase de banco.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_BANCO', Value: param.CORR_BANCO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_BANCO', Value: param.CORR_BANCO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_BANCO', Value: model.CORR_BANCO }];
		return this.repo.update(model, xWhere);
	}

	delete(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_BANCO', Value: param.CORR_BANCO }];
		return this.repo.delete(xWhere);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_BANCO', Value: model.CORR_BANCO },
		]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_BANCO', caption: 'Corr.', width: 85 },
			{ dataField: 'NOMBRE_BANCO', caption: 'Nombre Banco', width: 300 },
			{ dataField: 'NOMBRE_BANCO_CORTO', caption: 'Nombre Corto', width: 150 },
			{ dataField: 'NOMBRE_CLASE_BANCO', caption: 'Clase Banco', width: 200 },
			{ dataField: 'CODIGO_TRANSACION_UNI', caption: 'Código Transacción Uni', width: 250 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns(),
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_BANCO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_BANCO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_BANCO',
				label: { text: 'Nombre Banco' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Banco...', showClearButton: true, maxLength: 60 },
				validationRules: [{ type: 'required', message: 'El nombre del banco es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_BANCO_CORTO',
				label: { text: 'Nombre Banco Corto' },
				colSpan: 2,
				editorOptions: { placeholder: 'Nombre Banco Corto...', showClearButton: true, maxLength: 60 },
			},
			{
				dataField: 'CLASE_BANCO',
				label: { text: 'Clase Banco' },
				colSpan: 2,
				template: 'CLASE_BANCOLookup',
			},
			{
				dataField: 'CODIGO_TRANSACION_UNI',
				label: { text: 'Código Transacción Uni' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 5 },
			},
			{ dataField: 'ESTADO_BANCO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}
}
