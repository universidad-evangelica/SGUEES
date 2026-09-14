import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConCentroCostoNivel } from './models/con-centro-costo-nivel';
import { ConCentroCostoNivelService } from './con-centro-costo-nivel.service';

@Component({
	selector: 'app-con-centro-costo-nivel',
	templateUrl: './con-centro-costo-nivel.component.html',
})
// Qué hace: mantenimiento del catálogo de niveles de centro de costo.
// Cómo lo hace: NIVEL autoincremental; solo el nombre es editable.
export class ConCentroCostoNivelComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el nivel de centro de costo';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_CENTRO_COSTO_NIVEL';

	readOnly = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConCentroCostoNivelService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	ngOnInit(): void {
		this.inicializaOpciones();
		this.consultar();
	}

	inicializaOpciones() {}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
	}

	fillParam(xCORR_CENTRO_COSTO_NIVEL?: number): any {
		return {
			CORR_CENTRO_COSTO_NIVEL: xCORR_CENTRO_COSTO_NIVEL ?? 0,
		};
	}

	override fillData(xModel?: ConCentroCostoNivel): ConCentroCostoNivel {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_CENTRO_COSTO_NIVEL: xModel.CORR_CENTRO_COSTO_NIVEL,
				NOMBRE_NIVEL: xModel.NOMBRE_NIVEL,
				NIVEL: xModel.NIVEL,
			};
		}

		return {
			CORR_EMPRESA: 0,
			CORR_CENTRO_COSTO_NIVEL: 0,
			NOMBRE_NIVEL: '',
			NIVEL: null,
		};
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
		this.model.NIVEL = this.service.siguienteNivel(this.models);
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this), this.models),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_CENTRO_COSTO_NIVEL === this.modelUpdate.CORR_CENTRO_COSTO_NIVEL);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_CENTRO_COSTO_NIVEL)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_CENTRO_COSTO_NIVEL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NIVEL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_NIVEL')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_CENTRO_COSTO_NIVEL')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NIVEL')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_NIVEL')?.focus();
		});
	}
}
