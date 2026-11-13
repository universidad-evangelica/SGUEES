import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { ConPartidaService } from '../con-partida/con-partida.service';

/** Generación de partidas de apertura, liquidación y cierre (antes en Partidas Contables). */
@Component({
	standalone: false,
	selector: 'app-con-partida-especial',
	templateUrl: './con-partida-especial.component.html',
})
export class ConPartidaEspecialComponent extends CBaseComponent implements OnInit {
	vANIO_PERIODO = new Date().getFullYear();
	vMES_PERIODO = new Date().getMonth() + 1;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ConPartidaService
	) {
		super(appInfoService, router);
	}

	ngOnInit(): void {
		this.tituloVentana = 'Partidas de Cierre y Apertura';
		this.urlOpcion = '/con-partida-especial';
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.AsignaStatus(UpdateType.Browse);
	}

	ejecutar(tipo: 'LIQ' | 'CIE' | 'APE'): void {
		if (!this.vANIO_PERIODO || !this.vMES_PERIODO) {
			this.notifyFx('Indique año y mes del período', NotifyType.Warning);
			return;
		}
		const labels = { LIQ: 'liquidación', CIE: 'cierre', APE: 'apertura' };
		const confirma = custom({
			title: 'Confirmar',
			messageHtml: `¿Generar partida de ${labels[tipo]} para ${this.vMES_PERIODO}/${this.vANIO_PERIODO}?`,
			buttons: [
				{ text: 'Sí', onClick: () => true },
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show().then((ok: boolean) => {
			if (!ok) return;
			this.loadingVisible = true;
			const call =
				tipo === 'LIQ'
					? this.service.generarPartidaLiquidacion(this.vANIO_PERIODO, this.vMES_PERIODO)
					: tipo === 'CIE'
						? this.service.generarPartidaCierre(this.vANIO_PERIODO, this.vMES_PERIODO)
						: this.service.generarPartidaApertura(this.vANIO_PERIODO, this.vMES_PERIODO);
			call.pipe(take(1)).subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response?.ErrorCode === 0) {
						this.notifyFx(`Partida de ${labels[tipo]} generada. Queda en digitado; aplíquela desde el proceso correspondiente.`, NotifyType.Success);
					} else {
						this.notifyFx(response?.ErrorMessage || 'Error al generar partida', NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
		});
	}
}
