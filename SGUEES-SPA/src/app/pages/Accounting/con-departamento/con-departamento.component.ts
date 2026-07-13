import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConDepartamento } from './models/con-departamento';
import { ConDepartamentoService } from './con-departamento.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-departamento',
	templateUrl: './con-departamento.component.html',
})
export class ConDepartamentoComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el departamento';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_DEPARTAMENTO';

	private readonly maintenanceSubtitulo = 'Mantenimiento de departamentos contables';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConDepartamentoService
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
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	//#region <Metodos Mtto>
	fillParam(xCORR_DEPARTAMENTO?: number): any {
		if (xCORR_DEPARTAMENTO == undefined) {
			xCORR_DEPARTAMENTO = 0;
		}
		return {
			CORR_DEPARTAMENTO: xCORR_DEPARTAMENTO,
		};
	}

	override fillData(xModel?: ConDepartamento): ConDepartamento {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_DIVISION: xModel.CORR_DIVISION,
				CORR_GERENCIA: xModel.CORR_GERENCIA,
				CORR_DEPARTAMENTO: xModel.CORR_DEPARTAMENTO,
				NOMBRE_DEPARTAMENTO: xModel.NOMBRE_DEPARTAMENTO,
				CODIGO_DEPARTAMENTO: xModel.CODIGO_DEPARTAMENTO,
			};
		} else {
			return {
				CORR_EMPRESA: 0,
				CORR_DIVISION: 0,
				CORR_GERENCIA: 0,
				CORR_DEPARTAMENTO: 0,
				NOMBRE_DEPARTAMENTO: '',
				CODIGO_DEPARTAMENTO: '',
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
		super.cancelar((item: any) => item.CORR_DEPARTAMENTO === this.modelUpdate.CORR_DEPARTAMENTO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_DEPARTAMENTO)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_DIVISION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_GERENCIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_DEPARTAMENTO')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_DEPARTAMENTO')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_DEPARTAMENTO')?.focus();
		});
	}
	//#endregion
}
