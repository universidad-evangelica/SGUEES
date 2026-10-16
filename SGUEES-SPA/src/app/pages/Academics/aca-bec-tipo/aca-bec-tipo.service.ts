import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AcaBecConvenioLookup, AcaBecOrigenBecaLookup, AcaBecTipo } from './models/aca-bec-tipo';
import { AcaBecTipoRepository } from './aca-bec-tipo.repository';

const ESTADOS_BECA = ['ACTIVA', 'INACTIVA', 'CERRADA', 'CANCELADA'];
const NIVELES_ACADEMICOS = ['TODOS', 'PREGRADO', 'POSGRADO', 'DOCTORADO'];

type AcaBecTipoFormOptions = {
	origenes?: AcaBecOrigenBecaLookup[];
	convenios?: AcaBecConvenioLookup[];
	onRequiereConvenioChanged?: (requiereConvenio: boolean) => void;
};

@Injectable({ providedIn: 'root' })
export class AcaBecTipoService {
	constructor(private repo: AcaBecTipoRepository) {}

	normalizar(model: AcaBecTipo): AcaBecTipo {
		const requiereConvenio = !!model.REQUIERE_CONVENIO;

		return {
			...model,
			CODIGO_BECA: `${model.CODIGO_BECA ?? ''}`.trim().toUpperCase(),
			NOMBRE_BECA: `${model.NOMBRE_BECA ?? ''}`.trim(),
			ARTICULO_REGLAMENTO: this.normalizarOpcional(model.ARTICULO_REGLAMENTO),
			UNIDAD_RESPONSABLE: this.normalizarOpcional(model.UNIDAD_RESPONSABLE),
			DESCRIPCION: this.normalizarOpcional(model.DESCRIPCION),
			ESTADO_BECA: `${model.ESTADO_BECA ?? 'ACTIVA'}`.trim().toUpperCase(),
			NIVEL_ACADEMICO_APLICA: `${model.NIVEL_ACADEMICO_APLICA ?? 'TODOS'}`.trim().toUpperCase(),
			REQUIERE_CONVENIO: requiereConvenio,
			CORR_CONVENIO: requiereConvenio ? model.CORR_CONVENIO ?? null : null,
		};
	}

