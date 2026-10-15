import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoDocumentoRepository } from './aca-prospecto-documento.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoDocumentoService {
    constructor(private repo: AcaProspectoDocumentoRepository) {}

    // Qué hace: documentación de un prospecto en la solicitud de nuevo ingreso.
    getDocumentosPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    // Qué hace: sube el archivo con las mismas reglas del portal (formato y tamaño del catálogo).
    cargarArchivo(CORR_PROSPECTO: number, CORR_DOCUMENTO_ADMISION: number, archivo: File): Observable<IResult> {
        const data = new FormData();
        data.append('CORR_PROSPECTO', String(CORR_PROSPECTO));
        data.append('CORR_DOCUMENTO_ADMISION', String(CORR_DOCUMENTO_ADMISION));
        data.append('Archivo', archivo, archivo.name);
        return this.repo.cargarArchivo(data);
    }

    // Qué hace: extensiones que acepta el input de esa fila.
    acepta(fila: any): string {
        return this.extensiones(fila).join(',');
    }

    // Qué hace: aviso antes de llamar al API si el archivo no cumple el catálogo.
    validarArchivo(fila: any, archivo: File): string | null {
        const extension = '.' + (archivo.name.split('.').pop() || '').toLowerCase();
        const permitidas = this.extensiones(fila);
        if (!permitidas.includes(extension)) {
            return 'Este documento solo acepta ' + this.describir(fila) + '.';
        }
        const maximo = Number(fila?.TAMANO_MAXIMO_MB) > 0 ? Number(fila.TAMANO_MAXIMO_MB) : 10;
        if (archivo.size > maximo * 1024 * 1024) {
            return 'El archivo supera el máximo de ' + maximo + ' MB.';
        }
        return null;
    }

    private extensiones(fila: any): string[] {
        const formatos = String(fila?.FORMATOS_PERMITIDOS || 'PDF,JPG,PNG')
            .split(',')
            .map((f) => f.trim().toUpperCase())
            .filter((f) => !!f);
        const mapa: Record<string, string[]> = {
            PDF: ['.pdf'],
            JPG: ['.jpg', '.jpeg'],
            PNG: ['.png'],
        };
        const lista = formatos.flatMap((f) => mapa[f] || []);
        return lista.length ? lista : ['.pdf', '.jpg', '.jpeg', '.png'];
    }

    private describir(fila: any): string {
        const formatos = String(fila?.FORMATOS_PERMITIDOS || 'PDF,JPG,PNG')
            .split(',')
            .map((f) => f.trim().toUpperCase())
            .filter((f) => !!f);
        if (formatos.length <= 1) return formatos[0] || 'PDF, JPG o PNG';
        return formatos.slice(0, -1).join(', ') + ' o ' + formatos[formatos.length - 1];
    }

    getColumns(): any {
        return [
            { dataField: 'NOMBRE_DOCUMENTO', caption: 'Documento', width: 280, minWidth: 180 },
            { dataField: 'OBLIGATORIO', caption: 'Obligatorio', width: 120, dataType: 'boolean' },
            { dataField: 'FORMATOS_PERMITIDOS', caption: 'Formatos', width: 140 },
            { dataField: 'TAMANO_MAXIMO_MB', caption: 'Máx. MB', width: 90 },
            { dataField: 'NOMBRE_ARCHIVO', caption: 'Archivo cargado', width: 260, minWidth: 160 },
            {
                dataField: 'FECHA_CARGA',
                caption: 'Fecha de carga',
                width: 150,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
            { dataField: 'ESTADO_REVISION', caption: 'Revisión', width: 130 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'NOMBRE_DOCUMENTO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }
}
