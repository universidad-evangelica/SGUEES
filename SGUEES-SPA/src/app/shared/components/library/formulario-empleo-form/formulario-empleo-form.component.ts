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
	completado = false;
	mensajeToken = '';

	/** 0 = bienvenida; 1–6 = pasos del wizard */
	pasoActual: PortalPaso = 0;
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
	private temaAnterior: 'light' | 'dark' = 'light';

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

	readonly resumenChecks = [
		{ paso: 1 as PortalPaso, label: 'Datos personales' },
		{ paso: 2 as PortalPaso, label: 'Información familiar' },
		{ paso: 3 as PortalPaso, label: 'Formación académica' },
		{ paso: 4 as PortalPaso, label: 'Experiencia laboral' },
		{ paso: 5 as PortalPaso, label: 'Información adicional' },
	];

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

	get progresoPct(): number {
		if (this.pasoActual < 1) {
			return 0;
		}
		return Math.round((this.pasoActual / this.totalPasos) * 100);
	}

	get progresoLabel(): string {
		return `Paso ${this.pasoActual} de ${this.totalPasos}`;
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
		this.temaAnterior = this.themeService.getCurrentTheme();
		if (this.temaAnterior !== 'light') {
			this.themeService.setAppTheme('light');
		}

		this.token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
		void this.validarToken();
	}

	ngOnDestroy(): void {
		if (this.temaAnterior !== this.themeService.getCurrentTheme()) {
			this.themeService.setAppTheme(this.temaAnterior);
		}
	}

	comenzarSolicitud(): void {
		this.pasoActual = 1;
	}

	volverBienvenida(): void {
		this.pasoActual = 0;
	}

	irAPaso(paso: PortalPaso): void {
		if (paso < 1 || paso > this.totalPasos) {
			return;
		}
		if (paso <= this.pasoActual || paso === this.pasoActual + 1) {
			this.pasoActual = paso;
		}
	}

	anterior(): void {
		if (this.pasoActual <= 1) {
			this.volverBienvenida();
			return;
		}
		this.pasoActual = (this.pasoActual - 1) as PortalPaso;
	}

	siguiente(): void {
		if (this.pasoActual < this.totalPasos) {
			this.pasoActual = (this.pasoActual + 1) as PortalPaso;
		}
	}

	onFechaNacimientoChanged(value: Date | null): void {
		this.formData.FECHA_NACIMIENTO = value;
		this.formData.EDAD = this.calcularEdad(value);
	}

	onFotoFileChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			this.formData.FOTO_URL = '';
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			this.formData.FOTO_URL = typeof reader.result === 'string' ? reader.result : '';
		};
		reader.readAsDataURL(file);
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
		this.pasoActual = 0;

		if (!this.token) {
			this.mensajeToken = 'El enlace es inválido, expiró o ya fue utilizado.';
			this.validandoToken = false;
			return;
		}

		try {
			const response: any = await firstValueFrom(this.service.validarToken(this.token));
			this.tokenValido = response.Result === true && response.Data?.VALIDO === true;
			this.mensajeToken = this.tokenValido
				? ''
				: 'El enlace es inválido, expiró o ya fue utilizado.';
		} catch {
			this.mensajeToken = 'No fue posible validar el enlace. Inténtalo nuevamente.';
		} finally {
			this.validandoToken = false;
		}
	}

	async onSubmit(): Promise<void> {
		if (!this.tokenValido || this.enviando) {
			return;
		}

		if (!this.formData.DECLARA_VERDAD || !this.formData.AUTORIZA_VERIFICACION) {
			this.mostrarError('Debes aceptar las declaraciones para enviar la solicitud.');
			return;
		}

		this.enviando = true;
		this.formData.FECHA_DECLARACION = new Date();

		try {
			const response: any = await firstValueFrom(
				this.service.completar({
					TOKEN: this.token,
					...this.formData,
					FAMILIARES_DIRECTOS: this.familiaresDirectos,
					HIJOS: this.hijos,
					ESTUDIOS: this.estudios,
					IDIOMAS: this.idiomas,
					COMPETENCIAS: this.competencias,
					EXPERIENCIAS: this.experiencias,
					FAMILIARES_UEES: this.familiaresUees,
				})
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
				this.mostrarError(response.ErrorMessage);
			}
		} catch (error: any) {
			this.mostrarError(
				error?.error?.ErrorMessage ??
					error?.error?.errorMessage ??
					'No fue posible enviar la solicitud. El enlace pudo expirar o ya fue utilizado.'
			);
			await this.validarToken();
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

	private calcularEdad(fecha: Date | null): number | null {
		if (!fecha) {
			return null;
		}
		const birth = new Date(fecha);
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age >= 0 ? age : null;
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
