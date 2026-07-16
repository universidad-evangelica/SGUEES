import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenSectorEconomico } from './models/gen-sector-economico';
import { GenSectorEconomicoService } from './gen-sector-economico.service';

@Component({
	selector: 'app-gen-sector-economico',
	templateUrl: './gen-sector-economico.component.html',
})
export class GenSectorEconomicoComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'el sector económico';
	protected override requiereEmpresaSesion = false;
	protected override mttoGridKeyExpr = 'CORR_SECTOR_ECONOMICO';
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de sectores económicos';
	readOnly = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenSectorEconomicoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	llenaComboBox() {}

	fillParam(xCORR_SECTOR_ECONOMICO?: number): any {
		return {
			CORR_SECTOR_ECONOMICO: xCORR_SECTOR_ECONOMICO ?? 0,
		};
	}

	override fillData(xModel?: GenSectorEconomico): GenSectorEconomico {
		if (xModel !== undefined) {
			return {
				CORR_SECTOR_ECONOMICO: xModel.CORR_SECTOR_ECONOMICO,
				NOMBRE_SECTOR_ECONOMICO: xModel.NOMBRE_SECTOR_ECONOMICO,
				SALARIO_MINIMO: xModel.SALARIO_MINIMO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
			};
		}

		return {
			CORR_SECTOR_ECONOMICO: 0,
			NOMBRE_SECTOR_ECONOMICO: '',
			SALARIO_MINIMO: 0,
			USUARIO_CREA: '',
			FECHA_CREA: new Date(),
			ESTACION_CREA: '',
			USUARIO_ACTU: '',
			FECHA_ACTU: new Date(),
			ESTACION_ACTU: '',
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_SECTOR_ECONOMICO === this.modelUpdate.CORR_SECTOR_ECONOMICO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_SECTOR_ECONOMICO)),
		});
	}

	override bloquear(): void {
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('NOMBRE_SECTOR_ECONOMICO')?.focus();
		});
	}
}
