import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { ConCatalogoCuentaCentroCosto } from './models/con-catalogo-cuenta-centro-costo';
import { ConCatalogoCuentaCentroCostoService } from './con-catalogo-cuenta-centro-costo.service';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

@Component({
	selector: 'app-con-catalogo-cuenta-centro-costo',
	templateUrl: './con-catalogo-cuenta-centro-costo.component.html',
	styleUrls: ['./con-catalogo-cuenta-centro-costo.component.scss'],
})
export class ConCatalogoCuentaCentroCostoComponent extends CBaseComponent implements OnInit {
	catalogoColumns: any[] = [];
	centroColumns: any[] = [];
	cuentasCatalogo: any[] = [];
	cuentaSeleccionada: any = null;
	centrosAsignados: any[] = [];
	centrosNoAsignados: any[] = [];
	selectedNoAsignados: number[] = [];
	selectedAsignados: number[] = [];
	cargaError = '';
	gridCatalogoHeight = 500;
	gridCentroHeight = 460;
	private centrosCatalogo: any[] = [];
	private cuentaFocusKey = '';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConCatalogoCuentaCentroCostoService
	) {
		super(appInfoService, router);
		this.catalogoColumns = this.service.getCatalogoColumns();
		this.centroColumns = this.service.getCentroColumns();
		this.updateGridHeights();
	}

	ngOnInit(): void {
		this.cargarDatos();
	}

	@HostListener('window:resize')
	onWindowResize(): void {
		this.updateGridHeights();
	}

	override fillData(): any {
		return {};
	}

	private updateGridHeights(): void {
		const pageTop = 120;
		const toolbar = 92;
		const gap = 10;
		const panelHeaderCatalogo = 44;
		const panelHeaderCentro = 78;
		const panelsArea = Math.max(320, window.innerHeight - pageTop - toolbar - gap);

		this.gridCatalogoHeight = panelsArea - panelHeaderCatalogo;
		this.gridCentroHeight = panelsArea - panelHeaderCentro;
	}

	private setCargaError(message: string) {
		this.cargaError = message;
	}

	cargarDatos() {
		this.loadingVisible = true;
		this.cargaError = '';
		forkJoin({
			cuentas: this.service.getCatalogoCuentas().pipe(take(1)),
			centros: this.service.getCentrosCosto().pipe(take(1)),
		}).subscribe({
			next: ({ cuentas, centros }: any) => {
				const errores: string[] = [];
				if (cuentas?.Result) {
					this.cuentasCatalogo = cuentas.Data || [];
				} else {
					this.cuentasCatalogo = [];
					if (cuentas?.ErrorMessage) {
						errores.push('Catálogo: ' + cuentas.ErrorMessage);
					}
				}
				if (centros?.Result) {
					this.centrosCatalogo = centros.Data || [];
				} else {
					this.centrosCatalogo = [];
					if (centros?.ErrorMessage) {
						errores.push('Centros: ' + centros.ErrorMessage);
					}
				}
				if (errores.length) {
					this.setCargaError(errores.join(' '));
					errores.forEach((msg) => this.notifyFx(msg, NotifyType.Error));
				} else if (!this.cuentasCatalogo.length && !this.centrosCatalogo.length) {
					this.setCargaError(
						'No se recibieron cuentas ni centros de costo. Verifique permisos de lectura y vuelva a iniciar sesión si acaba de asignar la opción.'
					);
				}
				if (this.cuentaSeleccionada?.CUENTA_CONTABLE) {
					this.cargarCentrosPorCuenta(false);
				}
				this.loadingVisible = false;
			},
			error: (error: any) => {
				this.loadingVisible = false;
				const msg =
					typeof error === 'string'
						? error
						: error?.message || 'No fue posible cargar catálogo y centros de costo.';
				this.setCargaError(
					msg.includes('Unauthorized') || msg === 'Unauthorized'
						? 'Sesión expirada o sin permiso de lectura. Cierre sesión e ingrese nuevamente.'
						: msg
				);
				this.notifyFx(msg, NotifyType.Error);
			},
		});
	}

	seleccionarCuenta(cuenta: any) {
		if (!cuenta?.CUENTA_CONTABLE) {
			return;
		}
		if (this.cuentaFocusKey === cuenta.CUENTA_CONTABLE) {
			return;
		}
		this.cuentaFocusKey = cuenta.CUENTA_CONTABLE;
		this.cuentaSeleccionada = cuenta;
		this.limpiarSeleccionCentros();
		this.cargarCentrosPorCuenta();
	}

	onCuentaFocusedRowChanged(e: any) {
		if (e?.row?.rowType === 'data' && e.row?.data) {
			this.seleccionarCuenta(e.row.data);
		}
	}

	onCuentaRowClick(e: any) {
		if (e?.rowType === 'data' && e?.data) {
			this.seleccionarCuenta(e.data);
		}
	}

	limpiarSeleccionCentros() {
		this.selectedNoAsignados = [];
		this.selectedAsignados = [];
	}

	cargarCentrosPorCuenta(showLoading = true) {
		if (!this.cuentaSeleccionada?.CUENTA_CONTABLE) {
			this.centrosAsignados = [];
			this.centrosNoAsignados = [];
			return;
		}

		if (showLoading) {
			this.loadingVisible = true;
		}

		this.service
			.getAll(this.cuentaSeleccionada.CUENTA_CONTABLE)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.actualizarGrillasCentros(response.Data || []);
					} else {
						this.centrosAsignados = [];
						this.centrosNoAsignados = this.centrosCatalogo.map((item) => this.mapCentroCatalogo(item));
						if (response.ErrorMessage) {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
					}
					this.limpiarSeleccionCentros();
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	actualizarGrillasCentros(asignaciones: ConCatalogoCuentaCentroCosto[]) {
		const asignadosIds = new Set(asignaciones.map((item) => item.CORR_CENTRO_COSTO));

		this.centrosAsignados = asignaciones.map((item) => this.mapCentroAsignado(item));
		this.centrosNoAsignados = this.centrosCatalogo
			.filter((item) => !asignadosIds.has(item.CORR_CENTRO_COSTO))
			.map((item) => this.mapCentroCatalogo(item));
	}

	mapCentroCatalogo(centro: any) {
		return {
			CORR_CENTRO_COSTO: centro.CORR_CENTRO_COSTO,
			CODIGO_CENTRO_COSTO: centro.CODIGO_CENTRO_COSTO,
			NOMBRE_CENTRO: centro.NOMBRE_CENTRO,
			NOMBRE_TIPO_CENTRO_COSTO: centro.NOMBRE_TIPO_CENTRO_COSTO,
		};
	}

	mapCentroAsignado(row: ConCatalogoCuentaCentroCosto) {
		const centro = this.centrosCatalogo.find((item) => item.CORR_CENTRO_COSTO === row.CORR_CENTRO_COSTO);
		return {
			CORR_EMPRESA: row.CORR_EMPRESA || this.appInfoService.CORR_EMPRESA,
			CUENTA_CONTABLE: row.CUENTA_CONTABLE || this.cuentaSeleccionada?.CUENTA_CONTABLE,
			CORR_CENTRO_COSTO: row.CORR_CENTRO_COSTO,
			CODIGO_CENTRO_COSTO: centro?.CODIGO_CENTRO_COSTO || '',
			NOMBRE_CENTRO: row.NOMBRE_CENTRO || centro?.NOMBRE_CENTRO || '',
			NOMBRE_TIPO_CENTRO_COSTO: row.NOMBRE_TIPO_CENTRO_COSTO || centro?.NOMBRE_TIPO_CENTRO_COSTO || '',
		};
	}

	puedeAsignar(): boolean {
		return !!this.permiteAdd && !!this.cuentaSeleccionada?.ES_DETALLE;
	}

	puedeDesasignar(): boolean {
		return !!this.permiteDele && !!this.cuentaSeleccionada?.ES_DETALLE;
	}

	validarCuentaDetalle(): boolean {
		if (!this.cuentaSeleccionada) {
			this.notifyFx('Debe seleccionar una cuenta contable', NotifyType.Warning);
			return false;
		}
		if (!this.cuentaSeleccionada.ES_DETALLE) {
			this.notifyFx('Solo las cuentas de detalle permiten asignar centros de costo', NotifyType.Warning);
			return false;
		}
		return true;
	}

	asignarCentro(corrCentroCosto: number) {
		const centro = this.centrosNoAsignados.find((item) => item.CORR_CENTRO_COSTO === corrCentroCosto);
		if (!centro) {
			return of(null);
		}

		const model: ConCatalogoCuentaCentroCosto = {
			CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
			CUENTA_CONTABLE: this.cuentaSeleccionada.CUENTA_CONTABLE,
			CORR_CENTRO_COSTO: centro.CORR_CENTRO_COSTO,
			NOMBRE_CENTRO: centro.NOMBRE_CENTRO,
		};

		return this.service.asignar(model).pipe(take(1));
	}

	onNoAsignadoDblClick(e: any) {
		if (!this.puedeAsignar() || !this.validarCuentaDetalle()) {
			return;
		}
		this.loadingVisible = true;
		this.asignarCentro(e.data.CORR_CENTRO_COSTO).subscribe({
			next: (response: any) => this.procesarRespuestaAsignacion(response, 1),
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyFx(error, NotifyType.Error);
			},
		});
	}

	onAsignadoDblClick(e: any) {
		if (!this.puedeDesasignar() || !this.validarCuentaDetalle()) {
			return;
		}
		this.desasignarRegistro(e.data);
	}

	asignarSeleccionados() {
		if (!this.puedeAsignar() || !this.validarCuentaDetalle()) {
			return;
		}
		if (!this.selectedNoAsignados.length) {
			this.notifyFx('Seleccione al menos un centro de costo', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		forkJoin(this.selectedNoAsignados.map((id) => this.asignarCentro(id))).subscribe({
			next: (responses: any[]) => {
				const error = responses.find((response) => response && !response.Result);
				if (error) {
					this.notifyFx(error.ErrorMessage, NotifyType.Error);
				} else {
					this.notifyFx('Centros de costo asignados', NotifyType.Success);
				}
				this.cargarCentrosPorCuenta();
			},
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyFx(error, NotifyType.Error);
				this.cargarCentrosPorCuenta();
			},
		});
	}

	desasignarRegistro(registro: any) {
		this.loadingVisible = true;
		this.service
			.desasignar(registro)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.cargarCentrosPorCuenta();
						this.notifyFx('Centro de costo desasignado', NotifyType.Success);
					} else {
						this.loadingVisible = false;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	desasignarSeleccionados() {
		if (!this.puedeDesasignar() || !this.validarCuentaDetalle()) {
			return;
		}
		if (!this.selectedAsignados.length) {
			this.notifyFx('Seleccione al menos un centro de costo', NotifyType.Warning);
			return;
		}

		this.loadingVisible = true;
		const registros = this.centrosAsignados.filter((item) =>
			this.selectedAsignados.includes(item.CORR_CENTRO_COSTO)
		);

		forkJoin(registros.map((registro) => this.service.desasignar(registro).pipe(take(1)))).subscribe({
			next: (responses: any[]) => {
				const error = responses.find((response) => response && !response.Result);
				if (error) {
					this.notifyFx(error.ErrorMessage, NotifyType.Error);
				} else {
					this.notifyFx('Centros de costo desasignados', NotifyType.Success);
				}
				this.cargarCentrosPorCuenta();
			},
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyFx(error, NotifyType.Error);
				this.cargarCentrosPorCuenta();
			},
		});
	}

	procesarRespuestaAsignacion(response: any, cantidad: number) {
		if (response?.Result) {
			this.cargarCentrosPorCuenta();
			this.notifyFx(cantidad > 1 ? 'Centros de costo asignados' : 'Centro de costo asignado', NotifyType.Success);
		} else if (response) {
			this.loadingVisible = false;
			this.notifyFx(response.ErrorMessage, NotifyType.Error);
		}
	}

	refrescar() {
		this.cargarDatos();
	}
}
