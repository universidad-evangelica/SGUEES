// Qué hace: browse + formulario Nuevo/Editar de Empleado (UI tipo expediente mejorada).
// Cómo: grilla en browse; en Add/Update muestra panel de identidad + tabs (sin botón de proceso selección).
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

	private readonly browseSubtitulo = 'Consulta de Empleados';
	private readonly formSubtituloNuevo = 'Nuevo empleado';
	private readonly formSubtituloEditar = 'Datos del empleado';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenEmpleadoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = [];
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.browseSubtitulo;
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.browseSubtitulo;
			return;
		}
		if (xEstado === UpdateType.Add) {
			this.subTituloVentana = this.formSubtituloNuevo;
			return;
		}
		if (xEstado === UpdateType.Update || xEstado === UpdateType.Not_Defined) {
			this.subTituloVentana = this.formSubtituloEditar;
		}
	}

	get esNuevo(): boolean {
		return this.banderaMtto === UpdateType.Add;
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

	/** Qué hace: abre el formulario de alta con panel + tabs. */
	override nuevo(): void {
		super.nuevo();
		this.model = this.fillData();
		this.modelUpdate = this.fillData();
		this.subTituloVentana = this.formSubtituloNuevo;
	}

	guardar(): void {
		this.notifyFx(
			'El guardado multi-tabla (persona + empleado + documentos) se implementará en la siguiente fase.',
			NotifyType.Warning
		);
	}

	activar_inactivar(): void {
		this.notifyFx('Activar/Inactivar se implementará en la siguiente fase.', NotifyType.Warning);
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (!rowData) {
			return;
		}
		this.model = this.fillData(rowData);
		this.modelUpdate = this.fillData(rowData);
		this.AsignaStatus(UpdateType.Not_Defined);
		this.subTituloVentana = this.formSubtituloEditar;
	}

	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}
		this.abrirFormulario(e.row.data, UpdateType.Update);
	}

	rowRemoving(e: any): void {
		e.cancel = true;
		this.notifyFx('La eliminación de empleado se implementará en la siguiente fase.', NotifyType.Warning);
	}

	override getPermiteEditar(_e?: any): boolean {
		return !!this.permiteEdit;
	}

	override getPermiteDele(_e?: any): boolean {
		return false;
	}

	get inicialesPersona(): string {
		const nombre = (this.model?.NOMBRE_EMPLEADO ?? '').trim();
		if (!nombre) {
			return 'NE';
		}
		const partes = nombre.split(/\s+/).filter(Boolean);
		if (partes.length === 1) {
			return partes[0].substring(0, 2).toUpperCase();
		}
		return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
	}

	get tituloPersonaPanel(): string {
		const nombre = (this.model?.NOMBRE_EMPLEADO ?? '').trim();
		if (nombre) {
			return nombre;
		}
		return this.esNuevo ? 'Nuevo empleado' : 'Empleado sin nombre';
	}

	get badgeEmpleadoId(): string {
		const corr = Number(this.model?.CORR_EMPLEADO ?? 0);
		if (corr > 0) {
			return `Empleado #${corr}`;
		}
		return 'Nuevo';
	}

	textoLectura(valor: any): string {
		const t = `${valor ?? ''}`.trim();
		return t || '—';
	}

	fechaLectura(valor: any): string {
		if (!valor) {
			return '—';
		}
		const d = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(d.getTime())) {
			return '—';
		}
		const dd = `${d.getDate()}`.padStart(2, '0');
		const mm = `${d.getMonth() + 1}`.padStart(2, '0');
		const yyyy = d.getFullYear();
		return `${dd}/${mm}/${yyyy}`;
	}

	fechaHoraLectura(valor: any): string {
		if (!valor) {
			return '—';
		}
		const d = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(d.getTime())) {
			return '—';
		}
		const dd = `${d.getDate()}`.padStart(2, '0');
		const mm = `${d.getMonth() + 1}`.padStart(2, '0');
		const yyyy = d.getFullYear();
		const hh = `${d.getHours()}`.padStart(2, '0');
		const mi = `${d.getMinutes()}`.padStart(2, '0');
		return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
	}

	abrirEditarSeccion(): void {
		if (this.banderaMtto === UpdateType.Not_Defined || this.banderaMtto === UpdateType.Browse) {
			this.AsignaStatus(UpdateType.Update);
			this.subTituloVentana = this.formSubtituloEditar;
		}
	}

	private abrirFormulario(rowData: GenEmpleado, modo: UpdateType): void {
		this.model = this.fillData(rowData);
		this.modelUpdate = this.fillData(rowData);
		this.AsignaStatus(modo);
		this.subTituloVentana = this.formSubtituloEditar;
	}
}
