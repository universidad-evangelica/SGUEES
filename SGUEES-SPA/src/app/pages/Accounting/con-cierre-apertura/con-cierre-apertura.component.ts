import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConCierreAperturaModulo } from './models/con-cierre-apertura';
import { ConCierreAperturaService } from './con-cierre-apertura.service';

@Component({
	selector: 'app-con-cierre-apertura',
	templateUrl: './con-cierre-apertura.component.html',
	styleUrls: ['./con-cierre-apertura.component.scss'],
})
export class ConCierreAperturaComponent extends CBaseComponent implements OnInit {
	modulos: ConCierreAperturaModulo[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConCierreAperturaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.modulos = this.service.modulos;
	}

	ngOnInit(): void {
		this.consultar();
	}

	override fillData(): any {
		return {};
	}

	fillParam(): any {
		return { ANIO_PERIODO: 0 };
	}

	consultar() {
		this.loadingVisible = true;
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = (response.Data || []).map((r: any) => this.service.enriquecer(r));
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	hasPeriodoSeleccionado(): boolean {
		return this.model != null && this.model.ANIO_PERIODO != null && this.model.MES_PERIODO != null;
	}

	getPeriodoLabel(): string {
		if (!this.hasPeriodoSeleccionado()) {
			return '';
		}
		return `${this.model.NOMBRE_MES_PERIODO || this.model.MES_PERIODO} / ${this.model.ANIO_PERIODO}`;
	}

	override getPermiteEditar(_e: any): boolean {
		return false;
	}

	override getPermiteDele(_e: any): boolean {
		return false;
	}

	ejecutarCierre(modulo: ConCierreAperturaModulo) {
		this.ejecutarOperacion('cierre', modulo);
	}

	ejecutarApertura(modulo: ConCierreAperturaModulo) {
		this.ejecutarOperacion('apertura', modulo);
	}

	private ejecutarOperacion(tipo: 'cierre' | 'apertura', modulo: ConCierreAperturaModulo) {
		if (!this.hasPeriodoSeleccionado()) {
			this.notifyFx('Debe seleccionar un periodo en la grilla', NotifyType.Error);
			return;
		}

		const accion = tipo === 'cierre' ? 'Cierre' : 'Apertura';
		const confirma = custom({
			title: `Confirmación de ${accion}`,
			messageHtml: `¿Realmente quiere ejecutar ${accion.toLowerCase()} de ${modulo.label} para el periodo ${this.getPeriodoLabel()}?`,
			buttons: [
				{
					text: 'Si',
					onClick: () => {
						this.loadingVisible = true;
						const request =
							tipo === 'cierre'
								? this.service.generarCierre(this.model, modulo.code)
								: this.service.generarApertura(this.model, modulo.code);

						request.pipe(take(1)).subscribe({
							next: (response: any) => {
								if (response.Result) {
									this.notifyFx(`${accion} de ${modulo.label} ejecutado con exito!`, NotifyType.Success);
									this.consultar();
								} else {
									this.notifyFx(response.ErrorMessage, NotifyType.Error);
									this.loadingVisible = false;
								}
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
}
