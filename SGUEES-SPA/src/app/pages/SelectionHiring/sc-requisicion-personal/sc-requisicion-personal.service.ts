import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ScRequisicionPersonalRepository } from './sc-requisicion-personal.repository';
import { ScRequisicionPersonal } from './models/sc-requisicion-personal';

@Injectable({
	providedIn: 'root',
})
export class ScRequisicionPersonalService {
    constructor(private repo: ScRequisicionPersonalRepository) {}

    //#region <Validadores>
    esValido(model: ScRequisicionPersonal, msg: Function): boolean {
        // if (model.NOMBRE_ROL == '') {
        // msg('Debe digitar el nombre del Rol', NotifyType.Error)
        // return false;
        // }

        return true;
    }
    // #endregion

    // Convierte a yyyy-MM-dd sin desfase por zona horaria (UTC vs local).
    private formatearDateOnly(fecha: Date | string | null): string | null {

        if (!fecha) {
            return null;
        }

        // String ISO o yyyy-MM-dd: usar la parte de fecha tal cual, sin new Date() (evita restar 1 día en UTC-6).
        if (typeof fecha === 'string') {
            const soloFecha = fecha.split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
                return soloFecha;
            }
        }

        const date = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(date.getTime())) {
            return null;
        }

        // Componentes en hora local (fecha elegida en el calendario).
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: param.CORR_REQUISICION_PERSONAL }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: param.CORR_REQUISICION_PERSONAL }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {

        const modelToInsert = {
            ...model,
            FECHA_REQUISICION: this.formatearDateOnly(model.FECHA_REQUISICION),
            FECHA_APROBACION: this.formatearDateOnly(model.FECHA_APROBACION),
            FECHA_CIERRE: this.formatearDateOnly(model.FECHA_CIERRE),
        };

		return this.repo.create(modelToInsert);
	}

	update(model: any): Observable<IResult> {
        const modelToUpdate = {
            ...model,
            FECHA_REQUISICION: this.formatearDateOnly(model.FECHA_REQUISICION),
            FECHA_APROBACION: this.formatearDateOnly(model.FECHA_APROBACION),
            FECHA_CIERRE: this.formatearDateOnly(model.FECHA_CIERRE),
        };

		let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: model.CORR_REQUISICION_PERSONAL }];

		return this.repo.update(modelToUpdate, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: model.CORR_REQUISICION_PERSONAL }];

		return this.repo.delete(xWhere);
	}



    getColumns(): any {
        return [
            { dataField: 'CORR_REQUISICION_PERSONAL', caption: 'Corr.', width: 85 },
            { dataField: 'FECHA_REQUISICION', caption: 'Fecha', width: 130, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'CORR_DEPARTAMENTO', caption: 'Departamento', width: 130 },
            { dataField: 'CANTIDAD_PLAZAS', caption: 'Cant. Plazas', width: 120 },
            { dataField: 'SALARIO_MINIMO', caption: 'Sal. Mínimo', width: 120, format: '#,##0.00' },
            { dataField: 'SALARIO_MAXIMO', caption: 'Sal. Máximo', width: 120, format: '#,##0.00' },
            { dataField: 'TIEMPO_CONTRATO', caption: 'Tiempo Contrato', width: 140 },
            { dataField: 'HORARIO', caption: 'Horario', width: 150 },
            { dataField: 'JUSTIFICACION', caption: 'Justificacion', width: 200 },
            { dataField: 'FECHA_CREA', caption: 'Fecha creación', width: 150, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'USUARIO_CREA', caption: 'Usuario creación', width: 150 },
            { dataField: 'FECHA_ACTU', caption: 'Fecha actualización', width: 150, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'USUARIO_ACTU', caption: 'Usuario actualización', width: 150 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [{ column: 'CORR_REQUISICION_PERSONAL', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
        };
    }

    getItems(): any {
        return [
            {
                itemType: 'tabbed',
                colSpan: 8,
                tabs: [
                    {
                        title: 'General',
                        colCount: 8,
                        items: [
                                { dataField: 'CORR_REQUISICION_PERSONAL', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
                                {
                                    dataField: 'FECHA_REQUISICION',
                                    label: { text: 'Fecha requisición' },
                                    colSpan: 1,
                                    editorType: 'dxDateBox',
                                    editorOptions: {
                                        type: 'date',
                                        displayFormat: 'dd/MM/yyyy',
                                        useMaskBehavior: true,
                                        dateSerializationFormat: 'yyyy-MM-dd',
                                    }
                                },
                                {
                                    dataField: 'CORR_DESCRIPTOR',
                                    label: { text: 'Descriptor' },
                                    colSpan: 2,
                                    editorType: 'dxSelectBox',
                                    editorOptions: { 
                                        dataSource: [
                                        { CORR_DESCRIPTOR: 1, DESCRIPTOR: 'Todos' },
                                        { CORR_DESCRIPTOR: 2, DESCRIPTOR: 'Analista programador' },
                                        { CORR_DESCRIPTOR: 3, DESCRIPTOR: 'Soporte' },
                                        ],
                                        displayExpr: 'DESCRIPTOR',
                                        valueExpr: 'CORR_DESCRIPTOR',
                                        placeholder: 'Seleccione un descriptor...',
                                        searchEnabled: true,
                                        showClearButton: true,
                                    }
                                },
                                {
                                    dataField: 'CORR_DEPARTAMENTO',
                                    label: { text: 'Departamento' },
                                    colSpan: 2,
                                    editorType: 'dxSelectBox',
                                    editorOptions: {
                                        dataSource: [],
                                        displayExpr: 'NOMBRE_DEPARTAMENTO',
                                        valueExpr: 'CORR_DEPARTAMENTO',
                                        searchEnabled: true,
                                        placeholder: 'Seleccione un departamento',
                                        showClearButton: true,
                                    },
                                },
                                {
                                    dataField: 'CORR_PUESTO',
                                    label: { text: 'Puesto' },
                                    colSpan: 2,
                                    editorType: 'dxSelectBox',
                                    editorOptions: { 
                                        dataSource: [
                                        { CORR_PUESTO: 1, PUESTO: 'Todos' },
                                        { CORR_PUESTO: 2, PUESTO: 'Analista programador' },
                                        { CORR_PUESTO: 3, PUESTO: 'Soporte' },
                                        ],
                                        displayExpr: 'PUESTO',
                                        valueExpr: 'CORR_PUESTO',
                                        placeholder: 'Seleccione un puesto...',
                                        searchEnabled: true,
                                        showClearButton: true,
                                    }
                                },
                                {
                                    dataField: 'CORR_TIPO_MODALIDAD',
                                    label: { text: 'Tipo Modalidad' },
                                    colSpan: 2,
                                    editorType: 'dxSelectBox',
                                    editorOptions: {
                                        dataSource: [],
                                        displayExpr: 'MODALIDAD_NOMBRE',
                                        valueExpr: 'CORR_TIPO_MODALIDAD',
                                        searchEnabled: true,
                                        placeholder: 'Seleccione un tipo de modalidad',
                                        showClearButton: true,
                                    },
                                },
                                {
                                    dataField: 'CORR_TIPO_CONTRATACION',
                                    label: { text: 'Tipo Contratacion' },
                                    colSpan: 2,
                                    editorType: 'dxSelectBox',
                                    editorOptions: {
                                        dataSource: [],
                                        displayExpr: 'NOMBRE_TIPO_CONTRATACION',
                                        valueExpr: 'CORR_TIPO_CONTRATACION',
                                        searchEnabled: true,
                                        placeholder: 'Seleccione un tipo de contratacion',
                                        showClearButton: true,
                                        onValueChanged: null, // Se asignará dinámicamente en el componente
                                    },
                                },
                                {
                                    dataField: 'CORR_TIPO_VACANTE',
                                    label: { text: 'Tipo Vacante' },
                                    colSpan: 2,
                                    editorType: 'dxSelectBox',
                                    editorOptions: {
                                        dataSource: [],
                                        displayExpr: 'NOMBRE_TIPO_VACANTE',
                                        valueExpr: 'CORR_TIPO_VACANTE',
                                        searchEnabled: true,
                                        placeholder: 'Seleccione un tipo de vacante',
                                        showClearButton: true,
                                    },
                                },
                                {
                                    dataField: 'CANTIDAD_PLAZAS',
                                    label: { text: 'Cantidad plazas' },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 0, showSpinButtons: true },
                                },
                                {
                                    dataField: 'PLAZAS_CUBIERTAS',
                                    label: { text: 'Plazas cubiertas' },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 0, showSpinButtons: true },
                                },
                                {
                                    dataField: 'SALARIO_MINIMO',
                                    label: { text: 'Salario mínimo' },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 0, format: '#,##0.00' },
                                },
                                {
                                    dataField: 'SALARIO_MAXIMO',
                                    label: { text: 'Salario máximo' },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 0, format: '#,##0.00' },
                                },
                                {
                                    dataField: 'TIEMPO_CONTRATO',
                                    label: { text: 'Tiempo contrato (meses)' },
                                    colSpan: 2,
                                    visible: false, // Visible solo cuando CORR_TIPO_CONTRATACION === 2 (contrato temporal)
                                    editorType: 'dxNumberBox',
                                    editorOptions: { placeholder: 'Ej. 6 meses', showClearButton: true, maxLength: 50 },
                                },
                                {
                                    dataField: 'HORARIO',
                                    label: { text: 'Horario laboral' },
                                    colSpan: 2,
                                    editorType: 'dxTextArea',
                                    editorOptions: { placeholder: 'Horario laboral...', showClearButton: true, maxLength: 100 },
                                },
                                {
                                    dataField: 'JUSTIFICACION',
                                    label: { text: 'Justificacion requisición:' },
                                    colSpan: 8,
                                    editorType: 'dxTextArea',
                                    editorOptions: { minHeight: 90, maxLength: 500 },
                                },
                                {
                                    dataField: 'CORR_ESTADO_REQUISICION',
                                    label: { text: 'Estado requisición' },
                                    colSpan: 2,
                                    editorType: 'dxSelectBox',
                                    editorOptions: { 
                                        dataSource: [
                                        { CORR_ESTADO_REQUISICION: 1, ESTADO_REQUISICION: 'Borrador' },
                                        { CORR_ESTADO_REQUISICION: 2, ESTADO_REQUISICION: 'En Aprobacion' },
                                        { CORR_ESTADO_REQUISICION: 3, ESTADO_REQUISICION: 'Devuelta' },
                                        ],
                                        displayExpr: 'ESTADO_REQUISICION',
                                        valueExpr: 'CORR_ESTADO_REQUISICION',
                                        placeholder: 'Seleccione un estado...',
                                        searchEnabled: true,
                                        showClearButton: true,
                                    }
                                },
                        ],
                    },
                    {
                        title: 'Bitácora',
                        colCount: 4,
                        items: [
                            { dataField: 'FECHA_CREA', label: { text: 'Fecha creación' }, colSpan: 2, editorOptions: { readOnly: true } },
                            { dataField: 'USUARIO_CREA', label: { text: 'Usuario creación' }, colSpan: 2, editorOptions: { readOnly: true } },
                        ],
                    },
                    {
                        title: 'Tabla',
                        colCount: 8,
                        items: [
                            {
                                itemType: 'simple', //contenido libre
                                colSpan: 8,
                                template: 'tablaRequisicionTemplate', //nombre del template definido en el html
                                label: { visible: false }, // Oculta la etiqueta del item
                            },
                        ],
                    },
                ],
            },
        ];
    }

    //Columnas de la tabla bitacora requisicion
    headersRequisicionBitacora(): any {
        return [
            { dataField: 'CORR_DETALLE', caption: 'Corr.', width: 80 },
            { dataField: 'DESCRIPCION', caption: 'Descripción', width: 500 },
            { dataField: 'CANTIDAD', caption: 'Cantidad', width: 110 },
            { dataField: 'ESTADO', caption: 'Estado', width: 130 },
        ];
    }
}
