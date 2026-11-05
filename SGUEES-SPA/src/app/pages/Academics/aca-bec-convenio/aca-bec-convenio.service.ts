import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { AcaBecEntidadFinanciadoraLookup, AcaBecConvenio } from './models/aca-bec-convenio';
import { AcaBecConvenioRepository } from './aca-bec-convenio.repository';

export const ESTADOS_CONVENIO = ['VIGENTE', 'VENCIDO', 'SUSPENDIDO', 'CERRADO'];
const ESTADO_ACTIVO = 'VIGENTE';
const ESTADO_INACTIVO = 'CERRADO';

@Injectable({ providedIn: 'root' })
export class AcaBecConvenioService {
	constructor(private repo: AcaBecConvenioRepository) {}

	normalizar(model: AcaBecConvenio): AcaBecConvenio {
		return {
			...model,
			CODIGO_CONVENIO: `${model.CODIGO_CONVENIO ?? ''}`.trim().toUpperCase(),
			NOMBRE_CONVENIO: `${model.NOMBRE_CONVENIO ?? ''}`.trim(),
			CORR_ENTIDAD_FINANCIADORA: Number(model.CORR_ENTIDAD_FINANCIADORA ?? 0),
			FECHA_FIN: model.FECHA_FIN || null,
			DESCRIPCION: this.normalizarOpcional(model.DESCRIPCION),
			ESTADO_CONVENIO: `${model.ESTADO_CONVENIO ?? ESTADO_ACTIVO}`.trim().toUpperCase(),
			ACTIVO: this.esConvenioVigente(model),
		};
	}

	esValido(model: AcaBecConvenio, msg: Function): boolean {
		model = this.normalizar(model);

		if (!model.CODIGO_CONVENIO) {
			msg('Debe ingresar el codigo del convenio.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_CONVENIO.length > 50) {
			msg('El codigo del convenio no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_CONVENIO) {
			msg('Debe ingresar el nombre del convenio.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_CONVENIO.length > 200) {
			msg('El nombre del convenio no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_ENTIDAD_FINANCIADORA) {
			msg('Debe seleccionar la entidad financiadora.', NotifyType.Warning);
			return false;
		}

		if (!model.FECHA_INICIO) {
			msg('Debe ingresar la fecha de inicio del convenio.', NotifyType.Warning);
			return false;
		}

		if (model.FECHA_FIN && new Date(model.FECHA_FIN).getTime() < new Date(model.FECHA_INICIO).getTime()) {
			msg('La fecha fin no puede ser menor que la fecha de inicio.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION && model.DESCRIPCION.length > 1000) {
			msg('La descripcion no puede superar 1000 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!ESTADOS_CONVENIO.includes(model.ESTADO_CONVENIO)) {
			msg('El estado del convenio no es valido.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_CONVENIO', Value: param.CORR_CONVENIO }]);
	}

	getEntidadesFinanciadoras(): Observable<IResult> {
		return this.repo.getEntidadesFinanciadoras();
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_CONVENIO', Value: model.CORR_CONVENIO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_CONVENIO', Value: model.CORR_CONVENIO }, { Parameter: 'VERSION_REGISTRO', Value: model.VERSION_REGISTRO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_CONVENIO', Value: model.CORR_CONVENIO }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_CONVENIO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_CONVENIO', caption: 'Codigo', width: 150 },
			{ dataField: 'NOMBRE_CONVENIO', caption: 'Convenio', minWidth: 300 },
			{ dataField: 'NOMBRE_ENTIDAD', caption: 'Entidad financiadora', width: 280 },
			{ dataField: 'FECHA_INICIO', caption: 'Inicio', width: 120, dataType: 'date', format: 'dd/MM/yyyy' },
			{ dataField: 'FECHA_FIN', caption: 'Fin', width: 120, dataType: 'date', format: 'dd/MM/yyyy' },
			{
				dataField: 'ESTADO_CONVENIO',
				caption: 'Estado',
				width: 130,
				cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					const badge = document.createElement('span');
					const vigente = cellInfo.value === ESTADO_ACTIVO;
					badge.classList.add('estado-badge', vigente ? 'estado-badge--activo' : 'estado-badge--inactivo');
					badge.textContent = cellInfo.value ?? '';
					cellElement.innerHTML = '';
					cellElement.appendChild(badge);
				},
			},
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_CONVENIO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(entidades: AcaBecEntidadFinanciadoraLookup[] = []): any {
		return [
			{ itemType: 'group', colCount: 4, colCountByScreen: { xs: 1, sm: 2, md: 4, lg: 4 }, items: [
				{ dataField: 'CORR_CONVENIO', label: { text: 'Corr.' }, editorOptions: { readOnly: true, width: '100%' } },
				{ dataField: 'CODIGO_CONVENIO', label: { text: 'Codigo del convenio' }, colSpan: 2,
					editorOptions: { width: '100%', showClearButton: true, maxLength: 50, placeholder: 'Ej.: CONV-ELIM-2027' },
					validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }] },
				{ dataField: 'ESTADO_CONVENIO', label: { text: 'Estado' }, editorType: 'dxSelectBox',
					editorOptions: { width: '100%', dataSource: ESTADOS_CONVENIO, searchEnabled: true },
					validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }] },
			] },
			{ dataField: 'NOMBRE_CONVENIO', label: { text: 'Nombre del convenio' },
				editorOptions: { width: '100%', showClearButton: true, maxLength: 200, placeholder: 'Ej.: Convenio de becas Elim 2027' },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }] },
			{ dataField: 'CORR_ENTIDAD_FINANCIADORA', label: { text: 'Iglesia o institucion' }, editorType: 'dxSelectBox',
				editorOptions: { width: '100%', dataSource: entidades, valueExpr: 'CORR_ENTIDAD_FINANCIADORA',
					displayExpr: 'NOMBRE_ENTIDAD', searchEnabled: true, showClearButton: true,
					placeholder: 'Seleccione la iglesia o institucion' },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }] },
			{ itemType: 'group', colCount: 2, colCountByScreen: { xs: 1, sm: 2, md: 2, lg: 2 }, items: [
				{ dataField: 'FECHA_INICIO', label: { text: 'Fecha inicio' }, editorType: 'dxDateBox',
					editorOptions: { width: '100%', displayFormat: 'dd/MM/yyyy', type: 'date', showClearButton: true },
					validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }] },
				{ dataField: 'FECHA_FIN', label: { text: 'Fecha fin' }, editorType: 'dxDateBox',
					editorOptions: { width: '100%', displayFormat: 'dd/MM/yyyy', type: 'date', showClearButton: true } },
			] },
			{ dataField: 'DESCRIPCION', label: { text: 'Descripcion' }, editorType: 'dxTextArea',
				editorOptions: { width: '100%', maxLength: 1000, minHeight: 160, autoResizeEnabled: true } },
		];
	}

	esConvenioVigente(model: any): boolean {
		return `${model?.ESTADO_CONVENIO ?? ''}`.trim().toUpperCase() === ESTADO_ACTIVO;
	}

	estadoInactivo(): string {
		return ESTADO_INACTIVO;
	}

	private normalizarOpcional(value: string | null | undefined): string | null {
		const normalizado = `${value ?? ''}`.trim();
		return normalizado ? normalizado : null;
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_CONVENIO) {
			xWhere.push({ Parameter: 'CORR_CONVENIO', Value: param.CORR_CONVENIO });
		}

		return xWhere;
	}
}
