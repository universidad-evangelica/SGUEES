import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoEmpleoRepository } from './aca-prospecto-empleo.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoEmpleoService {
    constructor(private repo: AcaProspectoEmpleoRepository) {}

    // Qué hace: información laboral del prospecto (pestaña Información económica).
    // Cómo lo hace: admisiones guarda como máximo un empleo; el componente toma la primera fila.
    getEmpleoPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'EMPRESA', caption: 'Empresa', width: 240 },
            { dataField: 'CARGO', caption: 'Cargo', width: 180 },
            { dataField: 'SECTOR_LABORAL', caption: 'Sector', width: 120 },
            { dataField: 'NOMBRE_DEPTO', caption: 'Departamento', width: 150 },
            { dataField: 'NOMBRE_MUNICIPIO', caption: 'Municipio', width: 150 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PROSPECTO_EMPLEO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: formulario "Información laboral" (fuente: formulario personal de admisiones).
    getItems(): any {
        return [
            { dataField: 'EMPRESA', label: { text: 'Empresa' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'CARGO', label: { text: 'Cargo' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'SECTOR_LABORAL', label: { text: 'Sector laboral' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_PAIS', label: { text: 'País' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_DEPTO', label: { text: 'Departamento' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_MUNICIPIO', label: { text: 'Municipio' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'TELEFONO', label: { text: 'Teléfono' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'DIRECCION', label: { text: 'Dirección' }, colSpan: 8, editorOptions: { readOnly: true } },
            { dataField: 'EMAIL', label: { text: 'Correo' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'SALARIO_MENSUAL', label: { text: 'Salario mensual ($)' }, colSpan: 2, editorType: 'dxNumberBox', editorOptions: { readOnly: true, format: '#,##0.00' } },
            { dataField: 'APORTE_LIQUIDO', label: { text: 'Aporte líquido ($)' }, colSpan: 2, editorType: 'dxNumberBox', editorOptions: { readOnly: true, format: '#,##0.00' } },
            { dataField: 'TRABAJA_AUN', label: { text: 'Trabaja actualmente' }, colSpan: 2, editorType: 'dxCheckBox' },
            { dataField: 'TIENE_EMPLEO_FUERA', label: { text: 'Empleo fuera del país' }, colSpan: 2, editorType: 'dxCheckBox' },
        ];
    }
}
