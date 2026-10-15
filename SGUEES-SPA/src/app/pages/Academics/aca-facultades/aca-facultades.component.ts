// Qué hace: vista de mantenimiento de Facultades (Académico › Tablas Generales).
// Cómo lo hace: patrón A+ con estado de catálogo (gen-actividad-economica) más la sección hija
//               "Sedes de la Facultad" (patrón de detalle de seg-flujo-actor). Las reglas que dependen de carreras y
//               períodos (no desactivar con carreras activas, no eliminar con dependencias) las aplica el API.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { AcaFacultadesSedesService } from './aca-facultades-sedes/aca-facultades-sedes.service';
import { AcaFacultadesSedes } from './aca-facultades-sedes/models/aca-facultades-sedes';
import { AcaFacultades } from './models/aca-facultades';
import { AcaFacultadesService } from './aca-facultades.service';

const ESTADO_FIELD = 'ACTIVO';

interface SedeLookup {
	CORR_SEDE: number;
	CODIGO_SEDE: string;
	NOMBRE_SEDE: string;
}

@Component({
	selector: 'app-aca-facultades',
	templateUrl: './aca-facultades.component.html',
	styleUrls: ['./aca-facultades.component.scss'],
})
// Qué hace: componente de mantenimiento de Facultades.
// Cómo lo hace: extiende CBaseComponent para el encabezado y administra a mano el estado de la sección de sedes.
export class AcaFacultadesComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridFacultades', { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la facultad';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_FACULTAD';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_FACULTAD';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	// Sección "Sedes de la Facultad"
	sedeModels: AcaFacultadesSedes[] = [];
	sedeModel: AcaFacultadesSedes = this.fillSedeData(0);
	sedeColumns: any[] = [];
	sedeItems: any[] = [];
	sedesLookup: SedeLookup[] = [];
	banderaMttoSede: UpdateType = UpdateType.Browse;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Facultades';
	// Qué hace: recuerda si cambiaron las sedes para refrescar la columna "Sedes" del grid al volver.
	private sedesCambiaron = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaFacultadesService,
		private sedeService: AcaFacultadesSedesService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.sedeColumns = this.sedeService.getColumns();
		this.sedeItems = this.sedeService.getItems();
	}

	// Qué hace: entrega el grid de mantenimiento al flujo base de CBaseComponent.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: inicializa la vista: subtítulo, catálogo y combo de sedes.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
		this.cargarSedesLookup();
	}

	// Qué hace: al volver a Browse restaura el subtítulo, limpia la sección de sedes y, si cambiaron, recarga el grid.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.limpiarSedes();
			if (this.sedesCambiaron) {
				this.sedesCambiaron = false;
				this.consultar();
			}
		}
	}

	fillParam(xCORR_FACULTAD?: number): any {
		return { CORR_FACULTAD: xCORR_FACULTAD ?? 0 };
	}

	// Qué hace: construye el modelo de la facultad para el formulario (copia o registro nuevo).
	override fillData(xModel?: AcaFacultades): AcaFacultades {
		if (xModel !== undefined) {
			return {
				CORR_FACULTAD: xModel.CORR_FACULTAD,
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CODIGO_FACULTAD: xModel.CODIGO_FACULTAD,
				NOMBRE_FACULTAD: `${xModel.NOMBRE_FACULTAD ?? ''}`.trim(),
				ACTIVO: xModel.ACTIVO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				CARRERAS_ACTIVAS: xModel.CARRERAS_ACTIVAS,
				CARRERAS: xModel.CARRERAS,
				PERIODOS: xModel.PERIODOS,
				SEDES: xModel.SEDES,
			};
		}

		return {
			CORR_FACULTAD: 0,
			CORR_EMPRESA: 1,
			CODIGO_FACULTAD: '',
			NOMBRE_FACULTAD: '',
			ACTIVO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
			CARRERAS_ACTIVAS: 0,
			CARRERAS: 0,
			PERIODOS: 0,
			SEDES: '',
		};
	}

	// Qué hace: carga las facultades y refresca la grilla.
	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Qué hace: refleja en la grilla el registro guardado sin volver a consultar.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaFacultades);
		const key = this.mttoGridKeyExpr as keyof AcaFacultades;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) => (i === index ? this.fillData({ ...item, ...record }) : item));
			}
		}

		this.ordenarModelsPorCorr();
		this.refrescarGridTrasCarga(isAdd);
	}

	// Qué hace: retira de la grilla el registro eliminado.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof AcaFacultades;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Qué hace: abre la facultad en modo consulta (formulario y sedes en solo lectura).
	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		super.rowDblClick(e);
		this.consultarSedes(this.model?.CORR_FACULTAD);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.bloquear();
		});
	}

	// Qué hace: abre la facultad para editarla y carga sus sedes.
	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}

		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		this.consultarSedes(this.model.CORR_FACULTAD);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	// Qué hace: inicia una facultad nueva. Las sedes se asignan después de guardarla (al volver a abrirla).
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.limpiarSedes();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: valida y guarda la facultad; al terminar la pantalla vuelve al grid (guardarMtto).
	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}
		this.model = this.service.normalizar(this.model);
		this.dataForm?.instance?.option('formData', this.model);

		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValido(this.model, this.notifyFx.bind(this));
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	// Qué hace: descarta la edición en curso (con la confirmación del componente base).
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_FACULTAD === this.modelUpdate.CORR_FACULTAD);
	}

	// Qué hace: elimina la facultad. Si tiene carreras o períodos, el API responde con el motivo.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_FACULTAD)),
		});
	}

	// Qué hace: activa o desactiva la facultad enfocada. Con carreras activas, el API no deja desactivarla.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: deja el formulario en solo lectura (modo consulta).
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_FACULTAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_FACULTAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_FACULTAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	// Qué hace: habilita los campos editables. El código queda fijo al editar y el estado solo cambia con
	//           Activar/Desactivar; al crear se pueden escribir ambos.
	override habilitar(): void {
		const esEdicion = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_FACULTAD')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CODIGO_FACULTAD')?.option('readOnly', esEdicion);
			this.dataForm.instance.getEditor('NOMBRE_FACULTAD')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', esEdicion);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			const campo = this.banderaMtto === UpdateType.Update ? 'NOMBRE_FACULTAD' : 'CODIGO_FACULTAD';
			this.dataForm.instance.getEditor(campo)?.focus();
		});
	}

	//#region Sección "Sedes de la Facultad"

	// Qué hace: la sección aparece al abrir una facultad ya guardada.
	mostrarSedes(): boolean {
		return !this.isBrowse() && Number(this.model?.CORR_FACULTAD) > 0;
	}

	isSedeBrowse(): boolean {
		return this.banderaMttoSede === UpdateType.Browse;
	}

	isSedeForm(): boolean {
		return !this.isSedeBrowse();
	}

	// Qué hace: las sedes solo se modifican al editar la facultad (no en modo consulta) y con permiso U,
	//           el mismo que exige el API para el detalle.
	get puedeModificarSedes(): boolean {
		return this.banderaMtto === UpdateType.Update && !!this.permiteEdit;
	}

	// Qué hace: sedes del combo al asignar: las activas que la facultad aún no tiene.
	get sedesDisponibles(): SedeLookup[] {
		if (!this.isSedeBrowse() && this.banderaMttoSede === UpdateType.Update) {
			return this.sedesLookup.filter((s) => s.CORR_SEDE === this.sedeModel.CORR_SEDE);
		}
		const asignadas = new Set(this.sedeModels.map((s) => s.CORR_SEDE));
		return this.sedesLookup.filter((s) => !asignadas.has(s.CORR_SEDE));
	}

	fillSedeData(corrFacultad: number, xModel?: AcaFacultadesSedes): AcaFacultadesSedes {
		if (xModel !== undefined) {
			return { ...xModel };
		}
		return {
			CORR_FACULTAD: corrFacultad,
			CORR_SEDE: null,
			ACTIVO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultarSedes(corrFacultad?: number): void {
		this.banderaMttoSede = UpdateType.Browse;
		if (!corrFacultad) {
			this.sedeModels = [];
			return;
		}

		this.sedeService
			.getAll(corrFacultad)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.sedeModels = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	nuevoSede(): void {
		if (!this.sedesDisponibles.length) {
			this.notifyFx('La facultad ya está asignada a todas las sedes activas.', NotifyType.Warning);
			return;
		}
		this.sedeModel = this.fillSedeData(this.model.CORR_FACULTAD);
		this.banderaMttoSede = UpdateType.Add;
	}

	editarSede(e: any): void {
		if (!this.puedeModificarSedes) {
			return;
		}
		const sede = e?.row?.data || e?.data || e;
		this.sedeModel = this.fillSedeData(this.model.CORR_FACULTAD, sede);
		this.banderaMttoSede = UpdateType.Update;
	}

	cancelarSede(): void {
		this.banderaMttoSede = UpdateType.Browse;
		this.sedeModel = this.fillSedeData(this.model?.CORR_FACULTAD ?? 0);
	}

	guardarSede(): void {
		if (!this.sedeService.esValido(this.sedeModel, this.notifyFx.bind(this))) {
			return;
		}

		const esNueva = this.banderaMttoSede === UpdateType.Add;
		const modelo: AcaFacultadesSedes = { ...this.sedeModel, CORR_FACULTAD: this.model.CORR_FACULTAD };
		const request = esNueva ? this.sedeService.insert(modelo) : this.sedeService.update(modelo);

		this.loadingVisible = true;
		request.pipe(take(1)).subscribe({
			next: (response: any) => {
				this.loadingVisible = false;
				if (!response?.Result) {
					this.notifyFx(response?.ErrorMessage, NotifyType.Error);
					return;
				}
				this.notifyFx(esNueva ? 'Registro creado con exito!' : 'Registro modificado con exito!', NotifyType.Success);
				this.sedesCambiaron = true;
				this.consultarSedes(this.model.CORR_FACULTAD);
			},
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyFx(error, NotifyType.Error);
			},
		});
	}

	// Qué hace: quita la sede. Como rowRemovingMtto, cancela el borrado local del grid y recarga desde el API.
	rowRemovingSede(e: any): void {
		e.cancel = true;
		const sede = e?.data as AcaFacultadesSedes;
		if (!sede || !this.puedeModificarSedes) {
			return;
		}

		this.loadingVisible = true;
		this.sedeService
			.delete({ ...sede, CORR_FACULTAD: this.model.CORR_FACULTAD })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyFx(response?.ErrorMessage, NotifyType.Error);
						return;
					}
					this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
					this.sedesCambiaron = true;
					this.consultarSedes(this.model.CORR_FACULTAD);
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	//#endregion

	// Qué hace: mantiene los registros ordenados por correlativo.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_FACULTAD) - Number(b.CORR_FACULTAD));
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	private limpiarSedes(): void {
		this.sedeModels = [];
		this.banderaMttoSede = UpdateType.Browse;
		this.sedeModel = this.fillSedeData(0);
	}

	// Qué hace: carga una vez el combo de sedes activas (GEN_SEDES con el permiso de /aca-facultades).
	private cargarSedesLookup(): void {
		this.appInfoService
			.getLookUp('ACA_FACULTADES_SEDES', 'GEN_SEDES', 'GetCORR_SEDE', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.sedesLookup = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}
}
