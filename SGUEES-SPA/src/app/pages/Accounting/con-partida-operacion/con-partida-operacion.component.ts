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

	models: any[] = [];

	vFECHA_INICIAL: any;

	vFECHA_FINAL: any;

	sinRegistrosMsg = '';



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

		const routeData = this.resolveRouteData();

		this.modo = (routeData['modo'] as ConPartidaOperacionModo) || 'aplicar';

		this.tituloVentana = (routeData['titulo'] as string) || this.service.getAccionLabel(this.modo);

		this.urlOpcion =

			this.modo === 'aplicar'

				? '/con-partida-aplicar'

				: this.modo === 'desaplicar'

					? '/con-partida-desaplicar'

					: '/con-partida-anular';

		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));

		this.actualizarMensajeSinRegistros();



		const today = this.appInfoService.getDate();

		this.vFECHA_INICIAL = new Date(today.getFullYear(), today.getMonth(), 1);

		this.vFECHA_FINAL = new Date(today.getFullYear(), today.getMonth() + 1, 0);

		this.consultar();

	}



	private resolveRouteData(): Record<string, unknown> {

		let route = this.router.snapshot;

		const merged: Record<string, unknown> = { ...route.data };

		while (route.firstChild) {

			route = route.firstChild;

			Object.assign(merged, route.data);

		}

		return merged;

	}



	private actualizarMensajeSinRegistros(): void {

		if (this.modo === 'aplicar') {

			this.sinRegistrosMsg =

				'No hay partidas digitadas cuadradas en el rango de fechas. Verifique cargo/abono y que el estado sea Digitada (DI).';

			return;

		}

		if (this.modo === 'desaplicar') {

			this.sinRegistrosMsg = 'No hay partidas aplicadas en el rango de fechas seleccionado.';

			return;

		}

		this.sinRegistrosMsg = 'No hay partidas aplicadas para anular en el rango de fechas seleccionado.';

	}



	fillParam(): any {

		return {

			FECHA_INICIAL: this.appInfoService.toDate(this.vFECHA_INICIAL),

			FECHA_FINAL: this.appInfoService.toDate(this.vFECHA_FINAL),

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

						this.models = response.Data || [];

					} else {

						this.models = [];

						this.notifyFx(response.ErrorMessage || 'No se pudo consultar las partidas', NotifyType.Error);

					}

					this.loadingVisible = false;

				},

				error: (error: any) => {

					this.models = [];

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

