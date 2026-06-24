import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConPartidaModeloGeneracion } from './models/con-partida-modelo-seleccion';
import { ConPartidaModeloSeleccionService } from './con-partida-modelo-seleccion.service';

@Component({
	selector: 'app-con-partida-modelo-seleccion',
	templateUrl: './con-partida-modelo-seleccion.component.html',
	styleUrls: ['./con-partida-modelo-seleccion.component.scss'],
})
export class ConPartidaModeloSeleccionComponent extends CBaseComponent implements OnInit {
	formModel: ConPartidaModeloGeneracion = this.fillFormData();
	formItems: any;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private routerNavigate: Router,
		private service: ConPartidaModeloSeleccionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.formItems = this.service.getFormItems();
	}

	ngOnInit(): void {
		this.consultar();
	}

	override fillData(): any {
		return {};
	}

	fillFormData(): ConPartidaModeloGeneracion {
		return {
			ANIO_PERIODO: 0,
			MES_PERIODO: 0,
			FECHA_PARTIDA: new Date(),
			CORR_CLASE_PARTIDA: 0,
			NOMBRE_CLASE_PARTIDA: '',
			CORR_PARTIDA: 0,
			CORR_PARTIDA_GENERADA: undefined,
		};
	}

	fillParam(): any {
		return { CORR_PARTIDA: 0 };
	}

	consultar() {
		this.loadingVisible = true;
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override focusedRowChanged(e: any): void {
		super.focusedRowChanged(e);
		if (this.model) {
			this.formModel.CORR_CLASE_PARTIDA = this.model.CORR_CLASE_PARTIDA;
			this.formModel.NOMBRE_CLASE_PARTIDA = this.model.NOMBRE_CLASE_PARTIDA;
			this.formModel.CORR_PARTIDA = this.model.CORR_PARTIDA;
			this.formModel.CORR_PARTIDA_GENERADA = undefined;
		}
	}

	hasModeloSeleccionado(): boolean {
		return this.model != null && this.model.CORR_PARTIDA != null && this.model.CORR_PARTIDA > 0;
	}

	hasDatosGeneracion(): boolean {
		return (
			this.formModel.ANIO_PERIODO > 0 &&
			this.formModel.MES_PERIODO > 0 &&
			this.formModel.FECHA_PARTIDA != null &&
			this.hasModeloSeleccionado()
		);
	}

	getModeloLabel(): string {
		if (!this.hasModeloSeleccionado()) {
			return '';
		}
		return `${this.model.NOMBRE_CLASE_PARTIDA || ''} / ${this.model.CORR_PARTIDA} - ${this.model.NOMBRE_PARTIDA || ''}`;
	}

	override getPermiteEditar(_e: any): boolean {
		return false;
	}

	override getPermiteDele(_e: any): boolean {
		return false;
	}

	generarPartida(): void {
		if (!this.hasDatosGeneracion()) {
			this.notifyFx('Debe completar periodo, fecha y seleccionar un modelo en la grilla', NotifyType.Error);
			return;
		}

		const confirma = custom({
			title: 'Confirmación de Generación',
			messageHtml: `¿Realmente quiere generar la partida desde el modelo ${this.getModeloLabel()}?`,
			buttons: [
				{
					text: 'Si',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.crearPartidaModelo(this.formModel)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									if (response.Result && response.ErrorCode === 0) {
										const corrPartida = response.Data?.CORR_PARTIDA ?? response.CodeHelper;
										this.formModel.CORR_PARTIDA_GENERADA = corrPartida;
										this.notifyFx(`Partida generada con éxito. No. Partida: ${corrPartida}`, NotifyType.Success);
									} else {
										this.notifyFx(response.ErrorMessage, NotifyType.Error);
									}
									this.loadingVisible = false;
								},
								error: (error: any) => {
									this.loadingVisible = false;
									this.notifyFx(error, NotifyType.Error);
								},
							});
					},
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}

	volverPartidas(): void {
		this.routerNavigate.navigateByUrl('/con-partida');
	}
}
