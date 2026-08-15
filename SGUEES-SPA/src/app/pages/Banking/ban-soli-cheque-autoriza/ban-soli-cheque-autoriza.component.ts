import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { take } from 'rxjs/operators';

import { custom } from 'devextreme/ui/dialog';



import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';

import { NotifyType } from 'src/app/shared/models/NotifyType';

import { AppInfoService } from 'src/app/shared/services/app-info.service';

import { environment } from 'src/environments/environment';



import { BanSoliCheque } from '../ban-soli-cheque/models/ban-soli-cheque';

import { BanSoliChequeService } from '../ban-soli-cheque/ban-soli-cheque.service';



@Component({

	selector: 'app-ban-soli-cheque-autoriza',

	templateUrl: './ban-soli-cheque-autoriza.component.html',

	styleUrls: ['./ban-soli-cheque-autoriza.component.scss'],

})

export class BanSoliChequeAutorizaComponent extends CBaseComponent implements OnInit {

	models: (BanSoliCheque & { SELECCION?: boolean })[] = [];

	vFECHA_INICIAL: Date = new Date();

	vFECHA_FINAL: Date = new Date();

	btnAccion = '';

	corrCuentaBanco = 0;

	mCORR_CUENTA_BANCO: any[] = [];

	readonly gridHeight = 'calc(100vh - 320px)';



	private readonly lookupOpcion = 'BAN_SOLI_CHEQUE_AUTORIZA';

	readonly documentoKeyExpr: (keyof BanSoliCheque)[] = [

		'ANIO_PERIODO',

		'MES_PERIODO',

		'CORR_TIPO_MOVIMIENTO',

		'CORR_DOCUMENTO',

	];



	constructor(

		public override appInfoService: AppInfoService,

		public override router: ActivatedRoute,

		private service: BanSoliChequeService

	) {

		super(appInfoService, router);

	}



	ngOnInit(): void {

		const today = this.appInfoService.getDate();

		this.vFECHA_INICIAL = new Date(today.getFullYear(), today.getMonth(), 1);

		this.vFECHA_FINAL = new Date(today.getFullYear(), today.getMonth() + 1, 0);

		this.getCORR_CUENTA_BANCO();

		this.refrescarBotones();

		this.consultar();

	}



	override getPermisos(permisos: string): void {

		super.getPermisos(permisos);

		this.refrescarBotones();

	}



	refrescarBotones(): void {

		this.btnAccion = this.permiteEdit ? 'Autorizar Solicitud' : '';

	}



	getCORR_CUENTA_BANCO(): void {

		this.appInfoService

			.getLookUp(this.lookupOpcion, 'BAN_CUENTA_BANCARIA', 'GetCORR_CUENTA_BANCO', undefined, environment.UrlCONTAAPI)

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					if (response.Result) {

						this.mCORR_CUENTA_BANCO = response.Data || [];

					}

				},

				error: (error: any) => this.notifyFx(error, NotifyType.Error),

			});

	}



	fillParam(): any {

		return {

			FECHA_INICIAL: this.appInfoService.toDate(this.vFECHA_INICIAL),

			FECHA_FINAL: this.appInfoService.toDate(this.vFECHA_FINAL),

		};

	}



	consultar(): void {

		this.loadingVisible = true;

		this.service

			.getAllAutorizar(this.fillParam())

			.pipe(take(1))

			.subscribe({

				next: (response: any) => {

					this.loadingVisible = false;

					if (response.Result) {

						this.models = (response.Data || []).map((row: BanSoliCheque) => ({

							...row,

							SELECCION: false,

							CORR_CUENTA_BANCO: row.CORR_CUENTA_BANCO || 0,

						}));

					} else {

						this.models = [];

						this.notifyFx(response.ErrorMessage || 'No se pudo consultar', NotifyType.Error);

					}

				},

				error: (error: any) => {

					this.loadingVisible = false;

					this.models = [];

					this.notifyFx(error, NotifyType.Error);

				},

			});

	}



	onCuentaBancoChanged(value: number): void {

		this.corrCuentaBanco = value || 0;

		if (!this.corrCuentaBanco) {

			return;

		}

		this.models.forEach((row) => {

			if (row.SELECCION) {

				row.CORR_CUENTA_BANCO = this.corrCuentaBanco;

			}

		});

	}



	selectTodos(): void {

		this.models.forEach((row) => {

			row.SELECCION = true;

			if (this.corrCuentaBanco) {

				row.CORR_CUENTA_BANCO = this.corrCuentaBanco;

			}

		});

	}



	selectNinguno(): void {

		this.models.forEach((row) => {

			row.SELECCION = false;

		});

	}



	autorizarSolicitudes(): void {

		const seleccionadas = this.models.filter((row) => row.SELECCION);

		if (!seleccionadas.length) {

			this.notifyFx('Seleccione al menos una solicitud', NotifyType.Warning);

			return;

		}

		if (!this.corrCuentaBanco) {

			this.notifyFx('Seleccione la cuenta bancaria para autorizar', NotifyType.Warning);

			return;

		}



		const sinCuenta = seleccionadas.some((row) => !row.CORR_CUENTA_BANCO);

		if (sinCuenta) {

			this.notifyFx('Todas las solicitudes seleccionadas deben tener cuenta bancaria', NotifyType.Warning);

			return;

		}



		const confirma = custom({

			title: 'Confirmación',

			messageHtml: `¿Realmente quiere autorizar ${seleccionadas.length} solicitud(es) de cheque?`,

			buttons: [

				{

					text: 'Sí',

					onClick: () => this.ejecutarAutorizacion(seleccionadas),

				},

				{ text: 'No', onClick: () => false },

			],

		});

		confirma.show();

	}



	private ejecutarAutorizacion(seleccionadas: (BanSoliCheque & { SELECCION?: boolean })[]): void {

		this.loadingVisible = true;

		let errores = 0;

		let ultimoError = '';



		const procesar = (pos: number) => {

			if (pos >= seleccionadas.length) {

				this.loadingVisible = false;

				if (errores === 0) {

					this.notifyFx('Solicitudes autorizadas con éxito', NotifyType.Success);

				} else {

					this.notifyFx(

						`Se procesaron ${seleccionadas.length - errores} solicitud(es). Último error: ${ultimoError}`,

						NotifyType.Warning

					);

				}

				this.consultar();

				return;

			}



			const source = seleccionadas[pos];

			const row = {

				...source,

				CORR_CUENTA_BANCO: source.CORR_CUENTA_BANCO || this.corrCuentaBanco,

			};



			this.service

				.autorizarSolicitud(row)

				.pipe(take(1))

				.subscribe({

					next: (response: any) => {

						if (!response.Result || response.ErrorCode !== 0) {

							errores += 1;

							ultimoError = response.ErrorMessage || 'Error al autorizar';

						}

						procesar(pos + 1);

					},

					error: (error: any) => {

						errores += 1;

						ultimoError = String(error);

						procesar(pos + 1);

					},

				});

		};



		procesar(0);

	}

}

