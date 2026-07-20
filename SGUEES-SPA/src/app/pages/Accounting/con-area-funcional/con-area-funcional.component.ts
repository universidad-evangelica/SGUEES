import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConAreaFuncional } from './models/con-area-funcional';
import { ConAreaFuncionalService } from './con-area-funcional.service';

@Component({
	selector: 'app-con-area-funcional',
	templateUrl: './con-area-funcional.component.html',
})
export class ConAreaFuncionalComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el área funcional';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_AREA_FUNCIONAL';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConAreaFuncionalService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	readOnly = false;
	// #endregion

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.consultar();
	}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
		}
	}

	//#region <Metodos Mtto>
	fillParam(xCORR_AREA_FUNCIONAL?: number): any {
		if (xCORR_AREA_FUNCIONAL == undefined) {
			xCORR_AREA_FUNCIONAL = 0;
		}
		return {
			CORR_AREA_FUNCIONAL: xCORR_AREA_FUNCIONAL,
		};
	}

	override fillData(xModel?: ConAreaFuncional): ConAreaFuncional {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_AREA_FUNCIONAL: xModel.CORR_AREA_FUNCIONAL,
				NOMBRE_AREA_FUNCIONAL: xModel.NOMBRE_AREA_FUNCIONAL,
				CODIGO_AREA_FUNCIONAL: xModel.CODIGO_AREA_FUNCIONAL,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_AREA_FUNCIONAL: 0,
				NOMBRE_AREA_FUNCIONAL: '',
				CODIGO_AREA_FUNCIONAL: '',
			};
		}
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_AREA_FUNCIONAL === this.modelUpdate.CORR_AREA_FUNCIONAL);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_AREA_FUNCIONAL)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_AREA_FUNCIONAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_AREA_FUNCIONAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_AREA_FUNCIONAL')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_AREA_FUNCIONAL')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_AREA_FUNCIONAL')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
