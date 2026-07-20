import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegOpcionSistema } from './models/seg-opcion-sistema';
import { SegOpcionSistemaService } from './seg-opcion-sistema.service';

@Component({
	selector: 'app-seg-opcion-sistema',
	templateUrl: './seg-opcion-sistema.component.html',
})
export class SegOpcionSistemaComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'la opción';
	protected override requiereEmpresaSesion = false;
	protected override mttoGridKeyExpr = 'CODIGO_OPCION';

	readOnly = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: SegOpcionSistemaService
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

	inicializaOpciones(): void {}

	fillParam(xCODIGO_OPCION?: string): any {
		return { CODIGO_OPCION: xCODIGO_OPCION ?? '' };
	}

	override fillData(xModel?: SegOpcionSistema): SegOpcionSistema {
		if (xModel !== undefined) {
			return {
				CODIGO_OPCION: xModel.CODIGO_OPCION,
				NOMBRE_OPCION: xModel.NOMBRE_OPCION,
				URL_OPCION: xModel.URL_OPCION,
				IMAGEN_OPCION: xModel.IMAGEN_OPCION ?? '',
			};
		}

		return {
			CODIGO_OPCION: '',
			NOMBRE_OPCION: '',
			URL_OPCION: '',
			IMAGEN_OPCION: '',
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CODIGO_OPCION === this.modelUpdate.CODIGO_OPCION);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CODIGO_OPCION)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CODIGO_OPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_OPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('URL_OPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('IMAGEN_OPCION')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			if (this.banderaMtto === UpdateType.Update) {
				this.dataForm.instance.getEditor('CODIGO_OPCION')?.option('readOnly', true);
			}
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			const field = this.banderaMtto === UpdateType.Add ? 'CODIGO_OPCION' : 'NOMBRE_OPCION';
			this.dataForm.instance.getEditor(field)?.focus();
		});
	}
}
