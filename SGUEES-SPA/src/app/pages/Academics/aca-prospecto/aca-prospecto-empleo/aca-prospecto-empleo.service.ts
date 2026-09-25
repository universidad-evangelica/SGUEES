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

    // Qué hace: modelo vacío para crear el empleo cuando se marca "Trabaja" en Datos personales.
    getModeloNuevo(persona: any): any {
        return {
            CORR_PROSPECTO_EMPLEO: 0,
            CORR_PROSPECTO_PERSONA: persona?.CORR_PROSPECTO_PERSONA ?? 0,
            CORR_PROSPECTO: persona?.CORR_PROSPECTO ?? 0,
            EMPRESA: '',
            CARGO: '',
            DIRECCION: '',
            TELEFONO: '',
            EMAIL: '',
            CORR_SECTOR_LABORAL: null,
            CORR_PAIS: null,
            CORR_DEPTO: null,
            CORR_MUNICIPIO: null,
            TRABAJA_AUN: true,
            TIENE_EMPLEO_FUERA: false,
            SALARIO_MENSUAL: null,
            APORTE_LIQUIDO: null,
        };
    }

    // Qué hace: crea el empleo (el API también marca TRABAJA = 1 en la persona).
    insert(model: any): Observable<IResult> {
        return this.repo.create(this.armarPayload(model));
    }

    // Qué hace: actualiza el empleo existente; la PK va en el query.
    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_EMPLEO', Value: model.CORR_PROSPECTO_EMPLEO }];
        return this.repo.update(this.armarPayload(model), xWhere);
    }

    // Qué hace: elimina el empleo (el API también deja TRABAJA = 0 en la persona).
    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO_EMPLEO', Value: model.CORR_PROSPECTO_EMPLEO }];
        return this.repo.delete(xWhere);
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

    // Qué hace: formulario "Información laboral", en el mismo orden del portal de admisiones.
    // Cómo lo hace: sector, país, departamento y municipio son lookups sobre los CORR_* (template),
    //               por eso sus obligatoriedades se revisan en validar(), no con validationRules.
    //               El formulario solo se muestra cuando el prospecto trabaja: el interruptor está
    //               en el encabezado de la sección y "Trabaja actualmente" no se pregunta (siempre 1).
    //               Solo se muestran los campos que el portal captura: CARGO, DIRECCION, TELEFONO,
    //               EMAIL, SALARIO_MENSUAL y APORTE_LIQUIDO existen en la tabla pero nadie los llena,
    //               así que quedan fuera de la pantalla (siguen viajando en el payload sin cambios;
    //               si algún día el portal los pregunta, la columna ya está lista).
    getItems(): any {
        return [
            {
                dataField: 'EMPRESA',
                label: { text: 'Nombre de la institución' },
                colSpan: 4,
                editorOptions: { maxLength: 1000 },
                validationRules: [{ type: 'required', message: 'Ingrese la institución donde trabaja' }],
            },
            { dataField: 'CORR_SECTOR_LABORAL', label: { text: '¿En qué sector labora?' }, colSpan: 2, template: 'CORR_SECTOR_LABORALLookup' },
            { dataField: 'TIENE_EMPLEO_FUERA', label: { text: '¿Trabaja en el extranjero?' }, colSpan: 2, editorType: 'dxCheckBox' },
            { dataField: 'CORR_PAIS', label: { text: 'País' }, colSpan: 2, template: 'CORR_PAIS_EMPLEOLookup' },
            { dataField: 'CORR_DEPTO', label: { text: 'Departamento' }, colSpan: 3, template: 'CORR_DEPTO_EMPLEOLookup' },
            { dataField: 'CORR_MUNICIPIO', label: { text: 'Municipio' }, colSpan: 3, template: 'CORR_MUNICIPIO_EMPLEOLookup' },
        ];
    }

    // Qué hace: obligatoriedades del portal que el dx-form no puede validar (son lookups con template).
    // Cómo lo hace: sector siempre; si trabaja en el extranjero no se pide ubicación (el portal no la
    //               guarda en ese caso); si no, exige país, departamento y municipio.
    //               Devuelve el mensaje a mostrar o null si todo está bien.
    validar(model: any): string | null {
        if (!model?.CORR_SECTOR_LABORAL) {
            return 'Seleccione el sector en el que labora.';
        }
        if (model?.TIENE_EMPLEO_FUERA === true) {
            return null;
        }
        if (!model?.CORR_PAIS) {
            return 'Seleccione el país del empleo.';
        }
        if (!model?.CORR_DEPTO) {
            return 'Seleccione el departamento del empleo.';
        }
        if (!model?.CORR_MUNICIPIO) {
            return 'Seleccione el municipio del empleo.';
        }
        return null;
    }

    // Qué hace: columnas de ACA_PROSPECTO_EMPLEO que viajan al API (sin campos calculados de la vista).
    // Cómo lo hace: si el empleo es en el extranjero, país, departamento y municipio viajan en nulo
    //               (regla del portal: de un empleo fuera no se registra la ubicación). Los campos que
    //               ya no se editan se mandan como están, para no borrar lo que hubiera en la tabla.
    private armarPayload(model: any): any {
        const extranjero = model.TIENE_EMPLEO_FUERA === true;
        return {
            CORR_PROSPECTO_EMPLEO: model.CORR_PROSPECTO_EMPLEO ?? 0,
            CORR_PROSPECTO_PERSONA: model.CORR_PROSPECTO_PERSONA,
            EMPRESA: model.EMPRESA,
            CARGO: model.CARGO,
            DIRECCION: model.DIRECCION,
            TELEFONO: model.TELEFONO,
            EMAIL: model.EMAIL,
            CORR_SECTOR_LABORAL: model.CORR_SECTOR_LABORAL,
            CORR_PAIS: extranjero ? null : model.CORR_PAIS,
            CORR_DEPTO: extranjero ? null : model.CORR_DEPTO,
            CORR_MUNICIPIO: extranjero ? null : model.CORR_MUNICIPIO,
            TRABAJA_AUN: true,
            TIENE_EMPLEO_FUERA: extranjero,
            SALARIO_MENSUAL: model.SALARIO_MENSUAL,
            APORTE_LIQUIDO: model.APORTE_LIQUIDO,
        };
    }
}
