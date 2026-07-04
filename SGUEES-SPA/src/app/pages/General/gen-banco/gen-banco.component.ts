import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenBanco } from './models/gen-banco';
import { GenBancoService } from './gen-banco.service';

@Component({
	selector: 'app-gen-banco',
	templateUrl: './gen-banco.component.html',
	styleUrls: ['./gen-banco.component.scss'],
})
export class GenBancoComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el banco';
	protected override requiereEmpresaSesion = true;

	readonly pageSizes = [5, 10, 25, 50, 100];
	private readonly maintenanceSubtitulo = 'Mantenimiento de Bancos';

	//#region <Declarando Variales>
	mCLASE_BANCO: any;
	readOnly = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenBancoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCLASE_BANCO();
	}

	getCLASE_BANCO() {
		this.appInfoService
			.getLookUp('GEN_BANCO', 'GEN_LISTA', 'GetCLASE_BANCO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_BANCO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_BANCO?: number): any {
		return {
			CORR_BANCO: xCORR_BANCO ?? 0,
		};
	}

	override fillData(xModel?: GenBanco): GenBanco {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_BANCO: xModel.CORR_BANCO,
				NOMBRE_BANCO: xModel.NOMBRE_BANCO,
				NOMBRE_BANCO_CORTO: xModel.NOMBRE_BANCO_CORTO,
				CLASE_BANCO: xModel.CLASE_BANCO,
				CODIGO_TRANSACION_UNI: xModel.CODIGO_TRANSACION_UNI,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_BANCO: 0,
			NOMBRE_BANCO: '',
			NOMBRE_BANCO_CORTO: '',
			CLASE_BANCO: '',
			CODIGO_TRANSACION_UNI: '',
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
			onSuccess: (data: any, isAdd: boolean) => {
				if (isAdd) {
					this.models.push(data);
				} else {
					const vIndex = this.models.findIndex((item: any) => item.CORR_BANCO === data.CORR_BANCO);
					if (vIndex >= 0) {
						this.models[vIndex] = data;
					}
				}
			},
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_BANCO === this.modelUpdate.CORR_BANCO);
	}

	rowRemoving(e: any) {
		e.cancel = true;
		const row = e.data as GenBanco;
		this.confirmaAccion('Eliminar registro', `Desea eliminar el banco "${row.NOMBRE_BANCO}"?`, () =>
			this.ejecutarDelete({
				deleteFn: () => this.service.delete(this.fillParam(row.CORR_BANCO)),
				onSuccess: () => e.component.refresh(),
			})
		);
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_BANCO_CORTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_BANCO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_TRANSACION_UNI')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_BANCO')?.option('readOnly', true);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_BANCO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
}
