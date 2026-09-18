// Qué hace: vista browse de Empleado (fase 1: solo grilla, sin CRUD multi-tabla).
// Cómo: consulta V_GEN_EMPLEADO vía API y muestra persona/DUI/estado con estándar mtto.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenEmpleado } from './models/gen-empleado';
import { GenEmpleadoService } from './gen-empleado.service';

const ESTADO_FIELD = 'ACTIVO_EMPLEADO';

@Component({
	selector: 'app-gen-empleado',
	templateUrl: './gen-empleado.component.html',
	styleUrls: ['./gen-empleado.component.scss'],
})
export class GenEmpleadoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el empleado';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_EMPLEADO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_EMPLEADO';
	protected override mttoParchearGridTrasGuardar = false;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Consulta de Empleados';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenEmpleadoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = [];
		// Fase 1: solo lectura (alta multi-tabla en siguiente etapa).
		this.permiteAdd = false;
		this.permiteEdit = false;
		this.permiteDele = false;
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.permiteAdd = false;
		this.permiteEdit = false;
		this.permiteDele = false;
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR_EMPLEADO?: number): any {
		return { CORR_EMPLEADO: xCORR_EMPLEADO ?? 0 };
	}

	override fillData(xModel?: GenEmpleado): GenEmpleado {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_EMPLEADO: xModel.CORR_EMPLEADO,
				CORR_PERSONA: xModel.CORR_PERSONA,
				CODIGO_EMPLEADO: xModel.CODIGO_EMPLEADO,
				NOMBRE_EMPLEADO: xModel.NOMBRE_EMPLEADO,
				DUI: xModel.DUI,
				NIT: xModel.NIT,
				FECHA_INGRESO: xModel.FECHA_INGRESO,
				CORREO_INSTITUCIONAL: xModel.CORREO_INSTITUCIONAL ?? (xModel as any).CORREO_ELECTRONICO ?? '',
				TELEFONO_INSTITUCIONAL: xModel.TELEFONO_INSTITUCIONAL ?? (xModel as any).TELEFONO_1 ?? '',
				LOGIN_SISTEMA_WEB: xModel.LOGIN_SISTEMA_WEB,
				ACTIVO_EMPLEADO: xModel.ACTIVO_EMPLEADO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 0,
			CORR_EMPLEADO: 0,
			CORR_PERSONA: 0,
			CODIGO_EMPLEADO: '',
			NOMBRE_EMPLEADO: '',
			DUI: '',
			NIT: '',
			FECHA_INGRESO: null,
			CORREO_INSTITUCIONAL: '',
			TELEFONO_INSTITUCIONAL: '',
			LOGIN_SISTEMA_WEB: '',
			ACTIVO_EMPLEADO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: null,
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: null,
		};
	}

	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				if (Array.isArray(this.models)) {
					this.models = this.models.map((row) => this.fillData(row));
					this.models = [...this.models].sort(
						(a, b) => Number(a.CORR_EMPLEADO) - Number(b.CORR_EMPLEADO)
					);
				}
				setTimeout(() => this.dataGrid?.refreshData(resetPage), 0);
			},
		});
	}

	override nuevo(): void {
		this.notifyFx('El alta de empleado se implementará en la siguiente fase.', NotifyType.Warning);
	}

	guardar(): void {
		this.notifyFx('La edición de empleado se implementará en la siguiente fase.', NotifyType.Warning);
	}

	activar_inactivar(): void {
		this.notifyFx('Activar/Inactivar se implementará en la siguiente fase.', NotifyType.Warning);
	}

	override rowDblClick(_e: any): void {
		// Solo browse en esta fase.
	}

	onEditClick(_e: any): void {
		this.notifyFx('La edición de empleado se implementará en la siguiente fase.', NotifyType.Warning);
	}

	rowRemoving(e: any): void {
		e.cancel = true;
		this.notifyFx('La eliminación de empleado se implementará en la siguiente fase.', NotifyType.Warning);
	}

	override getPermiteEditar(_e?: any): boolean {
		return false;
	}

	override getPermiteDele(_e?: any): boolean {
		return false;
	}
}
