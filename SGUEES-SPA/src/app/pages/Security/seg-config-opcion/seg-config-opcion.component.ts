import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegConfigOpcion } from './models/seg-config-opcion';
import { SegConfigOpcionService } from './seg-config-opcion.service';

@Component({
	selector: 'app-seg-config-opcion',
	templateUrl: './seg-config-opcion.component.html',
})
export class SegConfigOpcionComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'la configuración';
	protected override requiereEmpresaSesion = false;
	protected override mttoParchearGridTrasGuardar = false;

	readonly gridKeyExpr: string[] = ['CODIGO_SISTEMA', 'CODIGO_MENU', 'CODIGO_OPCION'];

	mCODIGO_SISTEMA: any;
	mCODIGO_MENU: any;
	mCODIGO_OPCION: any;
	readOnly = false;
	bloqLookups = false;

	sistemaLookupColumns = [
		{ dataField: 'CODIGO_SISTEMA', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_SISTEMA', caption: 'Sistema', width: 260 },
	];
	menuLookupColumns = [
		{ dataField: 'CODIGO_MENU', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_MENU', caption: 'Menú', width: 260 },
	];
	opcionLookupColumns = [
		{ dataField: 'CODIGO_OPCION', caption: 'Código', width: 140 },
		{ dataField: 'NOMBRE_OPCION', caption: 'Opción', width: 220 },
		{ dataField: 'URL_OPCION', caption: 'URL', width: 180 },
	];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: SegConfigOpcionService
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

	inicializaOpciones(): void {}

	llenaComboBox(): void {
		this.getCODIGO_SISTEMA();
		this.getCODIGO_MENU();
		this.getCODIGO_OPCION();
	}

	getCODIGO_SISTEMA(): void {
		this.appInfoService
			.getLookUp('SEG_CONFIG_OPCION', 'SEG_SISTEMA', 'GetCODIGO_SISTEMA', undefined, environment.UrlSEGURIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCODIGO_SISTEMA = response.Data;
					} else {
						this.notifyFx(response.ErrorMessage || 'No se pudo cargar el catálogo de sistemas.', NotifyType.Error);
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	getCODIGO_MENU(): void {
		this.appInfoService
			.getLookUp('SEG_CONFIG_OPCION', 'SEG_MENU_SISTEMA', 'GetCODIGO_MENU', undefined, environment.UrlSEGURIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCODIGO_MENU = response.Data;
					} else {
						this.notifyFx(response.ErrorMessage || 'No se pudo cargar el catálogo de menús.', NotifyType.Error);
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	getCODIGO_OPCION(): void {
		this.appInfoService
			.getLookUp('SEG_CONFIG_OPCION', 'SEG_OPCION_SISTEMA', 'GetCODIGO_OPCION', undefined, environment.UrlSEGURIDADAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCODIGO_OPCION = response.Data;
					} else {
						this.notifyFx(response.ErrorMessage || 'No se pudo cargar el catálogo de opciones.', NotifyType.Error);
					}
				},
				error: (error: any) => this.notifyApiError(error),
			});
	}

	fillParam(): SegConfigOpcion {
		return this.fillData();
	}

	override fillData(xModel?: SegConfigOpcion): SegConfigOpcion {
		if (xModel !== undefined) {
			return {
				CODIGO_SISTEMA: xModel.CODIGO_SISTEMA,
				CODIGO_MENU: xModel.CODIGO_MENU,
				CODIGO_OPCION: xModel.CODIGO_OPCION,
				ORDEN_SISTEMA: xModel.ORDEN_SISTEMA,
				ORDEN_MENU: xModel.ORDEN_MENU,
				ORDEN_OPCION: xModel.ORDEN_OPCION,
			};
		}

		return {
			CODIGO_SISTEMA: '',
			CODIGO_MENU: '',
			CODIGO_OPCION: '',
			ORDEN_SISTEMA: 0,
			ORDEN_MENU: 0,
			ORDEN_OPCION: 0,
		};
	}

	consultar(): void {
		this.service
			.getAll()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	override nuevo(): void {
		super.nuevo();
		this.bloqLookups = false;
	}

	override editarClick(e: any): void {
		super.editarClick(e);
		this.bloqLookups = true;
	}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
			return;
		}

		this.loadingVisible = true;
		const onSuccess = (response: any) => {
			if (response.Result) {
				this.model = response.Data;
				if (this.banderaMtto === UpdateType.Add) {
					this.models.push(response.Data);
				} else {
					const idx = this.models.findIndex(
						(item: any) =>
							item.CODIGO_SISTEMA === this.modelUpdate.CODIGO_SISTEMA &&
							item.CODIGO_MENU === this.modelUpdate.CODIGO_MENU &&
							item.CODIGO_OPCION === this.modelUpdate.CODIGO_OPCION
					);
					if (idx >= 0) {
						this.models[idx] = response.Data;
					}
				}
				this.AsignaStatus(UpdateType.Browse);
				this.bloqLookups = false;
				this.notifyFx('Registro guardado con éxito.', NotifyType.Success);
			} else {
				this.notifyFx(response.ErrorMessage, NotifyType.Error);
			}
			this.loadingVisible = false;
		};

		const request =
			this.banderaMtto === UpdateType.Add
				? this.service.insert(this.model)
				: this.service.update(this.model);

		request.pipe(take(1)).subscribe({
			next: onSuccess,
			error: (error: any) => {
				this.notifyFx(error, NotifyType.Error);
				this.loadingVisible = false;
			},
		});
	}

	override cancelar(): void {
		super.cancelar(
			(item: any) =>
				item.CODIGO_SISTEMA === this.modelUpdate.CODIGO_SISTEMA &&
				item.CODIGO_MENU === this.modelUpdate.CODIGO_MENU &&
				item.CODIGO_OPCION === this.modelUpdate.CODIGO_OPCION
		);
		this.bloqLookups = false;
	}

	rowRemoving(e: any): void {
		this.service
			.delete(e.data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con éxito.', NotifyType.Success);
						const idx = this.models.findIndex(
							(item: any) =>
								item.CODIGO_SISTEMA === e.data.CODIGO_SISTEMA &&
								item.CODIGO_MENU === e.data.CODIGO_MENU &&
								item.CODIGO_OPCION === e.data.CODIGO_OPCION
						);
						if (idx >= 0) {
							this.models.splice(idx, 1);
						}
					} else {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override bloquear(): void {
		this.readOnly = true;
		this.bloqLookups = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		this.bloqLookups = this.banderaMtto === UpdateType.Update;
	}

	override setFocus(): void {
		setTimeout(() => {
			const field =
				this.banderaMtto === UpdateType.Add ? 'CODIGO_SISTEMA' : 'ORDEN_SISTEMA';
			this.dataForm.instance.getEditor(field)?.focus();
		});
	}

	selectedLookUpCODIGO_SISTEMA(vRow: any): any {
		return vRow[0].CODIGO_SISTEMA;
	}

	selectedLookUpCODIGO_MENU(vRow: any): any {
		return vRow[0].CODIGO_MENU;
	}

	selectedLookUpCODIGO_OPCION(vRow: any): any {
		return vRow[0].CODIGO_OPCION;
	}
}
