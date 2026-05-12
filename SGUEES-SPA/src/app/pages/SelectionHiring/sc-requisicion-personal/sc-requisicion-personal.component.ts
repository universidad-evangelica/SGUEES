import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import { ScRequisicionPersonal } from './models/sc-requisicion-personal';

import { ScRequisicionPersonalService } from './sc-requisicion-personal.service';

@Component({
  selector: 'app-sc-requisicion-personal',
  templateUrl: './sc-requisicion-personal.component.html',
  styleUrls: ['./sc-requisicion-personal.component.scss']
})
export class ScRequisicionPersonalComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScRequisicionPersonalService
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

	llenaComboBox() {
	}

	fillParam(xCORR_REQUISICION?: number): any {
		if (xCORR_REQUISICION == undefined) {
			xCORR_REQUISICION = 0;
		}
		return {
			CORR_REQUISICION: xCORR_REQUISICION,
		};
	}

	override fillData(xModel?: ScRequisicionPersonal): ScRequisicionPersonal {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_REQUISICION: xModel.CORR_REQUISICION,
				FECHA_REQUISICION: xModel.FECHA_REQUISICION,
				USUARIO_SOLICITA: xModel.USUARIO_SOLICITA,
				CORR_TIPO_PLAZA: xModel.CORR_TIPO_PLAZA,
				CANTIDAD_CONTRATACION: xModel.CANTIDAD_CONTRATACION,
				CORR_DEPTO: xModel.CORR_DEPTO,
				CORR_PUESTO: xModel.CORR_PUESTO,
				SUELDO_PLAZA: xModel.SUELDO_PLAZA,
				CORR_TIPO_CONTRATACION: xModel.CORR_TIPO_CONTRATACION,
				TIEMPO_CONTRATO: xModel.TIEMPO_CONTRATO,
				TIEMPO_LABORAL: xModel.TIEMPO_LABORAL,
				HORARIO: xModel.HORARIO,
				CORR_TIPO_VACANTE: xModel.CORR_TIPO_VACANTE,
				CORR_EMPLEADO_SUSTITUCION: xModel.CORR_EMPLEADO_SUSTITUCION,
				RAZON_TIPO_VACANTE: xModel.RAZON_TIPO_VACANTE,
				JUSTIFICACION: xModel.JUSTIFICACION,
				ESTADO_REQUISICION: xModel.ESTADO_REQUISICION,
				CORR_DESCRIPTOR: xModel.CORR_DESCRIPTOR,
				CORR_MODALIDAD_TRABAJO: xModel.CORR_MODALIDAD_TRABAJO,
				FECHA_INI_EVEN: xModel.FECHA_INI_EVEN,
				FECHA_FIN_EVEN: xModel.FECHA_FIN_EVEN,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_REQUISICION: 0,
			FECHA_REQUISICION: new Date(),
			USUARIO_SOLICITA: '',
			CORR_TIPO_PLAZA: 0,
			CANTIDAD_CONTRATACION: 0,
			CORR_DEPTO: 0,
			CORR_PUESTO: 0,
			SUELDO_PLAZA: 0,
			CORR_TIPO_CONTRATACION: 0,
			TIEMPO_CONTRATO: '',
			TIEMPO_LABORAL: '',
			HORARIO: '',
			CORR_TIPO_VACANTE: 0,
			CORR_EMPLEADO_SUSTITUCION: 0,
			RAZON_TIPO_VACANTE: '',
			JUSTIFICACION: '',
			ESTADO_REQUISICION: '',
			CORR_DESCRIPTOR: 0,
			CORR_MODALIDAD_TRABAJO: 0,
			FECHA_INI_EVEN: new Date(),
			FECHA_FIN_EVEN: new Date(),
			USUARIO_CREA: '',
			FECHA_CREA: new Date(),
			ESTACION_CREA: '',
			USUARIO_ACTU: '',
			FECHA_ACTU: new Date(),
			ESTACION_ACTU: '',
		};
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_REQUISICION === response.Data.CORR_REQUISICION);
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
		super.cancelar((item: any) => item.CORR_REQUISICION === this.modelUpdate.CORR_REQUISICION);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_REQUISICION))
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
		this.dataForm.instance.getEditor('CORR_REQUISICION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_REQUISICION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_SOLICITA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('JUSTIFICACION')?.option('readOnly', true);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('USUARIO_SOLICITA')?.focus();
		});
	}

}
