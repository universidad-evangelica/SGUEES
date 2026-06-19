import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConPartidaOperacionModo, ConPartidaOperacionService } from './con-partida-operacion.service';

@Component({
	selector: 'app-con-partida-operacion',
	templateUrl: './con-partida-operacion.component.html',
	styleUrls: ['./con-partida-operacion.component.scss'],
})
export class ConPartidaOperacionComponent extends CBaseComponent implements OnInit {
	modo: ConPartidaOperacionModo = 'aplicar';
	vFECHA_INICIAL: any;
	vFECHA_FINAL: any;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConPartidaOperacionService
	) {
		super(appInfoService, router);
	}

	getAccionLabel(): string {
		return this.service.getAccionLabel(this.modo);
	}

	ngOnInit(): void {
		this.modo = (this.router.snapshot.data['modo'] as ConPartidaOperacionModo) || 'aplicar';
		this.tituloVentana = this.router.snapshot.data['titulo'] || this.service.getAccionLabel(this.modo);
		const firstDay = new Date(this.appInfoService.getDate().getFullYear(), this.appInfoService.getDate().getMonth(), 1);
		this.vFECHA_INICIAL = firstDay;
		this.vFECHA_FINAL = this.appInfoService.getDate();
		this.consultar();
	}

	fillParam(): any {
		return {
			FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
		};
	}

	consultar() {
		this.loadingVisible = true;
		this.service
			.getAll(this.modo, this.fillParam())
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

	selectTodos() {
		this.models.forEach((x: any) => {
			x.SELECCION = true;
		});
	}

	selectNinguno() {
		this.models.forEach((x: any) => {
			x.SELECCION = false;
		});
	}

	ejecutarOperacion() {
		const selectedModels = this.models.filter((y: { SELECCION: boolean }) => y.SELECCION === true);
		if (selectedModels.length === 0) {
			this.notifyFx('Debe seleccionar al menos una partida', NotifyType.Error);
			return;
		}

		const accion = this.service.getAccionLabel(this.modo);
		const confirma = custom({
			title: `Confirmación de ${accion}`,
			messageHtml: `¿Realmente quiere ${accion.toLowerCase()} las partidas seleccionadas?`,
			buttons: [
				{
					text: 'Si',
					onClick: () => {
						selectedModels.forEach((x: any) => {
							this.service
								.ejecutar(this.modo, x)
								.pipe(take(1))
								.subscribe({
									next: (response: any) => {
										if (response.Result) {
											this.notifyFx(`${accion} con éxito`, NotifyType.Success);
										} else {
											this.notifyFx(response.ErrorMessage, NotifyType.Error);
										}
										this.consultar();
									},
									error: (error: any) => {
										this.notifyFx(error, NotifyType.Error);
									},
								});
						});
					},
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}
}