	esValido(model: AcaBecTipo, msg: Function): boolean {
		model = this.normalizar(model);

		if (!model.CODIGO_BECA) {
			msg('Debe ingresar el codigo del tipo de beca.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_BECA.length > 30) {
			msg('El codigo del tipo de beca no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_BECA) {
			msg('Debe ingresar el nombre del tipo de beca.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_BECA.length > 200) {
			msg('El nombre del tipo de beca no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_ORIGEN_BECA || model.CORR_ORIGEN_BECA <= 0) {
			msg('Debe seleccionar el origen de beca.', NotifyType.Warning);
			return false;
		}

		if (model.REQUIERE_CONVENIO && (!model.CORR_CONVENIO || model.CORR_CONVENIO <= 0)) {
			msg('Debe seleccionar el convenio cuando el tipo de beca requiere convenio.', NotifyType.Warning);
			return false;
		}

		if (model.ARTICULO_REGLAMENTO && model.ARTICULO_REGLAMENTO.length > 50) {
			msg('El articulo del reglamento no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}

		const porcentaje = model.PORCENTAJE_COBERTURA_REFERENCIAL;
		if (porcentaje !== null && porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
			msg('El porcentaje de cobertura debe estar entre 0 y 100.', NotifyType.Warning);
			return false;
		}

		const cum = model.CUM_MINIMO_RENOVACION;
		if (cum !== null && cum !== undefined && (cum < 0 || cum > 10)) {
			msg('El CUM minimo de renovacion debe estar entre 0 y 10.', NotifyType.Warning);
			return false;
		}

		if (!NIVELES_ACADEMICOS.includes(model.NIVEL_ACADEMICO_APLICA)) {
			msg('El nivel academico aplicable no es valido.', NotifyType.Warning);
			return false;
		}

		if (model.UNIDAD_RESPONSABLE && model.UNIDAD_RESPONSABLE.length > 150) {
			msg('La unidad responsable no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION && model.DESCRIPCION.length > 1000) {
			msg('La descripcion del tipo de beca no puede superar 1000 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!ESTADOS_BECA.includes(model.ESTADO_BECA)) {
			msg('El estado de la beca no es valido.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_BECA', Value: param.CORR_BECA }]);
	}

	getOrigenes(): Observable<IResult> {
		return this.repo.getOrigenes();
	}

	getConvenios(): Observable<IResult> {
		return this.repo.getConvenios();
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_BECA', Value: model.CORR_BECA }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_BECA', Value: model.CORR_BECA }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_BECA', Value: model.CORR_BECA }]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_BECA', caption: 'Corr.', width: 90, dataType: 'number', filterOperations: ['=', '<', '>', '<=', '>='] },
			{ dataField: 'CODIGO_BECA', caption: 'Codigo', width: 140 },
			{ dataField: 'NOMBRE_BECA', caption: 'Tipo de beca', width: 280 },
			{ dataField: 'NOMBRE_ORIGEN', caption: 'Origen', width: 160 },
			{ dataField: 'NOMBRE_CONVENIO', caption: 'Convenio', width: 240 },
			{
				dataField: 'PORCENTAJE_COBERTURA_REFERENCIAL',
				caption: 'Cobertura ref. %',
				width: 150,
				dataType: 'number',
				format: '#,##0.##',
			},
			{ dataField: 'CANT_REQUISITOS', caption: 'Req.', width: 85, dataType: 'number' },
			{ dataField: 'CANT_DOCUMENTOS', caption: 'Docs.', width: 85, dataType: 'number' },
			{ dataField: 'CANT_FINANCIADORES', caption: 'Fin.', width: 85, dataType: 'number' },
			{ dataField: 'ESTADO_BECA', caption: 'Estado', width: 130 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_BECA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: AcaBecTipoFormOptions): any {
		const origenes = options?.origenes ?? [];
		const convenios = options?.convenios ?? [];

		const datosGeneralesItems = [
			{ dataField: 'CORR_BECA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO_BECA',
				label: { text: 'Codigo' },
				colSpan: 3,
				editorOptions: { placeholder: 'Codigo...', showClearButton: true, maxLength: 30 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_BECA',
				label: { text: 'Tipo de beca' },
				colSpan: 7,
				editorOptions: { placeholder: 'Tipo de beca...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_ORIGEN_BECA',
				label: { text: 'Origen' },
				editorType: 'dxSelectBox',
				colSpan: 5,
				editorOptions: {
					dataSource: origenes,
					valueExpr: 'CORR_ORIGEN_BECA',
					displayExpr: 'NOMBRE_ORIGEN',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Origen...',
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'ESTADO_BECA',
				label: { text: 'Estado' },
				editorType: 'dxSelectBox',
				colSpan: 3,
				editorOptions: {
					dataSource: ESTADOS_BECA,
					searchEnabled: true,
					showClearButton: false,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'PORCENTAJE_COBERTURA_REFERENCIAL',
				label: { text: 'Cobertura ref. %' },
				editorType: 'dxNumberBox',
				colSpan: 4,
				editorOptions: {
					min: 0,
					max: 100,
					format: '#,##0.##',
					showSpinButtons: true,
					showClearButton: true,
				},
			},
			{
				dataField: 'ARTICULO_REGLAMENTO',
				label: { text: 'Articulo' },
				colSpan: 3,
				editorOptions: { placeholder: 'Articulo...', showClearButton: true, maxLength: 50 },
			},
			{
				dataField: 'UNIDAD_RESPONSABLE',
				label: { text: 'Unidad responsable' },
				colSpan: 9,
				editorOptions: { placeholder: 'Unidad responsable...', showClearButton: true, maxLength: 150 },
			},
			{
				dataField: 'DESCRIPCION',
				label: { text: 'Descripcion' },
				editorType: 'dxTextArea',
				colSpan: 12,
				editorOptions: { placeholder: 'Descripcion...', maxLength: 1000, minHeight: 90 },
			},
		];

		const convenioItems = [
			{
				dataField: 'REQUIERE_CONVENIO',
				label: { text: 'Requiere convenio' },
				editorType: 'dxCheckBox',
				colSpan: 3,
				editorOptions: {
					onValueChanged: (e: any) => options?.onRequiereConvenioChanged?.(!!e.value),
				},
			},
			{
				dataField: 'CORR_CONVENIO',
				label: { text: 'Convenio' },
				editorType: 'dxSelectBox',
				colSpan: 9,
				editorOptions: {
					dataSource: convenios,
					valueExpr: 'CORR_CONVENIO',
					displayExpr: 'NOMBRE_CONVENIO',
					searchEnabled: true,
					showClearButton: true,
					placeholder: 'Convenio...',
				},
			},
		];

		const reglasItems = [
			{
				dataField: 'CUM_MINIMO_RENOVACION',
				label: { text: 'CUM minimo renovacion' },
				editorType: 'dxNumberBox',
				colSpan: 4,
				editorOptions: {
					min: 0,
					max: 10,
					format: '#,##0.##',
					showSpinButtons: true,
					showClearButton: true,
				},
			},
			{
				dataField: 'NIVEL_ACADEMICO_APLICA',
				label: { text: 'Nivel academico' },
				editorType: 'dxSelectBox',
				colSpan: 4,
				editorOptions: {
					dataSource: NIVELES_ACADEMICOS,
					searchEnabled: true,
					showClearButton: false,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				itemType: 'empty',
				colSpan: 4,
			},
			{
				itemType: 'group',
				caption: 'Aplicabilidad',
				colCount: 4,
				colSpan: 12,
				items: [
					{
						dataField: 'APLICA_NUEVO_INGRESO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						editorOptions: { text: 'Nuevo ingreso' },
					},
					{
						dataField: 'APLICA_ANTIGUO_INGRESO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						editorOptions: { text: 'Antiguo ingreso' },
					},
					{
						dataField: 'APLICA_EMPLEADO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						editorOptions: { text: 'Empleado' },
					},
					{
						dataField: 'APLICA_HIJO_EMPLEADO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						editorOptions: { text: 'Hijo empleado' },
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Requisitos y aprobaciones',
				colCount: 3,
				colSpan: 12,
				items: [
					{
						dataField: 'REQUIERE_ESTUDIO_SOCIOECONOMICO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						editorOptions: { text: 'Estudio socioeconomico' },
					},
					{
						dataField: 'REQUIERE_APROBACION_COMITE',
						label: { visible: false },
						editorType: 'dxCheckBox',
						editorOptions: { text: 'Aprobacion comite' },
					},
					{
						dataField: 'REQUIERE_APROBACION_DIRECTORIO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						editorOptions: { text: 'Aprobacion directorio' },
					},
				],
			},
		];

		return [
			{
				itemType: 'group',
				caption: 'Datos generales',
				colCount: 12,
				colSpan: 8,
				items: datosGeneralesItems,
			},
			{
				itemType: 'group',
				caption: 'Convenio',
				colCount: 12,
				colSpan: 8,
				items: convenioItems,
			},
			{
				itemType: 'group',
				caption: 'Reglas',
				colCount: 12,
				colSpan: 8,
				items: reglasItems,
			},
		];
	}

	private normalizarOpcional(value: string | null | undefined): string | null {
		const normalizado = `${value ?? ''}`.trim();
		return normalizado ? normalizado : null;
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_BECA) {
			xWhere.push({ Parameter: 'CORR_BECA', Value: param.CORR_BECA });
		}

		return xWhere;
	}
}
