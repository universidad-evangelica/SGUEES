// Qué hace: browse + formulario Nuevo/Editar de Empleado (Iniciar + tab Personales).
// Cómo: grilla browse; Guardar en Nuevo llama Iniciar; Personales CRUD GEN_PERSONA_NATURAL + lookups.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { IParam } from 'src/app/FxAPI/IParam';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { GenEmpleado } from './models/gen-empleado';
import { GenPersonaNatural } from './models/gen-persona-natural';
import { GenEmpleadoService } from './gen-empleado.service';

const ESTADO_FIELD = 'ACTIVO_EMPLEADO';

@Component({
	selector: 'app-gen-empleado',
	templateUrl: './gen-empleado.component.html',
	styleUrls: ['./gen-empleado.component.scss'],
})
export class GenEmpleadoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('formPersonales', { static: false }) formPersonales!: DxFormComponent;

	protected override etiquetaRegistro = 'el empleado';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_EMPLEADO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_EMPLEADO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly browseSubtitulo = 'Consulta de Empleados';
	private readonly formSubtituloNuevo = 'Nuevo empleado';
	private readonly formSubtituloEditar = 'Datos del empleado';

	modelPersonaNatural: GenPersonaNatural = this.fillPersonaNatural();
	itemsPersonales: any[] = [];

	mCORR_RELIGION: any[] = [];
	mCORR_ORIGEN_INGRESO: any[] = [];
	mCORR_TIPO_CONTRIBUYENTE: any[] = [];
	mCORR_ACTIVIDAD_ECONOMICA: any[] = [];
	mCORR_PAIS_NACIMIENTO: any[] = [];
	mCORR_DEPTO_NACIMIENTO: any[] = [];
	mCORR_MUNICIPIO_NACIMIENTO: any[] = [];
	mCORR_DISTRITO_NACIMIENTO: any[] = [];

	readonly opcionesSexo = [
		{ value: 'MASCULINO', text: 'Masculino' },
		{ value: 'FEMENINO', text: 'Femenino' },
	];
	readonly opcionesEstadoCivil = [
		{ value: 'SOLTERO(A)', text: 'Soltero(a)' },
		{ value: 'CASADO(A)', text: 'Casado(a)' },
		{ value: 'ACOMPAÑADO(A)', text: 'Acompañado(a)' },
		{ value: 'DIVORCIADO(A)', text: 'Divorciado(a)' },
		{ value: 'VIUDO(A)', text: 'Viudo(a)' },
	];
	readonly opcionesSiNo = [
		{ value: 'SI', text: 'Sí' },
		{ value: 'NO', text: 'No' },
	];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenEmpleadoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = [];
		this.itemsPersonales = this.buildItemsPersonales();
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

	get tienePersonaBase(): boolean {
		return Number(this.model?.CORR_PERSONA ?? 0) > 0 && Number(this.model?.CORR_EMPLEADO ?? 0) > 0;
	}

	get readOnlyPersonales(): boolean {
		return this.banderaMtto === UpdateType.Not_Defined || this.banderaMtto === UpdateType.Browse;
	}

	/** Qué hace: apellido de casada solo aplica a mujer casada o viuda. */
	get apellidoCasadaHabilitado(): boolean {
		const estado = this.modelPersonaNatural?.ESTADO_CIVIL;
		return (
			!this.readOnlyPersonales &&
			this.modelPersonaNatural?.SEXO === 'FEMENINO' &&
			(estado === 'CASADO(A)' || estado === 'VIUDO(A)')
		);
	}

	/** Qué hace: indica si el registro está marcado como domiciliado. */
	get esDomiciliado(): boolean {
		return this.modelPersonaNatural?.DOMICILIADO === 'SI';
	}

	/** Qué hace: SI o NO ya elegido en Domiciliado (no "Seleccionar..."). */
	get tieneDomiciliadoSeleccionado(): boolean {
		const v = this.modelPersonaNatural?.DOMICILIADO;
		return v === 'SI' || v === 'NO';
	}

	/** Qué hace: país editable solo si ya eligió Domiciliado. */
	get paisNacimientoHabilitado(): boolean {
		return !this.readOnlyPersonales && this.tieneDomiciliadoSeleccionado;
	}

	/** Qué hace: depto/municipio/distrito editables solo si está domiciliado y el form no es solo lectura. */
	get territorioCompletoHabilitado(): boolean {
		return !this.readOnlyPersonales && this.esDomiciliado;
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

	fillPersonaNatural(xModel?: GenPersonaNatural): GenPersonaNatural {
		if (xModel) {
			return {
				CORR_PERSONA: Number(xModel.CORR_PERSONA ?? 0),
				CORR_PERSONA_NATURAL: Number(xModel.CORR_PERSONA_NATURAL ?? 0),
				PRIMER_NOMBRE: xModel.PRIMER_NOMBRE ?? '',
				SEGUNDO_NOMBRE: xModel.SEGUNDO_NOMBRE ?? '',
				PRIMER_APELLIDO: xModel.PRIMER_APELLIDO ?? '',
				SEGUNDO_APELLIDO: xModel.SEGUNDO_APELLIDO ?? '',
				APELLIDO_CASADA: xModel.APELLIDO_CASADA ?? '',
				NOMBRE_COMPLETO: xModel.NOMBRE_COMPLETO ?? '',
				FOTO_URL: xModel.FOTO_URL ?? '',
				SEXO: xModel.SEXO ?? '',
				ESTADO_CIVIL: xModel.ESTADO_CIVIL ?? '',
				NACIONALIDAD: xModel.NACIONALIDAD ?? '',
				EDAD: xModel.EDAD ?? null,
				FECHA_NACIMIENTO: xModel.FECHA_NACIMIENTO ?? null,
				ES_JUBILADO: !!xModel.ES_JUBILADO,
				POSEE_DISCAPACIDAD: !!xModel.POSEE_DISCAPACIDAD,
				TIPO_DISCAPACIDAD: xModel.TIPO_DISCAPACIDAD ?? '',
				CORR_RELIGION: xModel.CORR_RELIGION ?? null,
				NOMBRE_RELIGION: xModel.NOMBRE_RELIGION,
				IGLESIA_CONGREGA: xModel.IGLESIA_CONGREGA ?? '',
				CARTA_PASTORAL: xModel.CARTA_PASTORAL ?? '',
				ES_EXTRANJERO: !!xModel.ES_EXTRANJERO,
				DOMICILIADO: xModel.DOMICILIADO ?? '',
				CORR_PAIS_NACIMIENTO: xModel.CORR_PAIS_NACIMIENTO ?? null,
				NOMBRE_PAIS_NACIMIENTO: xModel.NOMBRE_PAIS_NACIMIENTO,
				CORR_DEPTO_NACIMIENTO: xModel.CORR_DEPTO_NACIMIENTO ?? null,
				NOMBRE_DEPTO_NACIMIENTO: xModel.NOMBRE_DEPTO_NACIMIENTO,
				CORR_MUNICIPIO_NACIMIENTO: xModel.CORR_MUNICIPIO_NACIMIENTO ?? null,
				NOMBRE_MUNICIPIO_NACIMIENTO: xModel.NOMBRE_MUNICIPIO_NACIMIENTO,
				CORR_DISTRITO_NACIMIENTO: xModel.CORR_DISTRITO_NACIMIENTO ?? null,
				NOMBRE_DISTRITO_NACIMIENTO: xModel.NOMBRE_DISTRITO_NACIMIENTO,
				CORR_ORIGEN_INGRESO: xModel.CORR_ORIGEN_INGRESO ?? null,
				NOMBRE_ORIGEN_INGRESO: xModel.NOMBRE_ORIGEN_INGRESO,
				CORR_TIPO_CONTRIBUYENTE: xModel.CORR_TIPO_CONTRIBUYENTE ?? null,
				NOMBRE_TIPO_CONTRIBUYENTE: xModel.NOMBRE_TIPO_CONTRIBUYENTE,
				CORR_ACTIVIDAD_ECONOMICA: xModel.CORR_ACTIVIDAD_ECONOMICA ?? null,
				NOMBRE_ACTIVIDAD_ECONOMICA: xModel.NOMBRE_ACTIVIDAD_ECONOMICA,
				USUARIO_CREA: xModel.USUARIO_CREA ?? '',
				ESTACION_CREA: xModel.ESTACION_CREA ?? '',
				FECHA_CREA: xModel.FECHA_CREA ?? null,
				USUARIO_ACTU: xModel.USUARIO_ACTU ?? '',
				ESTACION_ACTU: xModel.ESTACION_ACTU ?? '',
				FECHA_ACTU: xModel.FECHA_ACTU ?? null,
			};
		}

		return {
			CORR_PERSONA: 0,
			CORR_PERSONA_NATURAL: 0,
			PRIMER_NOMBRE: '',
			SEGUNDO_NOMBRE: '',
			PRIMER_APELLIDO: '',
			SEGUNDO_APELLIDO: '',
			APELLIDO_CASADA: '',
			NOMBRE_COMPLETO: '',
			FOTO_URL: '',
			SEXO: '',
			ESTADO_CIVIL: '',
			NACIONALIDAD: '',
			EDAD: null,
			FECHA_NACIMIENTO: null,
			ES_JUBILADO: false,
			POSEE_DISCAPACIDAD: false,
			TIPO_DISCAPACIDAD: '',
			CORR_RELIGION: null,
			IGLESIA_CONGREGA: '',
			CARTA_PASTORAL: '',
			ES_EXTRANJERO: false,
			DOMICILIADO: '',
			CORR_PAIS_NACIMIENTO: null,
			CORR_DEPTO_NACIMIENTO: null,
			CORR_MUNICIPIO_NACIMIENTO: null,
			CORR_DISTRITO_NACIMIENTO: null,
			CORR_ORIGEN_INGRESO: null,
			CORR_TIPO_CONTRIBUYENTE: null,
			CORR_ACTIVIDAD_ECONOMICA: null,
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
		this.modelPersonaNatural = this.fillPersonaNatural();
		this.limpiarLookupsTerritorio();
		this.subTituloVentana = this.formSubtituloNuevo;
		this.cargarLookupsBase();
		setTimeout(() => this.aplicarReglasPersonales(), 0);
	}

	// Qué hace: Guardar — Iniciar si es nuevo; si ya hay persona, guarda GEN_PERSONA_NATURAL.
	guardar(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		if (!this.tienePersonaBase) {
			this.iniciarEmpleado();
			return;
		}

		this.guardarPersonaNatural();
	}

	activar_inactivar(): void {
		this.notifyFx('Activar/Inactivar se implementará en la siguiente fase.', NotifyType.Warning);
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (!rowData) {
			return;
		}
		this.abrirFormulario(rowData, UpdateType.Not_Defined);
	}

	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}
		this.abrirFormulario(e.row.data, UpdateType.Update);
	}

	// Qué hace: elimina empleado desde la grilla (confirmación nativa DevExtreme).
	// Cómo: rowRemovingMtto + DELETE API; quita la fila en memoria sin GetAll.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_EMPLEADO)),
		});
	}

	override getPermiteEditar(_e?: any): boolean {
		return !!this.permiteEdit;
	}

	override getPermiteDele(_e?: any): boolean {
		return !!this.permiteDele;
	}

	get inicialesPersona(): string {
		const nombre = (this.model?.NOMBRE_EMPLEADO || this.modelPersonaNatural?.NOMBRE_COMPLETO || '').trim();
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
		const nombre = (this.model?.NOMBRE_EMPLEADO || this.modelPersonaNatural?.NOMBRE_COMPLETO || '').trim();
		if (nombre) {
			return nombre;
		}
		return this.esNuevo || !this.tienePersonaBase ? 'Nuevo empleado' : 'Empleado sin nombre';
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
			setTimeout(() => this.aplicarReglasPersonales(), 0);
		}
	}

	// Qué hace: al cambiar sexo/estado civil/discapacidad/domiciliado, aplica reglas de UI del tab Personales.
	onPersonalesFieldChanged(e: any): void {
		if (e?.dataField === 'SEXO' || e?.dataField === 'ESTADO_CIVIL') {
			this.aplicarReglaApellidoCasada();
		}
		if (e?.dataField === 'POSEE_DISCAPACIDAD') {
			// Cómo: usa e.value (ya actualizado) para no depender del timing del formData.
			this.modelPersonaNatural.POSEE_DISCAPACIDAD = !!e.value;
			this.aplicarReglaTipoDiscapacidad();
		}
		if (e?.dataField === 'DOMICILIADO') {
			this.modelPersonaNatural.DOMICILIADO = e.value ?? '';
			this.aplicarReglaDomiciliado();
		}
	}

	onPaisNacimientoChange(value: number): void {
		if (!this.paisNacimientoHabilitado) {
			this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = null;
			return;
		}
		this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = value || null;
		this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
		this.mCORR_MUNICIPIO_NACIMIENTO = [];
		this.mCORR_DISTRITO_NACIMIENTO = [];
		if (this.territorioCompletoHabilitado) {
			this.getCORR_DEPTO_NACIMIENTO(value);
		} else {
			this.mCORR_DEPTO_NACIMIENTO = [];
		}
	}

	onDeptoNacimientoChange(value: number): void {
		if (!this.territorioCompletoHabilitado) {
			this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
			return;
		}
		this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = value || null;
		this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
		this.mCORR_DISTRITO_NACIMIENTO = [];
		this.getCORR_MUNICIPIO_NACIMIENTO(this.modelPersonaNatural.CORR_PAIS_NACIMIENTO, value);
	}

	onMunicipioNacimientoChange(value: number): void {
		if (!this.territorioCompletoHabilitado) {
			this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
			return;
		}
		this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = value || null;
		this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
		this.getCORR_DISTRITO_NACIMIENTO(
			this.modelPersonaNatural.CORR_PAIS_NACIMIENTO,
			this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO,
			value
		);
	}

	selectedLookUpReligion(vRow: any): any {
		return vRow?.[0]?.CORR_RELIGION;
	}
	selectedLookUpOrigenIngreso(vRow: any): any {
		return vRow?.[0]?.CORR_ORIGEN_INGRESO;
	}
	selectedLookUpTipoContribuyente(vRow: any): any {
		return vRow?.[0]?.CORR_TIPO_CONTRIBUYENTE;
	}
	selectedLookUpActividadEconomica(vRow: any): any {
		return vRow?.[0]?.CORR_ACTIVIDAD_ECONOMICA;
	}
	selectedLookUpPaisNacimiento(vRow: any): any {
		return vRow?.[0]?.CORR_PAIS;
	}
	selectedLookUpDeptoNacimiento(vRow: any): any {
		return vRow?.[0]?.CORR_DEPTO;
	}
	selectedLookUpMunicipioNacimiento(vRow: any): any {
		return vRow?.[0]?.CORR_MUNICIPIO;
	}
	selectedLookUpDistritoNacimiento(vRow: any): any {
		return vRow?.[0]?.CORR_DISTRITO;
	}

	private abrirFormulario(rowData: GenEmpleado, modo: UpdateType): void {
		this.model = this.fillData(rowData);
		this.modelUpdate = this.fillData(rowData);
		this.AsignaStatus(modo);
		this.subTituloVentana = this.formSubtituloEditar;
		this.cargarLookupsBase();
		this.cargarPersonaNatural();
	}

	// Qué hace: crea GEN_PERSONA + GEN_EMPRESA_PERSONA + GEN_PERSONA_NATURAL (SP) + GEN_EMPLEADO.
	// Cómo: POST Iniciar con datos del tab Personales; parchea model/grid y recarga naturales.
	private iniciarEmpleado(): void {
		this.loadingVisible = true;
		this.service
			.iniciar(this.sanitizarPersonaNaturalPayload(this.modelPersonaNatural))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const row = this.fillData(response.Data);
					this.model = row;
					this.modelUpdate = this.fillData(row);
					this.aplicarRegistroEnGrid(row, true);
					this.AsignaStatus(UpdateType.Update);
					this.subTituloVentana = this.formSubtituloEditar;
					this.cargarPersonaNatural();
					this.notifyFx('Empleado creado. Puede seguir editando los datos personales.', NotifyType.Success, {
						raw: true,
					});
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: actualiza GEN_PERSONA_NATURAL del empleado (vía SP en GEN_EMPLEADO).
	// Cómo: Put PersonaNatural; si aún no hay corr (caso raro), Post; parchea nombre en panel.
	private guardarPersonaNatural(): void {
		if (!this.tienePersonaBase) {
			this.notifyFx('Primero debe iniciar el empleado (Guardar).', NotifyType.Warning);
			return;
		}

		const payload = this.sanitizarPersonaNaturalPayload({
			...this.modelPersonaNatural,
			CORR_PERSONA: Number(this.model.CORR_PERSONA),
		});

		const esAltaNatural = !(Number(payload.CORR_PERSONA_NATURAL) > 0);
		const action = esAltaNatural
			? this.service.createPersonaNatural(payload)
			: this.service.updatePersonaNatural(payload);

		this.loadingVisible = true;
		action.pipe(take(1)).subscribe({
			next: (response: any) => {
				this.loadingVisible = false;
				if (!response?.Result) {
					this.notifyApiResponse(response);
					return;
				}
				this.modelPersonaNatural = this.fillPersonaNatural(response.Data);
				if (this.modelPersonaNatural.NOMBRE_COMPLETO) {
					this.model.NOMBRE_EMPLEADO = this.modelPersonaNatural.NOMBRE_COMPLETO;
					this.aplicarRegistroEnGrid(this.fillData(this.model), false);
				}
				this.notifyFx(
					esAltaNatural ? 'Datos personales creados.' : 'Datos personales actualizados.',
					NotifyType.Success,
					{ raw: true }
				);
			},
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyApiError(error);
			},
		});
	}

	private cargarPersonaNatural(): void {
		const corrPersona = Number(this.model?.CORR_PERSONA ?? 0);
		if (corrPersona <= 0) {
			this.modelPersonaNatural = this.fillPersonaNatural();
			setTimeout(() => this.aplicarReglasPersonales(), 0);
			return;
		}

		this.service
			.getPersonaNatural(corrPersona)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && response.Data) {
						this.modelPersonaNatural = this.fillPersonaNatural(response.Data);
						this.refrescarTerritorioDesdeModelo();
						setTimeout(() => this.aplicarReglasPersonales(), 0);
						return;
					}
					this.modelPersonaNatural = this.fillPersonaNatural({
						...this.fillPersonaNatural(),
						CORR_PERSONA: corrPersona,
					});
					setTimeout(() => this.aplicarReglasPersonales(), 0);
				},
				error: () => {
					this.modelPersonaNatural = this.fillPersonaNatural({
						...this.fillPersonaNatural(),
						CORR_PERSONA: corrPersona,
					});
					setTimeout(() => this.aplicarReglasPersonales(), 0);
				},
			});
	}

	private aplicarReglasPersonales(): void {
		this.aplicarReglaApellidoCasada();
		this.aplicarReglaTipoDiscapacidad();
		this.aplicarReglaDomiciliado();
	}

	// Qué hace: convierte '' de selects/checks de dominio a null (el CHECK de BD no acepta '').
	// Cómo: clona el payload; sin Domiciliado no guarda territorio; si NO, solo país; si SI, completo.
	private sanitizarPersonaNaturalPayload(model: GenPersonaNatural | any): any {
		const vacioANull = (v: any) => (v === '' || v === undefined ? null : v);
		const domiciliado = vacioANull(model?.DOMICILIADO);
		const payload: any = {
			...model,
			SEXO: vacioANull(model?.SEXO),
			ESTADO_CIVIL: vacioANull(model?.ESTADO_CIVIL),
			CARTA_PASTORAL: vacioANull(model?.CARTA_PASTORAL),
			DOMICILIADO: domiciliado,
			TIPO_DISCAPACIDAD: vacioANull(model?.TIPO_DISCAPACIDAD),
			APELLIDO_CASADA: vacioANull(model?.APELLIDO_CASADA),
		};

		if (domiciliado !== 'SI' && domiciliado !== 'NO') {
			payload.CORR_PAIS_NACIMIENTO = null;
			payload.CORR_DEPTO_NACIMIENTO = null;
			payload.CORR_MUNICIPIO_NACIMIENTO = null;
			payload.CORR_DISTRITO_NACIMIENTO = null;
		} else if (domiciliado !== 'SI') {
			payload.CORR_DEPTO_NACIMIENTO = null;
			payload.CORR_MUNICIPIO_NACIMIENTO = null;
			payload.CORR_DISTRITO_NACIMIENTO = null;
		}

		return payload;
	}

	// Qué hace: habilita apellido de casada solo si es FEMENINO y CASADO(A) o VIUDO(A).
	// Cómo: limpia el valor si no aplica y marca el editor readOnly.
	private aplicarReglaApellidoCasada(): void {
		const habilitado = this.apellidoCasadaHabilitado;
		if (!habilitado) {
			this.modelPersonaNatural.APELLIDO_CASADA = '';
		}
		const editor = this.formPersonales?.instance?.getEditor('APELLIDO_CASADA');
		editor?.option('readOnly', !habilitado);
	}

	// Qué hace: controla territorio según Domiciliado (null / NO / SI).
	// Cómo: sin selección limpia todo; NO deja solo país; SI habilita cadena completa.
	private aplicarReglaDomiciliado(): void {
		if (!this.tieneDomiciliadoSeleccionado) {
			if (!this.readOnlyPersonales) {
				this.modelPersonaNatural.CORR_PAIS_NACIMIENTO = null;
				this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
				this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
				this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
			}
			this.limpiarLookupsTerritorio();
			return;
		}

		if (this.esDomiciliado) {
			if (this.readOnlyPersonales) {
				return;
			}
			const pais = this.modelPersonaNatural?.CORR_PAIS_NACIMIENTO;
			if (pais) {
				this.getCORR_DEPTO_NACIMIENTO(pais);
				const depto = this.modelPersonaNatural?.CORR_DEPTO_NACIMIENTO;
				if (depto) {
					this.getCORR_MUNICIPIO_NACIMIENTO(pais, depto);
					const municipio = this.modelPersonaNatural?.CORR_MUNICIPIO_NACIMIENTO;
					if (municipio) {
						this.getCORR_DISTRITO_NACIMIENTO(pais, depto, municipio);
					}
				}
			}
			return;
		}

		// DOMICILIADO = NO: solo país.
		this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO = null;
		this.modelPersonaNatural.CORR_DISTRITO_NACIMIENTO = null;
		this.limpiarLookupsTerritorio();
	}

	// Qué hace: muestra tipo discapacidad solo si posee discapacidad está activo.
	// Cómo: limpia el texto si no aplica y usa itemOption con ruta del grupo (name: situacion).
	private aplicarReglaTipoDiscapacidad(): void {
		const posee = !!this.modelPersonaNatural?.POSEE_DISCAPACIDAD;
		if (!posee) {
			this.modelPersonaNatural.TIPO_DISCAPACIDAD = '';
		}
		setTimeout(() => {
			this.formPersonales?.instance?.itemOption('situacion.TIPO_DISCAPACIDAD', 'visible', posee);
		}, 0);
	}

	private cargarLookupsBase(): void {
		this.getCORR_RELIGION();
		this.getCORR_ORIGEN_INGRESO();
		this.getCORR_TIPO_CONTRIBUYENTE();
		this.getCORR_ACTIVIDAD_ECONOMICA();
		this.getCORR_PAIS_NACIMIENTO();
	}

	private refrescarTerritorioDesdeModelo(): void {
		if (!this.tieneDomiciliadoSeleccionado) {
			this.limpiarLookupsTerritorio();
			return;
		}

		const pais = this.modelPersonaNatural.CORR_PAIS_NACIMIENTO;
		if (!pais) {
			this.limpiarLookupsTerritorio();
			return;
		}

		if (!this.esDomiciliado) {
			this.limpiarLookupsTerritorio();
			return;
		}

		const depto = this.modelPersonaNatural.CORR_DEPTO_NACIMIENTO;
		const municipio = this.modelPersonaNatural.CORR_MUNICIPIO_NACIMIENTO;
		this.getCORR_DEPTO_NACIMIENTO(pais);
		if (depto) {
			this.getCORR_MUNICIPIO_NACIMIENTO(pais, depto);
		}
		if (depto && municipio) {
			this.getCORR_DISTRITO_NACIMIENTO(pais, depto, municipio);
		}
	}

	private limpiarLookupsTerritorio(): void {
		this.mCORR_DEPTO_NACIMIENTO = [];
		this.mCORR_MUNICIPIO_NACIMIENTO = [];
		this.mCORR_DISTRITO_NACIMIENTO = [];
	}

	private getCORR_RELIGION(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_RELIGION', 'GetCORR_RELIGION', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_RELIGION = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_ORIGEN_INGRESO(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'GEN_ORIGEN_INGRESO',
				'GetCORR_ORIGEN_INGRESO',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_ORIGEN_INGRESO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_TIPO_CONTRIBUYENTE(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'GEN_TIPO_CONTRIBUYENTE',
				'GetCORR_TIPO_CONTRIBUYENTE',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_CONTRIBUYENTE = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_ACTIVIDAD_ECONOMICA(): void {
		this.appInfoService
			.getLookUp(
				'GEN_EMPLEADO',
				'GEN_ACTIVIDAD_ECONOMICA',
				'GetCORR_ACTIVIDAD_ECONOMICA',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_ACTIVIDAD_ECONOMICA = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_PAIS_NACIMIENTO(): void {
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_PAIS', 'GetCORR_PAIS', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_PAIS_NACIMIENTO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_DEPTO_NACIMIENTO(corrPais?: number | null): void {
		if (!corrPais) {
			this.mCORR_DEPTO_NACIMIENTO = [];
			return;
		}
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: corrPais }];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_DEPTO', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_DEPTO_NACIMIENTO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_MUNICIPIO_NACIMIENTO(corrPais?: number | null, corrDepto?: number | null): void {
		if (!corrPais || !corrDepto) {
			this.mCORR_MUNICIPIO_NACIMIENTO = [];
			return;
		}
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: corrPais },
			{ Parameter: 'CORR_DEPTO', Value: corrDepto },
		];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_MUNICIPIO_NACIMIENTO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	private getCORR_DISTRITO_NACIMIENTO(
		corrPais?: number | null,
		corrDepto?: number | null,
		corrMunicipio?: number | null
	): void {
		if (!corrPais || !corrDepto || !corrMunicipio) {
			this.mCORR_DISTRITO_NACIMIENTO = [];
			return;
		}
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: corrPais },
			{ Parameter: 'CORR_DEPTO', Value: corrDepto },
			{ Parameter: 'CORR_MUNICIPIO', Value: corrMunicipio },
		];
		this.appInfoService
			.getLookUp('GEN_EMPLEADO', 'GEN_DISTRITO', 'GetCORR_DISTRITO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_DISTRITO_NACIMIENTO = response?.Result ? response.Data ?? [] : [];
				},
			});
	}

	// Qué hace: define el formulario DevExtreme del tab Personales.
	// Cómo: campos de GEN_PERSONA_NATURAL + templates de lookup.
	private buildItemsPersonales(): any[] {
		return [
			{
				itemType: 'group',
				caption: 'Identidad',
				colCount: 2,
				items: [
					{ dataField: 'PRIMER_NOMBRE', label: { text: 'Primer nombre' }, editorOptions: { maxLength: 50 } },
					{ dataField: 'SEGUNDO_NOMBRE', label: { text: 'Segundo nombre' }, editorOptions: { maxLength: 50 } },
					{ dataField: 'PRIMER_APELLIDO', label: { text: 'Primer apellido' }, editorOptions: { maxLength: 50 } },
					{ dataField: 'SEGUNDO_APELLIDO', label: { text: 'Segundo apellido' }, editorOptions: { maxLength: 50 } },
					{
						dataField: 'SEXO',
						label: { text: 'Sexo' },
						editorType: 'dxSelectBox',
						editorOptions: {
							items: this.opcionesSexo,
							valueExpr: 'value',
							displayExpr: 'text',
							searchEnabled: true,
							showClearButton: true,
						},
					},
					{
						dataField: 'ESTADO_CIVIL',
						label: { text: 'Estado civil' },
						editorType: 'dxSelectBox',
						editorOptions: {
							items: this.opcionesEstadoCivil,
							valueExpr: 'value',
							displayExpr: 'text',
							searchEnabled: true,
							showClearButton: true,
						},
					},
					{
						dataField: 'APELLIDO_CASADA',
						label: { text: 'Apellido de casada' },
						editorOptions: { maxLength: 50, readOnly: true },
					},
					{ dataField: 'NACIONALIDAD', label: { text: 'Nacionalidad' }, editorOptions: { maxLength: 25 } },
					{
						dataField: 'FECHA_NACIMIENTO',
						label: { text: 'Fecha nacimiento' },
						editorType: 'dxDateBox',
						editorOptions: { displayFormat: 'dd/MM/yyyy', type: 'date' },
					},
					{ dataField: 'EDAD', label: { text: 'Edad' }, editorType: 'dxNumberBox', editorOptions: { min: 0 } },
				],
			},
			{
				itemType: 'group',
				name: 'situacion',
				caption: 'Situación',
				colCount: 2,
				items: [
					{ dataField: 'ES_JUBILADO', label: { text: 'Es jubilado' }, editorType: 'dxCheckBox' },
					{ dataField: 'POSEE_DISCAPACIDAD', label: { text: 'Posee discapacidad' }, editorType: 'dxCheckBox' },
					{ dataField: 'ES_EXTRANJERO', label: { text: 'Es extranjero' }, editorType: 'dxCheckBox' },
					{
						dataField: 'DOMICILIADO',
						label: { text: 'Domiciliado' },
						editorType: 'dxSelectBox',
						editorOptions: { items: this.opcionesSiNo, valueExpr: 'value', displayExpr: 'text' },
					},
					{
						dataField: 'TIPO_DISCAPACIDAD',
						name: 'TIPO_DISCAPACIDAD',
						label: { text: 'Tipo discapacidad' },
						colSpan: 2,
						visible: false,
						editorOptions: { maxLength: 250 },
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Religión',
				colCount: 2,
				items: [
					{ dataField: 'CORR_RELIGION', label: { text: 'Religión' }, template: 'CORR_RELIGIONLookup' },
					{ dataField: 'IGLESIA_CONGREGA', label: { text: 'Iglesia' }, editorOptions: { maxLength: 50 } },
					{
						dataField: 'CARTA_PASTORAL',
						label: { text: 'Carta pastoral' },
						editorType: 'dxSelectBox',
						editorOptions: { items: this.opcionesSiNo, valueExpr: 'value', displayExpr: 'text' },
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Lugar de nacimiento',
				colCount: 2,
				items: [
					{ dataField: 'CORR_PAIS_NACIMIENTO', label: { text: 'País' }, template: 'CORR_PAIS_NACIMIENTOLookup' },
					{ dataField: 'CORR_DEPTO_NACIMIENTO', label: { text: 'Departamento' }, template: 'CORR_DEPTO_NACIMIENTOLookup' },
					{
						dataField: 'CORR_MUNICIPIO_NACIMIENTO',
						label: { text: 'Municipio' },
						template: 'CORR_MUNICIPIO_NACIMIENTOLookup',
					},
					{
						dataField: 'CORR_DISTRITO_NACIMIENTO',
						label: { text: 'Distrito' },
						template: 'CORR_DISTRITO_NACIMIENTOLookup',
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Tributario',
				colCount: 2,
				items: [
					{
						dataField: 'CORR_ORIGEN_INGRESO',
						label: { text: 'Origen ingreso' },
						template: 'CORR_ORIGEN_INGRESOLookup',
					},
					{
						dataField: 'CORR_TIPO_CONTRIBUYENTE',
						label: { text: 'Tipo contribuyente' },
						template: 'CORR_TIPO_CONTRIBUYENTELookup',
					},
					{
						dataField: 'CORR_ACTIVIDAD_ECONOMICA',
						label: { text: 'Actividad económica' },
						template: 'CORR_ACTIVIDAD_ECONOMICALookup',
						colSpan: 2,
					},
				],
			},
		];
	}
}
