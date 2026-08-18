import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxProgressBarModule } from 'devextreme-angular/ui/progress-bar';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ThemeService } from 'src/app/shared/services';
import {
	CompletarFormularioEmpleoPayload,
	CompetenciaRow,
	createEmptyFormData,
	createFamiliaresDirectos,
	EstudioRow,
	ExperienciaRow,
	FamiliarDirecto,
	FamiliarUeesRow,
	FormularioEmpleoData,
	HijoRow,
	IdiomaRow,
	PORTAL_STEPS,
	PortalPaso,
	PortalStepMeta,
} from './formulario-empleo-form.models';
import {
	calcularProgresoFormulario,
	formatoBucket,
	FormularioProgressSnapshot,
	ProgressBucket,
} from './formulario-empleo-form.progress';
import { FormularioEmpleoFormService } from './formulario-empleo-form.service';

type ModalTabla =
	| 'hijo'
	| 'estudio'
	| 'idioma'
	| 'competencia'
	| 'experiencia'
	| 'familiarUees';

@Component({
	selector: 'formulario-empleo-form',
	templateUrl: './formulario-empleo-form.component.html',
	styleUrls: ['./formulario-empleo-form.component.scss'],
})
export class FormularioEmpleoFormComponent implements OnInit, OnDestroy {
	token = '';
	validandoToken = true;
	tokenValido = false;
	enviando = false;
	fotoSubiendo = false;
	completado = false;
	mensajeToken = '';

	/** 0 = bienvenida; 1–6 = pasos del wizard */
	pasoActual: PortalPaso = 0;
	/** Mayor paso visitado (para chips de secciones solo opcionales). */
	maxPasoAlcanzado: PortalPaso = 0;
	readonly steps: PortalStepMeta[] = PORTAL_STEPS;
	readonly totalPasos = 6;
	readonly hoy = new Date();

	formData: FormularioEmpleoData = createEmptyFormData();
	familiaresDirectos: FamiliarDirecto[] = createFamiliaresDirectos();
	hijos: HijoRow[] = [];
	estudios: EstudioRow[] = [];
	idiomas: IdiomaRow[] = [];
	competencias: CompetenciaRow[] = [];
	experiencias: ExperienciaRow[] = [];
	familiaresUees: FamiliarUeesRow[] = [];

	/** Modal CRUD de tablas dinámicas */
	modalVisible = false;
	modalTipo: ModalTabla | null = null;
	modalEditando = false;
	modalDraft: any = {};
	private modalEditId: number | null = null;

	private nextRowId = 1;
	private temaAnteriorId = '';
	/**
	 * Visibilidad del formulario según tipo de contratación de la solicitud.
	 * true (o tipo 0/null) = permanente / mostrar todos.
	 * false = eventual: por ahora solo se oculta el paso 5.
	 */
	esFormularioCompleto = true;

	readonly sexoOptions = [
		{ value: 'M', text: 'Masculino' },
		{ value: 'F', text: 'Femenino' },
	];

	readonly estadoCivilOptions = [
		{ value: 'Soltero(a)', text: 'Soltero(a)' },
		{ value: 'Casado(a)', text: 'Casado(a)' },
		{ value: 'Acompañado(a)', text: 'Acompañado(a)' },
		{ value: 'Divorciado(a)', text: 'Divorciado(a)' },
		{ value: 'Viudo(a)', text: 'Viudo(a)' },
	];

	readonly disponibilidadOptions = [
		{ value: 'Inmediata', text: 'Inmediata' },
		{ value: '15 días', text: '15 días' },
		{ value: '30 días', text: '30 días' },
		{ value: 'Negociable', text: 'Negociable' },
	];

	readonly nivelAcademicoOptions = [
		'Educación básica',
		'Bachillerato',
		'Técnico',
		'Universidad',
		'Postgrado',
		'Maestría',
		'Doctorado',
	];

