import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanParametro } from './models/ban-parametro';
import { BanParametroService } from './ban-parametro.service';

@Component({
	selector: 'app-ban-parametro',
	templateUrl: './ban-parametro.component.html',
})
export class BanParametroComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el parámetro bancario';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_EMPRESA';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: BanParametroService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}

	llenaComboBox() {}

	fillParam(xCORR_EMPRESA?: number): any {
		return {
			CORR_EMPRESA: xCORR_EMPRESA ?? 0,
		};
	}

	override fillData(xModel?: BanParametro): BanParametro {
		if (xModel !== undefined) {
			return { ...xModel };
		}

		return {
			CORR_EMPRESA: 0,
			CONTABILIZAR_LUEGO_DE_APLICAR: true,
			CONTABILIZAR_LUEGO_DE_IMPRIMIR: true,
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
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_EMPRESA === this.modelUpdate.CORR_EMPRESA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_EMPRESA)),
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CONTABILIZAR_LUEGO_DE_APLICAR')?.focus();
		});
	}
}
