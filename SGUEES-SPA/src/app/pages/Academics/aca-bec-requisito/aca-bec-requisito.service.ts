import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaBecRequisito, AcaBecTipoLookup } from './models/aca-bec-requisito';
import { AcaBecRequisitoRepository } from './aca-bec-requisito.repository';

const ESTADO_FIELD = 'ACTIVO';

type AcaBecRequisitoFormOptions = {
	tiposBeca?: AcaBecTipoLookup[];
    becaContexto?:number;
};

@Injectable({ providedIn: 'root' })
export class AcaBecRequisitoService {
	constructor(private repo: AcaBecRequisitoRepository) {}

	normalizar(model: AcaBecRequisito): AcaBecRequisito {
		return {
			...model,
			NOMBRE_REQUISITO: `${model.NOMBRE_REQUISITO ?? ''}`.trim(),
			DESCRIPCION: this.normalizarOpcional(model.DESCRIPCION),
			OBLIGATORIO: model.OBLIGATORIO ?? true,
			ACTIVO: model.ACTIVO ?? true,
		};
	}

	esValido(model: AcaBecRequisito, msg: Function): boolean {
		model = this.normalizar(model);

		if (!model.CORR_BECA || model.CORR_BECA <= 0) {
			msg('Debe seleccionar el tipo de beca.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_REQUISITO) {
			msg('Debe ingresar el nombre del requisito.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_REQUISITO.length > 200) {
			msg('El nombre del requisito no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.DESCRIPCION && model.DESCRIPCION.length > 1000) {
			msg('La descripcion del requisito no puede superar 1000 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_BECA_REQUISITO', Value: param.CORR_BECA_REQUISITO }]);
	}

	getTiposBeca(): Observable<IResult> {
		return this.repo.getTiposBeca();
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_BECA_REQUISITO', Value: model.CORR_BECA_REQUISITO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_BECA_REQUISITO', Value: model.CORR_BECA_REQUISITO }, { Parameter: 'VERSION_REGISTRO', Value: model.VERSION_REGISTRO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_BECA_REQUISITO', Value: model.CORR_BECA_REQUISITO }]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_BECA_REQUISITO', caption: 'Corr.', width: 90, dataType: 'number', filterOperations: ['=', '<', '>', '<=', '>='] },
			{ dataField: 'NOMBRE_BECA', caption: 'Tipo de beca', width: 280 },
			{ dataField: 'NOMBRE_REQUISITO', caption: 'Requisito', width: 360 },
			{ dataField: 'DESCRIPCION', caption: 'Descripcion', width: 360 },
			{ dataField: 'OBLIGATORIO', caption: 'Obligatorio', width: 120, dataType: 'boolean' },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_BECA_REQUISITO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(options?: AcaBecRequisitoFormOptions): any {
    return [
      {itemType:'group',caption:'Datos del requisito',colCount:1,colSpan:1,items:[
        {dataField:'CORR_BECA',label:{text:'Beca'},editorType:'dxSelectBox',editorOptions:{dataSource:options?.tiposBeca??[],valueExpr:'CORR_BECA',displayExpr:'NOMBRE_BECA',searchEnabled:true,readOnly:!!options?.becaContexto,showClearButton:false,width:'100%'},validationRules:[{type:'required',message:'Seleccione la beca'}]},
        {dataField:'NOMBRE_REQUISITO',label:{text:'Requisito'},editorOptions:{width:'100%',maxLength:200},validationRules:[{type:'required',message:'Ingrese el nombre'}]},
        {dataField:'DESCRIPCION',label:{text:'Descripción'},editorType:'dxTextArea',editorOptions:{width:'100%',minHeight:140,autoResizeEnabled:true,maxLength:1000}},
      ]},
      {itemType:'group',caption:'Configuración',colCount:2,colCountByScreen:{xs:1,sm:1,md:2,lg:2},colSpan:1,items:[
        {dataField:'OBLIGATORIO',label:{visible:false},editorType:'dxCheckBox',editorOptions:{text:'Obligatorio'}},
        {dataField:'ACTIVO',label:{visible:false},editorType:'dxCheckBox',editorOptions:{text:'Activo'}},
      ]},
    ];
  }

	private normalizarOpcional(value: string | null | undefined): string | null {
		const normalizado = `${value ?? ''}`.trim();
		return normalizado ? normalizado : null;
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_BECA_REQUISITO) {
			xWhere.push({ Parameter: 'CORR_BECA_REQUISITO', Value: param.CORR_BECA_REQUISITO });
		}

		if (param.CORR_BECA) {
			xWhere.push({ Parameter: 'CORR_BECA', Value: param.CORR_BECA });
		}

		return xWhere;
	}
}
