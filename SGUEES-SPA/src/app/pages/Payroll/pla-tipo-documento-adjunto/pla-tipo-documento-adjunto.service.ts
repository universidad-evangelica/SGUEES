import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { PlaTipoDocumentoAdjunto } from './models/pla-tipo-documento-adjunto';
import { PlaTipoDocumentoAdjuntoRepository } from './pla-tipo-documento-adjunto.repository';

@Injectable({ providedIn: 'root' })
export class PlaTipoDocumentoAdjuntoService {
	constructor(private repo: PlaTipoDocumentoAdjuntoRepository) {}

	esValido(model: PlaTipoDocumentoAdjunto, msg: Function): boolean {
		if (!model.TIPO_DOCUMENTO || model.TIPO_DOCUMENTO.trim() === '') {
			msg('Debe ingresar el tipo de documento.', NotifyType.Warning);
			return false;
		}

		if (model.TIPO_DOCUMENTO.trim().length > 250) {
			msg('El tipo de documento no puede superar 250 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION_DOCUMENTO && model.DESCRIPCION_DOCUMENTO.trim().length > 500) {
			msg('La descripción del documento no puede superar 500 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_TIPO_DOCUMENTO_ADJUNTO', Value: param.CORR_TIPO_DOCUMENTO_ADJUNTO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_TIPO_DOCUMENTO_ADJUNTO', Value: model.CORR_TIPO_DOCUMENTO_ADJUNTO },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_TIPO_DOCUMENTO_ADJUNTO', Value: model.CORR_TIPO_DOCUMENTO_ADJUNTO }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_TIPO_DOCUMENTO_ADJUNTO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'TIPO_DOCUMENTO', caption: 'Tipo Documento', width: 280 },
			{ dataField: 'DESCRIPCION_DOCUMENTO', caption: 'Descripción del documento', width: 350 },
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_TIPO_DOCUMENTO_ADJUNTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'CORR_TIPO_DOCUMENTO_ADJUNTO',
				label: { text: 'Corr.' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'TIPO_DOCUMENTO',
				label: { text: 'Tipo Documento' },
				colSpan: 3,
				editorOptions: { placeholder: 'Tipo Documento...', showClearButton: true, maxLength: 250 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'DESCRIPCION_DOCUMENTO',
				label: { text: 'Descripción del documento' },
				colSpan: 4,
				editorOptions: { placeholder: 'Descripción del documento...', showClearButton: true, maxLength: 500 },
			},
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_TIPO_DOCUMENTO_ADJUNTO) {
			xWhere.push({ Parameter: 'CORR_TIPO_DOCUMENTO_ADJUNTO', Value: param.CORR_TIPO_DOCUMENTO_ADJUNTO });
		}

		return xWhere;
	}
}
