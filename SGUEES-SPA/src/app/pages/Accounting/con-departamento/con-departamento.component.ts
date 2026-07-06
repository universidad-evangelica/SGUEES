import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConDepartamento } from './models/con-departamento';
import { ConDepartamentoService } from './con-departamento.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-departamento',
	templateUrl: './con-departamento.component.html',
	styleUrls: ['./con-departamento.component.scss'],
})
export class ConDepartamentoComponent extends CBaseComponent implements OnInit {
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
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {}
	//#endregion

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

	consultar() {
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.models.push(response.Data);
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		} else if (this.banderaMtto === UpdateType.Update) {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.CORR_DEPARTAMENTO === response.Data.CORR_DEPARTAMENTO);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_DEPARTAMENTO === this.modelUpdate.CORR_DEPARTAMENTO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_DEPARTAMENTO))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						e.component.refresh();
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