	readonly nivelIdiomaOptions = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];
	readonly nivelCompetenciaOptions = ['Básico', 'Intermedio', 'Avanzado', 'Experto'];

	constructor(
		private route: ActivatedRoute,
		private service: FormularioEmpleoFormService,
		private messageService: MessageService,
		private themeService: ThemeService
	) {}

	get enWizard(): boolean {
		return this.tokenValido && !this.completado && this.pasoActual >= 1;
	}

	get pasoMeta(): PortalStepMeta | undefined {
		return this.steps.find((s) => s.id === this.pasoActual);
	}

	get progreso(): FormularioProgressSnapshot {
		return calcularProgresoFormulario({
			formData: this.formData,
			familiaresDirectos: this.familiaresDirectos,
			hijos: this.hijos,
			estudios: this.estudios,
			idiomas: this.idiomas,
			competencias: this.competencias,
			experiencias: this.experiencias,
			familiaresUees: this.familiaresUees,
			maxPasoAlcanzado: this.maxPasoAlcanzado,
			esFormularioCompleto: this.esFormularioCompleto,
		});
	}

	get progresoPct(): number {
		if (this.pasoActual < 1) {
			return 0;
		}
		return this.progreso.porcentaje;
	}

	get progresoLabel(): string {
		const total = this.progreso.total;
		if (total.total <= 0) {
			return 'Aún no hay campos contemplados';
		}
		return `Llenaste ${total.llenos} de ${total.total} campos`;
	}

	get progresoDetalle(): string {
		const p = this.progreso;
		return `Requeridos ${formatoBucket(p.requeridos)} · Opcionales ${formatoBucket(p.opcionales)}`;
	}

	formatoProgreso(bucket: ProgressBucket): string {
		return formatoBucket(bucket);
	}

	get pasosVisibles(): PortalStepMeta[] {
		return this.steps.filter((s) => this.mostrarPaso(s.id));
	}

	/**
	 * Punto único para mostrar/ocultar pasos según ES_PERMANENTE.
	 * Hoy: paso 5 (familiares UEES) solo si el tipo es permanente o no hay tipo.
	 */
	mostrarPaso(paso: PortalPaso): boolean {
		if (paso === 5 && !this.esFormularioCompleto) {
			return false;
		}
		return true;
	}

	pasoCompleto(paso: PortalPaso): boolean {
		if (paso === 6) {
			return this.progreso.declaraciones.requeridasCompletas;
		}
		return this.progreso.pasos.find((p) => p.paso === paso)?.completoRequeridos ?? false;
	}

	private registrarPasoAlcanzado(paso: PortalPaso): void {
		if (paso > this.maxPasoAlcanzado) {
			this.maxPasoAlcanzado = paso;
		}
	}

	get modalTitulo(): string {
		const accion = this.modalEditando ? 'Editar' : 'Agregar';
		switch (this.modalTipo) {
			case 'hijo':
				return `${accion} hijo`;
			case 'estudio':
				return `${accion} estudio`;
			case 'idioma':
				return `${accion} idioma`;
			case 'competencia':
				return `${accion} competencia`;
			case 'experiencia':
				return `${accion} experiencia`;
			case 'familiarUees':
				return `${accion} familiar UEES`;
			default:
				return accion;
		}
	}

	get modalAncho(): number {
		return this.modalTipo === 'experiencia' ? 680 : 520;
	}

	ngOnInit(): void {
		this.temaAnteriorId = this.themeService.getCurrentThemeId();
		if (this.themeService.currentTheme !== 'light') {
			this.themeService.setAppTheme('fluent-blue-light');
		}

		this.token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
		void this.validarToken();
	}

	ngOnDestroy(): void {
		if (this.temaAnteriorId && this.temaAnteriorId !== this.themeService.getCurrentThemeId()) {
			this.themeService.setAppTheme(this.temaAnteriorId);
		}
	}

	comenzarSolicitud(): void {
		this.pasoActual = 1;
		this.registrarPasoAlcanzado(1);
	}

	volverBienvenida(): void {
		this.pasoActual = 0;
	}

	irAPaso(paso: PortalPaso): void {
		if (paso < 1 || paso > this.totalPasos || !this.mostrarPaso(paso)) {
			return;
		}
		if (paso <= this.pasoActual || paso === this.siguientePasoVisible(this.pasoActual)) {
			this.pasoActual = paso;
			this.registrarPasoAlcanzado(paso);
		}
	}

	puedeNavegarAPaso(paso: PortalPaso): boolean {
		if (!this.mostrarPaso(paso)) {
			return false;
		}
		if (paso <= this.pasoActual) {
			return true;
		}
		return paso === this.siguientePasoVisible(this.pasoActual);
	}

	anterior(): void {
		if (this.pasoActual <= 1) {
			this.volverBienvenida();
			return;
		}
		const previo = this.anteriorPasoVisible(this.pasoActual);
		if (previo < 1) {
			this.volverBienvenida();
			return;
		}
		this.pasoActual = previo;
	}

	siguiente(): void {
		const errorPaso = this.validarPasoActual();
		if (errorPaso) {
			this.mostrarError(errorPaso);
			return;
		}
		const siguiente = this.siguientePasoVisible(this.pasoActual);
		if (siguiente > this.pasoActual) {
			this.pasoActual = siguiente;
			this.registrarPasoAlcanzado(this.pasoActual);
		}
	}

	/** Siguiente paso visible (salta el 5 si el tipo es eventual). */
	private siguientePasoVisible(desde: PortalPaso): PortalPaso {
		for (let paso = desde + 1; paso <= this.totalPasos; paso++) {
			if (this.mostrarPaso(paso as PortalPaso)) {
				return paso as PortalPaso;
			}
		}
		return desde;
	}

	private anteriorPasoVisible(desde: PortalPaso): PortalPaso {
		for (let paso = desde - 1; paso >= 1; paso--) {
			if (this.mostrarPaso(paso as PortalPaso)) {
				return paso as PortalPaso;
			}
		}
		return 0;
	}

	onFechaNacimientoChanged(value: Date | null): void {
		this.formData.FECHA_NACIMIENTO = value;
		this.formData.EDAD = this.calcularEdad(value);
	}

	async onFotoFileChange(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		const errorArchivo = this.validarArchivoFoto(file);
		if (errorArchivo) {
			input.value = '';
			this.mostrarError(errorArchivo);
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			this.formData.FOTO_URL = typeof reader.result === 'string' ? reader.result : '';
		};
		reader.readAsDataURL(file);

		this.fotoSubiendo = true;
		try {
			const response: any = await firstValueFrom(this.service.subirFoto(this.token, file));
			if (!response?.Result) {
				this.formData.FOTO_URL = '';
				input.value = '';
				this.mostrarError(response?.ErrorMessage || 'No fue posible subir la fotografía.');
			}
		} catch (error: any) {
			this.formData.FOTO_URL = '';
			input.value = '';
			this.mostrarError(this.extraerMensajeErrorHttp(error));
		} finally {
			this.fotoSubiendo = false;
		}
	}

	private validarArchivoFoto(file: File): string | null {
		const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
		if (!tiposPermitidos.includes((file.type || '').toLowerCase())) {
			return 'Formato no permitido. Use JPG, PNG o WEBP.';
		}
		if (file.size > 5 * 1024 * 1024) {
			return 'La fotografía no debe superar 5 MB.';
		}
		return null;
	}

	// ─── Modal tablas ─────────────────────────────────────────────────────────

	abrirModalNuevo(tipo: ModalTabla): void {
		this.modalTipo = tipo;
		this.modalEditando = false;
		this.modalEditId = null;
		this.modalDraft = this.createDraft(tipo);
		this.modalVisible = true;
	}

	abrirModalEditar(tipo: ModalTabla, row: any): void {
		this.modalTipo = tipo;
		this.modalEditando = true;
		this.modalEditId = Number(row.ID);
		this.modalDraft = { ...row };
		this.modalVisible = true;
	}

	cerrarModal(): void {
		this.modalVisible = false;
		this.modalTipo = null;
		this.modalEditando = false;
		this.modalEditId = null;
		this.modalDraft = {};
	}

	guardarModal(): void {
		if (!this.modalTipo) {
			return;
		}
		const error = this.validarDraft(this.modalTipo, this.modalDraft);
		if (error) {
			this.mostrarError(error);
			return;
		}

		const draft = { ...this.modalDraft };
		if (this.modalTipo === 'hijo') {
			draft.EDAD = this.calcularEdad(draft.FECHA_NACIMIENTO ?? null);
		}

		if (this.modalEditando && this.modalEditId != null) {
			this.actualizarFila(this.modalTipo, this.modalEditId, draft);
		} else {
			draft.ID = this.nextRowId++;
			this.insertarFila(this.modalTipo, draft);
		}
		this.cerrarModal();
	}

	eliminarFila(tipo: ModalTabla, row: any): void {
		const id = Number(row.ID);
		switch (tipo) {
			case 'hijo':
				this.hijos = this.hijos.filter((x) => x.ID !== id);
				break;
			case 'estudio':
				this.estudios = this.estudios.filter((x) => x.ID !== id);
				break;
			case 'idioma':
				this.idiomas = this.idiomas.filter((x) => x.ID !== id);
				break;
			case 'competencia':
				this.competencias = this.competencias.filter((x) => x.ID !== id);
				break;
			case 'experiencia':
				this.experiencias = this.experiencias.filter((x) => x.ID !== id);
				break;
			case 'familiarUees':
				this.familiaresUees = this.familiaresUees.filter((x) => x.ID !== id);
				break;
		}
	}

	onModalHijoFechaChanged(value: Date | null): void {
		this.modalDraft.FECHA_NACIMIENTO = value;
		this.modalDraft.EDAD = this.calcularEdad(value);
	}

	sexoDisplay = (row: any): string => {
		const found = this.sexoOptions.find((x) => x.value === row?.SEXO);
		return found?.text ?? row?.SEXO ?? '';
	};

	async validarToken(): Promise<void> {
		this.validandoToken = true;
		this.tokenValido = false;
		this.esFormularioCompleto = true;
		this.pasoActual = 0;

		if (!this.token) {
			this.mensajeToken = 'El enlace es inválido, expiró o ya fue utilizado.';
			this.validandoToken = false;
			return;
		}

		try {
			const response: any = await firstValueFrom(this.service.validarToken(this.token));
			this.tokenValido = response.Result === true && response.Data?.VALIDO === true;
			this.esFormularioCompleto = this.resolverFormularioCompleto(response.Data);
			this.mensajeToken = this.tokenValido
				? ''
				: 'El enlace es inválido, expiró o ya fue utilizado.';
		} catch {
			this.mensajeToken = 'No fue posible validar el enlace. Inténtalo nuevamente.';
		} finally {
			this.validandoToken = false;
		}
	}

	/** Tipo 0/null → todos los campos. Eventual (ES_PERMANENTE false) → recortado. */
	private resolverFormularioCompleto(data: any): boolean {
		const corrTipo = Number(data?.CORR_TIPO_CONTRATACION ?? 0);
		if (!Number.isFinite(corrTipo) || corrTipo <= 0) {
			return true;
		}
		return data?.ES_PERMANENTE === true;
	}

	async onSubmit(): Promise<void> {
		if (!this.tokenValido || this.enviando) {
			return;
		}
		if (this.fotoSubiendo) {
			this.mostrarError('Espere a que termine de subir la fotografía.');
			return;
		}

		const errorCampos = this.validarCamposRequeridos();
		if (errorCampos) {
			this.mostrarError(errorCampos.mensaje);
			this.pasoActual = errorCampos.paso;
			return;
		}

		if (!this.formData.DECLARA_VERDAD || !this.formData.AUTORIZA_VERIFICACION) {
			this.mostrarError('Debes aceptar las declaraciones para enviar la solicitud.');
			return;
		}

		this.enviando = true;
		this.formData.FECHA_DECLARACION = new Date();

		try {
			const payload = this.construirPayloadCompletar();
			const response: any = await firstValueFrom(
				this.service.completar(payload)
			);

			if (response.Result) {
				this.completado = true;
				this.tokenValido = false;
				this.pasoActual = 0;
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: 'La solicitud fue enviada correctamente.',
					life: 4000,
				});
			} else {
				this.mostrarError(response.ErrorMessage || 'No fue posible enviar la solicitud.');
			}
		} catch (error: any) {
			const mensaje = this.extraerMensajeErrorHttp(error);
			this.mostrarError(mensaje);

			// Solo revalidar token si el fallo no fue validación de campos (400 ProblemDetails).
			const esValidacionModelo = !!error?.error?.errors;
			if (!esValidacionModelo) {
				await this.validarToken();
			}
		} finally {
			this.enviando = false;
		}
	}

	private createDraft(tipo: ModalTabla): any {
		switch (tipo) {
			case 'hijo':
				return { NOMBRE: '', EDAD: null, SEXO: '', FECHA_NACIMIENTO: null };
			case 'estudio':
				return { NIVEL: '', INSTITUCION: '', DESDE: null, HASTA: null, TITULO: '' };
			case 'idioma':
				return { IDIOMA: '', NIVEL: '' };
			case 'competencia':
				return { HERRAMIENTA: '', NIVEL: '' };
			case 'experiencia':
				return {
					EMPRESA: '',
					TELEFONO: '',
					CARGO: '',
					JEFE_INMEDIATO: '',
					FECHA_INICIO: null,
					FECHA_FIN: null,
					SALARIO_INICIAL: null,
					SALARIO_FINAL: null,
					MOTIVO_SALIDA: '',
				};
			case 'familiarUees':
				return { NOMBRE: '', PARENTESCO: '', UNIDAD: '', TELEFONO: '' };
		}
	}

	private validarDraft(tipo: ModalTabla, draft: any): string | null {
		switch (tipo) {
			case 'hijo':
				if (!`${draft.NOMBRE ?? ''}`.trim()) {
					return 'El nombre del hijo es requerido.';
				}
				return null;
			case 'estudio':
				if (!`${draft.NIVEL ?? ''}`.trim() || !`${draft.INSTITUCION ?? ''}`.trim()) {
					return 'Nivel e institución son requeridos.';
				}
				return null;
			case 'idioma':
				if (!`${draft.IDIOMA ?? ''}`.trim() || !`${draft.NIVEL ?? ''}`.trim()) {
					return 'Idioma y nivel son requeridos.';
				}
				return null;
			case 'competencia':
				if (!`${draft.HERRAMIENTA ?? ''}`.trim() || !`${draft.NIVEL ?? ''}`.trim()) {
					return 'Herramienta y nivel son requeridos.';
				}
				return null;
			case 'experiencia':
				if (!`${draft.EMPRESA ?? ''}`.trim() || !`${draft.CARGO ?? ''}`.trim()) {
					return 'Empresa y cargo son requeridos.';
				}
				return null;
			case 'familiarUees':
				if (!`${draft.NOMBRE ?? ''}`.trim()) {
					return 'El nombre del familiar es requerido.';
				}
				return null;
			default:
				return null;
		}
	}

	private insertarFila(tipo: ModalTabla, draft: any): void {
		switch (tipo) {
			case 'hijo':
				this.hijos = [...this.hijos, draft as HijoRow];
				break;
			case 'estudio':
				this.estudios = [...this.estudios, draft as EstudioRow];
				break;
			case 'idioma':
				this.idiomas = [...this.idiomas, draft as IdiomaRow];
				break;
			case 'competencia':
				this.competencias = [...this.competencias, draft as CompetenciaRow];
				break;
			case 'experiencia':
				this.experiencias = [...this.experiencias, draft as ExperienciaRow];
				break;
			case 'familiarUees':
				this.familiaresUees = [...this.familiaresUees, draft as FamiliarUeesRow];
				break;
		}
	}

	private actualizarFila(tipo: ModalTabla, id: number, draft: any): void {
		const merge = (row: any) => (row.ID === id ? { ...row, ...draft, ID: id } : row);
		switch (tipo) {
			case 'hijo':
				this.hijos = this.hijos.map(merge);
				break;
			case 'estudio':
				this.estudios = this.estudios.map(merge);
				break;
			case 'idioma':
				this.idiomas = this.idiomas.map(merge);
				break;
			case 'competencia':
				this.competencias = this.competencias.map(merge);
				break;
			case 'experiencia':
				this.experiencias = this.experiencias.map(merge);
				break;
			case 'familiarUees':
				this.familiaresUees = this.familiaresUees.map(merge);
				break;
		}
	}

	private construirPayloadCompletar(): CompletarFormularioEmpleoPayload {
		const { FOTO_URL, ...datosPersistibles } = this.formData;
		void FOTO_URL;

		const payload: CompletarFormularioEmpleoPayload = {
			TOKEN: this.token,
			...datosPersistibles,
			FECHA_NACIMIENTO: this.toDateOnly(this.formData.FECHA_NACIMIENTO),
			FAMILIARES_DIRECTOS: this.familiaresDirectos
				.filter((familiar) => this.tieneDatosFamiliarDirecto(familiar))
				.map((familiar) => ({
					TIPO: familiar.TIPO,
					NOMBRE: familiar.NOMBRE,
					DOMICILIO: familiar.DOMICILIO,
					FECHA_NACIMIENTO: familiar.FECHA_NACIMIENTO,
					OCUPACION: familiar.OCUPACION,
				})),
			HIJOS: this.hijos.map((hijo) => ({
				NOMBRE: hijo.NOMBRE,
				EDAD: hijo.EDAD,
				SEXO: hijo.SEXO,
				FECHA_NACIMIENTO: hijo.FECHA_NACIMIENTO,
			})),
			ESTUDIOS: this.estudios.map((estudio) => ({
				NIVEL: estudio.NIVEL,
				INSTITUCION: estudio.INSTITUCION,
				DESDE: estudio.DESDE,
				HASTA: estudio.HASTA,
				TITULO: estudio.TITULO,
			})),
			IDIOMAS: this.idiomas.map((idioma) => ({
				IDIOMA: idioma.IDIOMA,
				NIVEL: idioma.NIVEL,
			})),
			COMPETENCIAS: this.competencias.map((competencia) => ({
				HERRAMIENTA: competencia.HERRAMIENTA,
				NIVEL: competencia.NIVEL,
			})),
			EXPERIENCIAS: this.experiencias.map((experiencia) => ({
				EMPRESA: experiencia.EMPRESA,
				TELEFONO: experiencia.TELEFONO,
				CARGO: experiencia.CARGO,
				JEFE_INMEDIATO: experiencia.JEFE_INMEDIATO,
				FECHA_INICIO: experiencia.FECHA_INICIO,
				FECHA_FIN: experiencia.FECHA_FIN,
				SALARIO_INICIAL: experiencia.SALARIO_INICIAL,
				SALARIO_FINAL: experiencia.SALARIO_FINAL,
				MOTIVO_SALIDA: experiencia.MOTIVO_SALIDA,
			})),
			FAMILIARES_UEES: this.esFormularioCompleto && this.formData.TIENE_FAMILIARES_UEES
				? this.familiaresUees.map((familiar) => ({
						NOMBRE: familiar.NOMBRE,
						PARENTESCO: familiar.PARENTESCO,
						UNIDAD: familiar.UNIDAD,
						TELEFONO: familiar.TELEFONO,
				  }))
				: [],
		};

		if (!this.esFormularioCompleto) {
			payload.TIENE_FAMILIARES_UEES = false;
		}

		return payload;
	}

	private tieneDatosFamiliarDirecto(familiar: FamiliarDirecto): boolean {
		return (
			!!familiar.NOMBRE.trim() ||
			!!familiar.DOMICILIO.trim() ||
			familiar.FECHA_NACIMIENTO !== null ||
			!!familiar.OCUPACION.trim()
		);
	}

	private validarPasoActual(): string | null {
		if (this.pasoActual === 1) {
			return this.validarPasoPersonales()?.mensaje ?? null;
		}
		if (this.pasoActual === 2) {
			return this.validarPasoFamiliar()?.mensaje ?? null;
		}
		return null;
	}

	private validarCamposRequeridos(): { mensaje: string; paso: PortalPaso } | null {
		return this.validarPasoPersonales() ?? this.validarPasoFamiliar();
	}

	private validarPasoPersonales(): { mensaje: string; paso: PortalPaso } | null {
		
		if (!`${this.formData.NOMBRE1 ?? ''}`.trim()) {
			return { mensaje: 'El primer nombre es requerido.', paso: 1 };
		}

		if (!`${this.formData.NOMBRE2 ?? ''}`.trim()) {
			return { mensaje: 'El segundo nombre es requerido.', paso: 1 };
		}

		if (!`${this.formData.APELLIDO1 ?? ''}`.trim()) {
			return { mensaje: 'El primer apellido es requerido.', paso: 1 };
		}

		if (!`${this.formData.APELLIDO2 ?? ''}`.trim()) {
			return { mensaje: 'El segundo apellido es requerido.', paso: 1 };
		}

		if (!this.formData.FECHA_NACIMIENTO) {
			return { mensaje: 'Debes indicar la fecha de nacimiento.', paso: 1 };
		}

		if	 (!`${this.formData.ESTADO_CIVIL ?? ''}`.trim()) {
			return { mensaje: 'El estado civil es requerido.', paso: 1 };
		}

		if (!`${this.formData.CORREO ?? ''}`.trim()) {
			return { mensaje: 'El correo es requerido.', paso: 1 };
		}
		if (!`${this.formData.CELULAR ?? ''}`.trim()) {
			return { mensaje: 'El celular es requerido.', paso: 1 };
		}
		if (!`${this.formData.DIRECCION ?? ''}`.trim()) {
			return { mensaje: 'La dirección es requerida.', paso: 1 };
		}
		if (!`${this.formData.DUI ?? ''}`.trim()) {
			return { mensaje: 'El DUI es requerido.', paso: 1 };
		}

		if (!`${this.formData.AFP ?? ''}`.trim()) {
			return { mensaje: 'El número AFP es requerido.', paso: 1 };
		}

		if	 (!`${this.formData.NOMBRE_AFP ?? ''}`.trim()) {
			return { mensaje: 'El nombre AFP es requerido.', paso: 1 };
		}

		if (!`${this.formData.PLAZA_SOLICITADA ?? ''}`.trim()) {
			return { mensaje: 'La plaza solicitada es requerida.', paso: 1 };
		}

		if (!`${this.formData.DISPONIBILIDAD ?? ''}`.trim()) {
			return { mensaje: 'La disponibilidad es requerida.', paso: 1 };
		}



		return null;
	}

	private validarPasoFamiliar(): { mensaje: string; paso: PortalPaso } | null {
		
		if (!`${this.formData.EMERGENCIA_NOMBRE ?? ''}`.trim()) {
			return { mensaje: 'El contacto de emergencia es requerido.', paso: 2 };
		}
		if (!`${this.formData.EMERGENCIA_TELEFONO ?? ''}`.trim()) {
			return { mensaje: 'El teléfono de emergencia es requerido.', paso: 2 };
		}
		return null;
	}

	private extraerMensajeErrorHttp(error: any): string {
		const body = error?.error;
		if (!body) {
			return 'No fue posible enviar la solicitud. El enlace pudo expirar o ya fue utilizado.';
		}

		if (typeof body === 'string' && body.trim()) {
			return body;
		}

		if (body.ErrorMessage || body.errorMessage) {
			return body.ErrorMessage || body.errorMessage;
		}

		// ASP.NET ProblemDetails: { errors: { CAMPO: ["mensaje"] } }
		const errors = body.errors;
		if (errors && typeof errors === 'object') {
			const mensajes = Object.keys(errors)
				.flatMap((key) => {
					const value = errors[key];
					return Array.isArray(value) ? value : [value];
				})
				.filter((msg) => typeof msg === 'string' && msg.trim());

			if (mensajes.length) {
				return mensajes.join(' ');
			}
			if (body.title) {
				return body.title;
			}
		}

		return 'No fue posible enviar la solicitud. El enlace pudo expirar o ya fue utilizado.';
	}

	private toDateOnly(fecha: Date): string {
		const date = new Date(fecha);
		const year = date.getFullYear();
		const month = `${date.getMonth() + 1}`.padStart(2, '0');
		const day = `${date.getDate()}`.padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	private calcularEdad(fecha: Date | null): number {
		if (!fecha) {
			return 0;
		}
		const birth = new Date(fecha);
		if (Number.isNaN(birth.getTime())) {
			return 0;
		}
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age >= 0 ? age : 0;
	}

	private mostrarError(mensaje: string): void {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: mensaje,
			life: 6000,
		});
	}
}

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		DxButtonModule,
		DxCheckBoxModule,
		DxDataGridModule,
		DxDateBoxModule,
		DxFormModule,
		DxLoadIndicatorModule,
		DxNumberBoxModule,
		DxPopupModule,
		DxProgressBarModule,
		DxScrollViewModule,
		DxSelectBoxModule,
		DxTextAreaModule,
		DxTextBoxModule,
		ToastModule,
	],
	declarations: [FormularioEmpleoFormComponent],
	exports: [FormularioEmpleoFormComponent],
})
export class FormularioEmpleoFormModule {}
