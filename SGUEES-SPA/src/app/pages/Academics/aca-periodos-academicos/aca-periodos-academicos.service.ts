import { Injectable } from '@angular/core';
import { CData } from 'src/app/FxAPI/CData';
import { environment } from 'src/environments/environment';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

export interface PeriodoCatalogo {
    TIPO: string; Key: number; Value: string; ACTIVO: boolean;
    CORR_SEDE: number | null; CORR_AREA_ACADEMICA: number | null; CORR_FACULTAD: number | null;
}
@Injectable({ providedIn: 'root' })
export class AcaPeriodosAcademicosService {
    private readonly controller = 'ACA_PERIODOS_MANTENIMIENTO';
    constructor(private data: CData) {}
    getAll() { return this.data.Get(this.controller, 'GetAll', [], environment.UrlGENERALAPI); }
    getCatalogos() { return this.data.Get(this.controller, 'GetCatalogos', [], environment.UrlGENERALAPI); }
    insert(model: any) { return this.data.Post(model, this.controller, '', environment.UrlGENERALAPI); }
    update(model: any) { return this.data.Put(model, this.controller, '', [], environment.UrlGENERALAPI); }
    estado(model: any) {
        return this.data.Put({ CORR_PERIODO_ACADEMICO: model.CORR_PERIODO_ACADEMICO }, this.controller, 'ActivarInactivar', [], environment.UrlGENERALAPI);
    }
    historial(id: number) {
        return this.data.Get(this.controller, 'GetHistorial', [{ Parameter: 'CORR_PERIODO_ACADEMICO', Value: id }], environment.UrlGENERALAPI);
    }
    oferta(filtro: any) {
        return this.data.Get(this.controller, 'GetOferta', Object.keys(filtro).map(key => ({ Parameter: key, Value: filtro[key] })), environment.UrlGENERALAPI);
    }
    getColumns(): any[] {
        return [
            { dataField: 'CORR_PERIODO_ACADEMICO', caption: 'Corr.', width: 85 },
            { dataField: 'ANIO', caption: 'Año', width: 90 },
            { dataField: 'NUMERO_PERIODO', caption: 'Período', width: 95 },
            { dataField: 'NOMBRE_SEDE', caption: 'Sede', width: 180 },
            { dataField: 'NOMBRE_AREA', caption: 'Área académica', width: 170 },
            { dataField: 'ALCANCE', caption: 'Alcance', width: 110 },
            { dataField: 'NOMBRE_FACULTAD', caption: 'Facultad', width: 250 },
            { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 300 },
            ...['FECHA_INICIO', 'FECHA_FIN', 'FECHA_INICIO_INSCRIPCION', 'FECHA_FIN_INSCRIPCION'].map((field, index) => ({
                dataField: field, caption: ['Inicio académico', 'Fin académico', 'Apertura inscripción', 'Cierre inscripción'][index],
                dataType: 'date', format: 'dd/MM/yyyy', width: 165,
            })),
            createEstadoColumnConfig('ACTIVO', ESTADO_ACTIVO_INACTIVO_LABELS),
            { dataField: 'EN_USO', caption: 'Con registros relacionados', dataType: 'boolean', width: 210 },
            ...buildAuditGridColumns(),
        ];
    }
}
