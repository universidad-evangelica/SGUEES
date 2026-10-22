import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenProveedor } from './models/gen-proveedor';
import { GenProveedorService } from './gen-proveedor.service';

@Component({
	selector: 'app-gen-proveedor',
	templateUrl: './gen-proveedor.component.html',
})
export class GenProveedorComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el proveedor';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_PROVEEDOR';
	protected override mttoCampoEstado = 'ACTIVO_PROVEEDOR';
	protected override mttoEstadoDescribeField = 'NOMBRE_PROVEEDOR';

	//#region <Declarando Variables>
	mCORR_PERSONA: any;
	mCORR_BANCO: any;
	mCORR_FORMA_PAGO: any;
	mCORR_CONDICION_PAGO: any;
	readOnly = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenProveedorService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.selectedLookUpCORR_PERSONA = this.selectedLookUpCORR_PERSONA.bind(this);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
	}

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_PERSONA();
		this.getCORR_BANCO();
		this.getCORR_FORMA_PAGO();
		this.getCORR_CONDICION_PAGO();
	}

	getCORR_PERSONA(corrPersonaIncluir?: number) {
		this.service
			.getPersonas({ CORR_PERSONA: corrPersonaIncluir ?? 0 })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PERSONA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_BANCO() {
		this.appInfoService
			.getLookUp('GEN_PROVEEDOR', 'GEN_BANCO', 'GetCORR_BANCO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_BANCO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_FORMA_PAGO() {
		this.appInfoService
			.getLookUp('GEN_PROVEEDOR', 'GEN_FORMA_PAGO', 'GetCORR_FORMA_PAGO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_FORMA_PAGO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_CONDICION_PAGO() {
		this.appInfoService
			.getLookUp('GEN_PROVEEDOR', 'COM_CONDICION_PAGO', 'GetCORR_CONDICION_PAGO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CONDICION_PAGO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_PROVEEDOR?: number): any {
		return {
			CORR_PROVEEDOR: xCORR_PROVEEDOR ?? 0,
		};
	}

	override fillData(xModel?: GenProveedor): GenProveedor {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_PROVEEDOR: xModel.CORR_PROVEEDOR,
				CORR_PERSONA: xModel.CORR_PERSONA ?? 0,
				CODIGO_PROVEEDOR: xModel.CODIGO_PROVEEDOR,
				TIPO_PERSONERIA: xModel.TIPO_PERSONERIA,
				NOMBRE_TIPO_PERSONERIA: xModel.NOMBRE_TIPO_PERSONERIA,
				NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
				CORR_FORMA_PAGO: xModel.CORR_FORMA_PAGO,
				CUENTA_BANCARIA: xModel.CUENTA_BANCARIA,
				CORR_BANCO: xModel.CORR_BANCO,
				ESTADO_PROVEEDOR: xModel.ESTADO_PROVEEDOR,
				ACTIVO_PROVEEDOR: !!xModel.ACTIVO_PROVEEDOR || xModel.ESTADO_PROVEEDOR === 'A',
				ESTADO_PROVEEDOR_WEB: xModel.ESTADO_PROVEEDOR_WEB || 'D',
				CORR_CONDICION_PAGO: xModel.CORR_CONDICION_PAGO,
			};
		}

		return {
			CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
			CORR_PROVEEDOR: 0,
			CORR_PERSONA: 0,
			CODIGO_PROVEEDOR: '',
			TIPO_PERSONERIA: '',
			NOMBRE_TIPO_PERSONERIA: '',
			NOMBRE_PROVEEDOR: '',
			CORR_FORMA_PAGO: 0,
			CUENTA_BANCARIA: '',
			CORR_BANCO: 0,
			ESTADO_PROVEEDOR: 'A',
			ACTIVO_PROVEEDOR: true,
			ESTADO_PROVEEDOR_WEB: 'D',
			CORR_CONDICION_PAGO: 0,
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
		this.getCORR_PERSONA(0);
		super.nuevo();
	}

	override editarClick(e: any): void {
		const row = e?.row?.data ?? e?.data ?? this.model;
		this.getCORR_PERSONA(row?.CORR_PERSONA ?? 0);
		super.editarClick(e);
	}

	guardar(): void {
		this.model.ESTADO_PROVEEDOR = this.model.ACTIVO_PROVEEDOR ? 'A' : 'I';
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_PROVEEDOR === this.modelUpdate.CORR_PROVEEDOR);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_PROVEEDOR)),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_PERSONERIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CUENTA_BANCARIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO_PROVEEDOR')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PROVEEDOR')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_PROVEEDOR')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_TIPO_PERSONERIA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CODIGO_PROVEEDOR')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO_PROVEEDOR')?.option('readOnly', false);
		});
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CODIGO_PROVEEDOR')?.focus();
		});
	}
	//#endregion

	selectedLookUpCORR_PERSONA(vRow: any): any {
		const row = Array.isArray(vRow) ? vRow[0] : vRow;
		if (row) {
			this.model.CORR_PERSONA = row.CORR_PERSONA;
			this.model.NOMBRE_PROVEEDOR = row.NOMBRE_PERSONA ?? '';
			this.model.TIPO_PERSONERIA = row.TIPO_PERSONERIA ?? '';
			this.model.NOMBRE_TIPO_PERSONERIA = row.NOMBRE_TIPO_PERSONERIA ?? '';
		}
		return row?.CORR_PERSONA;
	}

	selectedLookUpLista(vRow: any): any {
		return vRow[0]?.Key ?? vRow[0];
	}

	selectedLookUpCorr(vRow: any, field: string): any {
		const row = Array.isArray(vRow) ? vRow[0] : vRow;
		return row?.[field] ?? row;
	}
}
