import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { SegFlujoEstadoRepository } from './seg-flujo-estado.repository';
import { SegFlujoEstado } from './models/seg-flujo-estado';

@Injectable({
    providedIn: 'root',
})
export class SegFlujoEstadoService {
    constructor(private repo: SegFlujoEstadoRepository) {}

    //#region <Validadores>
    esValido(model: SegFlujoEstado, msg: Function): boolean {
        if (model.NOMBRE_ESTADO == '' || model.NOMBRE_ESTADO == null) {
            msg('Debe digitar el nombre del estado', NotifyType.Error);
            return false;
        }

        if (model.NOMBRE_ESTADO.length > 50) {
            msg('El nombre del estado no puede exceder los 50 caracteres', NotifyType.Error);
            return false;
        }

        if (model.DESCRIPCION && model.DESCRIPCION.length > 255) {
            msg('La descripción no puede exceder los 255 caracteres', NotifyType.Error);
            return false;
        }

        return true;
    }
    // #endregion

    getAll(param: any): Observable<IResult> {
        let xWhere: IParam[] = [];

        if (param.CORR_ESTADO && param.CORR_ESTADO > 0) {
            xWhere.push({ Parameter: 'CORR_ESTADO', Value: param.CORR_ESTADO });
        }

        if (param.CORR_TIPO_DOCUMENTO && param.CORR_TIPO_DOCUMENTO > 0) {
            xWhere.push({ Parameter: 'CORR_TIPO_DOCUMENTO', Value: param.CORR_TIPO_DOCUMENTO });
        }

        if (param.NOMBRE_ESTADO) {
            xWhere.push({ Parameter: 'NOMBRE_ESTADO', Value: param.NOMBRE_ESTADO });
        }

     

        return this.repo.get(xWhere);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ESTADO', Value: param.CORR_ESTADO }];
        return this.repo.getById(xWhere);
    }

    insert(model: any): Observable<IResult> {
        return this.repo.create(model);
    }

    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ESTADO', Value: model.CORR_ESTADO }];
        return this.repo.update(model, xWhere);
    }

    delete(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_ESTADO', Value: model.CORR_ESTADO }];
        return this.repo.delete(xWhere);
    }

    getByTipoDocumento(corrTipoDocumento: number, corrEmpresa?: number): Observable<IResult> {
        let xWhere: IParam[] = [];
        
        if (corrEmpresa) {
            xWhere.push({ Parameter: 'CORR_EMPRESA', Value: corrEmpresa });
        }
        xWhere.push({ Parameter: 'CORR_TIPO_DOCUMENTO', Value: corrTipoDocumento });
      
        
        return this.repo.getByTipoDocumento(xWhere);
    }
}