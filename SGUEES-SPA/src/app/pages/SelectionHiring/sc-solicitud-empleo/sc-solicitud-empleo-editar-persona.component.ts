import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import {
	ScPersonaCompetencia,
	ScPersonaDatos,
	ScPersonaEstudio,
	ScPersonaExperiencia,
	ScPersonaFamiliar,
	ScPersonaFamiliarUees,
	ScPersonaHijo,
	ScPersonaIdioma,
} from './models/sc-persona-datos';
import { ScSolicitudEmpleoService } from './sc-solicitud-empleo.service';

type SubmodalTipo =
	| 'hijo'
	| 'estudio'
	| 'idioma'
	| 'competencia'
	| 'experiencia'
	| 'familiarDirecto'
	| 'familiarUees';

interface FamiliarDirectoDraft {
	TIPO: 'PADRE' | 'MADRE' | 'ESPOSO';
	ETIQUETA: string;
	NOMBRE: string;
	DOMICILIO: string;
	FECHA_NACIMIENTO: Date | null;
	OCUPACION: string;
}

interface RowDraft {
	ID: number;
	[key: string]: any;
}

@Component({
	selector: 'app-sc-solicitud-empleo-editar-persona',
	templateUrl: './sc-solicitud-empleo-editar-persona.component.html',
	styleUrls: ['./sc-solicitud-empleo-editar-persona.component.scss'],
})
export class ScSolicitudEmpleoEditarPersonaComponent implements OnChanges, OnDestroy {
	@Input() visible = false;
	@Output() visibleChange = new EventEmitter<boolean>();

	@Input() corrSolicitudEmpleo = 0;
	@Input() fotoPreviewUrl: string | null = null;
	@Input() persona: ScPersonaDatos | null = null;
	@Input() familiares: ScPersonaFamiliar[] = [];
	@Input() hijos: ScPersonaHijo[] = [];
	@Input() estudios: ScPersonaEstudio[] = [];
	@Input() idiomas: ScPersonaIdioma[] = [];
	@Input() competencias: ScPersonaCompetencia[] = [];
	@Input() experiencias: ScPersonaExperiencia[] = [];
	@Input() familiaresUees: ScPersonaFamiliarUees[] = [];
	@Output() saved = new EventEmitter<void>();

	draft: ScPersonaDatos | null = null;
	/** Vacío conserva la foto actual en API; solo se llena tras SubirFotoPersona. */
	fotoUrlNueva = '';
	fotoLocalUrl: string | null = null;
	familiaresDirectos: FamiliarDirectoDraft[] = [];
	draftHijos: RowDraft[] = [];
	draftEstudios: RowDraft[] = [];
	draftIdiomas: RowDraft[] = [];
	draftCompetencias: RowDraft[] = [];
	draftExperiencias: RowDraft[] = [];
	draftFamiliaresUees: RowDraft[] = [];

	guardando = false;
	fotoSubiendo = false;
	private nextRowId = 1;

	submodalVisible = false;
	submodalTipo: SubmodalTipo | null = null;
	submodalEditando = false;
	submodalEditId: number | null = null;
	/** Índice del familiar directo al editar (0..2). */
	submodalFamiliarIndex: number | null = null;
	submodalDraft: any = {};

	readonly sexoOptions = [
		{ value: 'M', text: 'Masculino' },
		{ value: 'F', text: 'Femenino' },
	];
	readonly estadoCivilOptions = [
		{ value: 'Soltero', text: 'Soltero' },
		{ value: 'Casado', text: 'Casado' },
		{ value: 'Acompañado', text: 'Acompañado' },
		{ value: 'Divorciado', text: 'Divorciado' },
		{ value: 'Viudo', text: 'Viudo' },
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
		private service: ScSolicitudEmpleoService,
		private messageService: MessageService
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['visible'] && this.visible) {
			this.clonarDraftDesdeInputs();
		}
	}

	ngOnDestroy(): void {
		this.revocarFotoLocal();
	}

	get fotoMostrada(): string | null {
		return this.fotoLocalUrl || this.fotoPreviewUrl || null;
	}

	get nombreCompletoDraft(): string {
		if (!this.draft) {
			return '';
		}
		return [this.draft.NOMBRE1, this.draft.NOMBRE2, this.draft.APELLIDO1, this.draft.APELLIDO2]
			.filter((p) => !!p && String(p).trim().length > 0)
			.join(' ');
	}

	get inicialesDraft(): string {
		const n = (this.draft?.NOMBRE1 || '').trim().charAt(0).toUpperCase();
		const a = (this.draft?.APELLIDO1 || '').trim().charAt(0).toUpperCase();
		return `${n}${a}` || '?';
	}

	get submodalTitulo(): string {
		const accion = this.submodalEditando ? 'Editar' : 'Agregar';
		switch (this.submodalTipo) {
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
			case 'familiarDirecto':
				return `Editar ${this.submodalDraft?.ETIQUETA || 'familiar'}`;
			case 'familiarUees':
				return `${accion} familiar UEES`;
			default:
				return accion;
		}
	}

	get submodalAncho(): number {
		return this.submodalTipo === 'experiencia' ? 680 : 520;
	}

	/** Cierra el modal principal (Cancelar o X). */
	cerrar(): void {
		this.cerrarSubmodal();
		this.revocarFotoLocal();
		this.visibleChange.emit(false);
	}

	/** Copia profunda de persona y colecciones al abrir. */
	private clonarDraftDesdeInputs(): void {
		this.revocarFotoLocal();
		this.fotoUrlNueva = '';
		this.nextRowId = 1;

		const p = this.persona;
		const fechaNac = this.parseFecha(p?.FECHA_NACIMIENTO);
		this.draft = {
			CORR_EMPRESA: p?.CORR_EMPRESA ?? 0,
			CORR_PERSONA_DATOS: p?.CORR_PERSONA_DATOS ?? 0,
			NOMBRE1: `${p?.NOMBRE1 ?? ''}`.trim(),
			NOMBRE2: `${p?.NOMBRE2 ?? ''}`.trim(),
			APELLIDO1: `${p?.APELLIDO1 ?? ''}`.trim(),
			APELLIDO2: `${p?.APELLIDO2 ?? ''}`.trim(),
			FECHA_NACIMIENTO: fechaNac,
			EDAD: Number(p?.EDAD ?? 0) || this.calcularEdad(fechaNac),
			ESTADO_CIVIL: `${p?.ESTADO_CIVIL ?? ''}`.trim(),
			NACIONALIDAD: `${p?.NACIONALIDAD ?? ''}`.trim(),
			CORREO: `${p?.CORREO ?? ''}`.trim(),
			CELULAR: `${p?.CELULAR ?? ''}`.trim(),
			TELEFONO: `${p?.TELEFONO ?? ''}`.trim(),
			DIRECCION: `${p?.DIRECCION ?? ''}`.trim(),
			DUI: `${p?.DUI ?? ''}`.trim(),
			PASAPORTE: `${p?.PASAPORTE ?? ''}`.trim(),
			ISSS: `${p?.ISSS ?? ''}`.trim(),
			AFP: `${p?.AFP ?? ''}`.trim(),
			NOMBRE_AFP: `${p?.NOMBRE_AFP ?? ''}`.trim(),
			LICENCIA: `${p?.LICENCIA ?? ''}`.trim(),
			PLAZA_SOLICITADA: `${p?.PLAZA_SOLICITADA ?? ''}`.trim(),
			PRETENSION_SALARIAL: Number(p?.PRETENSION_SALARIAL ?? 0) || 0,
			DISPONIBILIDAD: `${p?.DISPONIBILIDAD ?? ''}`.trim(),
			RELIGION: `${p?.RELIGION ?? ''}`.trim(),
			IGLESIA: `${p?.IGLESIA ?? ''}`.trim(),
			DIRECCION_IGLESIA: `${p?.DIRECCION_IGLESIA ?? ''}`.trim(),
			ES_CONTRIBUYENTE_CCF: !!p?.ES_CONTRIBUYENTE_CCF,
			ES_JUBILADO: !!p?.ES_JUBILADO,
			POSEE_DISCAPACIDAD: !!p?.POSEE_DISCAPACIDAD,
			TIPO_DISCAPACIDAD: `${p?.TIPO_DISCAPACIDAD ?? ''}`.trim(),
			EMERGENCIA_NOMBRE: `${p?.EMERGENCIA_NOMBRE ?? ''}`.trim(),
			EMERGENCIA_PARENTESCO: `${p?.EMERGENCIA_PARENTESCO ?? ''}`.trim(),
			EMERGENCIA_TELEFONO: `${p?.EMERGENCIA_TELEFONO ?? ''}`.trim(),
			TIENE_FAMILIARES_UEES: !!p?.TIENE_FAMILIARES_UEES,
			DECLARA_VERDAD: !!p?.DECLARA_VERDAD,
			AUTORIZA_VERIFICACION: !!p?.AUTORIZA_VERIFICACION,
			FECHA_DECLARACION: p?.FECHA_DECLARACION ?? null,
			FIRMA_ELECTRONICA: `${p?.FIRMA_ELECTRONICA ?? ''}`.trim(),
			FOTO_URL: `${p?.FOTO_URL ?? ''}`.trim(),
		};

		const base = this.crearSlotsFamiliares();
		this.familiaresDirectos = base.map((slot) => {
			const found = (this.familiares || []).find(
				(f) => `${f?.TIPO ?? ''}`.toUpperCase() === slot.TIPO
			);
			if (!found) {
				return { ...slot };
			}
			return {
				...slot,
				NOMBRE: `${found.NOMBRE ?? ''}`.trim(),
				DOMICILIO: `${found.DOMICILIO ?? ''}`.trim(),
				FECHA_NACIMIENTO: this.parseFecha(found.FECHA_NACIMIENTO),
				OCUPACION: `${found.OCUPACION ?? ''}`.trim(),
			};
		});

		this.draftHijos = (this.hijos || []).map((h) => ({
			ID: this.nextRowId++,
			NOMBRE: `${h.NOMBRE ?? ''}`.trim(),
			EDAD: h.EDAD == null ? null : Number(h.EDAD),
			SEXO: `${h.SEXO ?? ''}`.trim(),
			FECHA_NACIMIENTO: this.parseFecha(h.FECHA_NACIMIENTO),
		}));

		this.draftEstudios = (this.estudios || []).map((e) => ({
			ID: this.nextRowId++,
			NIVEL: `${e.NIVEL ?? ''}`.trim(),
			INSTITUCION: `${e.INSTITUCION ?? ''}`.trim(),
			DESDE: this.parseFecha(e.DESDE),
			HASTA: this.parseFecha(e.HASTA),
			TITULO: `${e.TITULO ?? ''}`.trim(),
		}));

		this.draftIdiomas = (this.idiomas || []).map((i) => ({
			ID: this.nextRowId++,
			IDIOMA: `${i.IDIOMA ?? ''}`.trim(),
			NIVEL: `${i.NIVEL ?? ''}`.trim(),
		}));

		this.draftCompetencias = (this.competencias || []).map((c) => ({
			ID: this.nextRowId++,
			HERRAMIENTA: `${c.HERRAMIENTA ?? ''}`.trim(),
			NIVEL: `${c.NIVEL ?? ''}`.trim(),
		}));

		this.draftExperiencias = (this.experiencias || []).map((x) => ({
			ID: this.nextRowId++,
			EMPRESA: `${x.EMPRESA ?? ''}`.trim(),
			TELEFONO: `${x.TELEFONO ?? ''}`.trim(),
			CARGO: `${x.CARGO ?? ''}`.trim(),
			JEFE_INMEDIATO: `${x.JEFE_INMEDIATO ?? ''}`.trim(),
			FECHA_INICIO: this.parseFecha(x.FECHA_INICIO),
			FECHA_FIN: this.parseFecha(x.FECHA_FIN),
			SALARIO_INICIAL: x.SALARIO_INICIAL == null ? null : Number(x.SALARIO_INICIAL),
			SALARIO_FINAL: x.SALARIO_FINAL == null ? null : Number(x.SALARIO_FINAL),
			MOTIVO_SALIDA: `${x.MOTIVO_SALIDA ?? ''}`.trim(),
		}));

		this.draftFamiliaresUees = (this.familiaresUees || []).map((f) => ({
			ID: this.nextRowId++,
			NOMBRE: `${f.NOMBRE ?? ''}`.trim(),
			PARENTESCO: `${f.PARENTESCO ?? ''}`.trim(),
			UNIDAD: `${f.UNIDAD ?? ''}`.trim(),
			TELEFONO: `${f.TELEFONO ?? ''}`.trim(),
		}));
	}

	onFechaNacimientoChanged(value: Date | null): void {
		if (!this.draft) {
			return;
		}
		this.draft.FECHA_NACIMIENTO = value;
		this.draft.EDAD = this.calcularEdad(value);
	}

	/** Selección de archivo → sube de inmediato y actualiza preview local. */
	async onFotoFileChange(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !this.draft) {
			return;
		}

		const errorArchivo = this.validarArchivoFoto(file);
		if (errorArchivo) {
			input.value = '';
			this.toastError(errorArchivo);
			return;
		}

		const corr = this.draft.CORR_PERSONA_DATOS ?? 0;
		if (corr <= 0) {
			input.value = '';
			this.toastError('No hay persona asociada para subir la fotografía.');
			return;
		}

		this.revocarFotoLocal();
		this.fotoLocalUrl = URL.createObjectURL(file);
		this.fotoSubiendo = true;

		try {
			const response: any = await firstValueFrom(this.service.subirFotoPersona(corr, file));
			if (!response?.Result) {
				this.revocarFotoLocal();
				this.fotoUrlNueva = '';
				input.value = '';
				this.toastError(response?.ErrorMessage || 'No fue posible subir la fotografía.');
				return;
			}
			this.fotoUrlNueva = `${response?.Data?.FOTO_URL ?? ''}`.trim();
			this.messageService.add({
				severity: 'success',
				summary: 'Éxito',
				detail: 'Fotografía actualizada.',
			});
		} catch (error: any) {
			this.revocarFotoLocal();
			this.fotoUrlNueva = '';
			input.value = '';
			this.toastError(this.extraerMensajeError(error));
		} finally {
			this.fotoSubiendo = false;
		}
	}

	/** Valida y envía ActualizarPersonaDatos. */
	async guardar(): Promise<void> {
		if (!this.draft || this.guardando || this.fotoSubiendo) {
			return;
		}

		const error = this.validarRequeridos();
		if (error) {
			this.toastError(error);
			return;
		}

		const payload = this.construirPayload();
		this.guardando = true;
		try {
			const response: any = await firstValueFrom(this.service.actualizarPersonaDatos(payload));
			if (!response?.Result) {
				this.toastError(response?.ErrorMessage || 'No fue posible guardar los cambios.');
				return;
			}
			this.messageService.add({
				severity: 'success',
				summary: 'Éxito',
				detail: 'Datos del candidato actualizados.',
			});
			this.saved.emit();
			this.cerrar();
		} catch (err: any) {
			this.toastError(this.extraerMensajeError(err));
		} finally {
			this.guardando = false;
		}
	}

	// ─── Submodal colecciones ───────────────────────────────────────────────

	abrirSubmodalNuevo(tipo: SubmodalTipo): void {
		if (tipo === 'familiarDirecto') {
			return;
		}
		this.submodalTipo = tipo;
		this.submodalEditando = false;
		this.submodalEditId = null;
		this.submodalFamiliarIndex = null;
		this.submodalDraft = this.createDraft(tipo);
		this.submodalVisible = true;
	}

	abrirSubmodalEditar(tipo: SubmodalTipo, row: any, familiarIndex?: number): void {
		this.submodalTipo = tipo;
		this.submodalEditando = true;
		this.submodalEditId = tipo === 'familiarDirecto' ? null : Number(row.ID);
		this.submodalFamiliarIndex = tipo === 'familiarDirecto' ? (familiarIndex ?? null) : null;
		this.submodalDraft = { ...row };
		this.submodalVisible = true;
	}

	cerrarSubmodal(): void {
		this.submodalVisible = false;
		this.submodalTipo = null;
		this.submodalEditando = false;
		this.submodalEditId = null;
		this.submodalFamiliarIndex = null;
		this.submodalDraft = {};
	}

	/** Aplica el borrador del submodal al arreglo local (sin API). */
	guardarSubmodal(): void {
		if (!this.submodalTipo) {
			return;
		}
		const error = this.validarDraft(this.submodalTipo, this.submodalDraft);
		if (error) {
			this.toastError(error);
			return;
		}

		const draft = { ...this.submodalDraft };
		if (this.submodalTipo === 'hijo') {
			draft.EDAD = this.calcularEdad(draft.FECHA_NACIMIENTO ?? null);
		}

		if (this.submodalTipo === 'familiarDirecto' && this.submodalFamiliarIndex != null) {
			this.familiaresDirectos = this.familiaresDirectos.map((f, i) =>
				i === this.submodalFamiliarIndex
					? {
							...f,
							NOMBRE: `${draft.NOMBRE ?? ''}`.trim(),
							DOMICILIO: `${draft.DOMICILIO ?? ''}`.trim(),
							FECHA_NACIMIENTO: draft.FECHA_NACIMIENTO ?? null,
							OCUPACION: `${draft.OCUPACION ?? ''}`.trim(),
					  }
					: f
			);
			this.cerrarSubmodal();
			return;
		}

		if (this.submodalEditando && this.submodalEditId != null) {
			this.actualizarFila(this.submodalTipo, this.submodalEditId, draft);
		} else {
			draft.ID = this.nextRowId++;
			this.insertarFila(this.submodalTipo, draft);
		}
		this.cerrarSubmodal();
	}

	eliminarFila(tipo: SubmodalTipo, row: any): void {
		const id = Number(row.ID);
		switch (tipo) {
			case 'hijo':
				this.draftHijos = this.draftHijos.filter((x) => x.ID !== id);
				break;
			case 'estudio':
				this.draftEstudios = this.draftEstudios.filter((x) => x.ID !== id);
				break;
			case 'idioma':
				this.draftIdiomas = this.draftIdiomas.filter((x) => x.ID !== id);
				break;
			case 'competencia':
				this.draftCompetencias = this.draftCompetencias.filter((x) => x.ID !== id);
				break;
			case 'experiencia':
				this.draftExperiencias = this.draftExperiencias.filter((x) => x.ID !== id);
				break;
			case 'familiarUees':
				this.draftFamiliaresUees = this.draftFamiliaresUees.filter((x) => x.ID !== id);
				break;
		}
	}

	onSubmodalHijoFechaChanged(value: Date | null): void {
		this.submodalDraft.FECHA_NACIMIENTO = value;
		this.submodalDraft.EDAD = this.calcularEdad(value);
	}

	resumenHijo(row: RowDraft): string {
		const sexo = this.sexoOptions.find((x) => x.value === row.SEXO)?.text || row.SEXO || '';
		const edad = row.EDAD != null ? `${row.EDAD} años` : '';
		return [row.NOMBRE, sexo, edad].filter(Boolean).join(' · ') || 'Sin datos';
	}

	resumenEstudio(row: RowDraft): string {
		return [row.NIVEL, row.INSTITUCION, row.TITULO].filter(Boolean).join(' · ') || 'Sin datos';
	}

	resumenIdioma(row: RowDraft): string {
		return [row.IDIOMA, row.NIVEL].filter(Boolean).join(' · ') || 'Sin datos';
	}

	resumenCompetencia(row: RowDraft): string {
		return [row.HERRAMIENTA, row.NIVEL].filter(Boolean).join(' · ') || 'Sin datos';
	}

	resumenExperiencia(row: RowDraft): string {
		return [row.EMPRESA, row.CARGO].filter(Boolean).join(' · ') || 'Sin datos';
	}

	resumenFamiliar(f: FamiliarDirectoDraft): string {
		return [f.NOMBRE, f.OCUPACION].filter(Boolean).join(' · ') || 'Sin datos';
	}

	resumenFamiliarUees(row: RowDraft): string {
		return [row.NOMBRE, row.PARENTESCO, row.UNIDAD].filter(Boolean).join(' · ') || 'Sin datos';
	}

	// ─── Privados ───────────────────────────────────────────────────────────

	private construirPayload(): any {
		const d = this.draft!;
		return {
			CORR_SOLICITUD_EMPLEO: this.corrSolicitudEmpleo,
			CORR_PERSONA_DATOS: d.CORR_PERSONA_DATOS,
			NOMBRE1: `${d.NOMBRE1 ?? ''}`.trim(),
			NOMBRE2: `${d.NOMBRE2 ?? ''}`.trim(),
			APELLIDO1: `${d.APELLIDO1 ?? ''}`.trim(),
			APELLIDO2: `${d.APELLIDO2 ?? ''}`.trim(),
			FECHA_NACIMIENTO: this.toDateOnly(d.FECHA_NACIMIENTO as Date),
			EDAD: Number(d.EDAD ?? 0) || this.calcularEdad(d.FECHA_NACIMIENTO as Date | null),
			ESTADO_CIVIL: `${d.ESTADO_CIVIL ?? ''}`.trim(),
			NACIONALIDAD: `${d.NACIONALIDAD ?? ''}`.trim(),
			CORREO: `${d.CORREO ?? ''}`.trim(),
			CELULAR: `${d.CELULAR ?? ''}`.trim(),
			TELEFONO: `${d.TELEFONO ?? ''}`.trim(),
			DIRECCION: `${d.DIRECCION ?? ''}`.trim(),
			DUI: `${d.DUI ?? ''}`.trim(),
			PASAPORTE: `${d.PASAPORTE ?? ''}`.trim(),
			ISSS: `${d.ISSS ?? ''}`.trim(),
			AFP: `${d.AFP ?? ''}`.trim(),
			NOMBRE_AFP: `${d.NOMBRE_AFP ?? ''}`.trim(),
			LICENCIA: `${d.LICENCIA ?? ''}`.trim(),
			PLAZA_SOLICITADA: `${d.PLAZA_SOLICITADA ?? ''}`.trim(),
			PRETENSION_SALARIAL: Number(d.PRETENSION_SALARIAL ?? 0) || 0,
			DISPONIBILIDAD: `${d.DISPONIBILIDAD ?? ''}`.trim(),
			RELIGION: `${d.RELIGION ?? ''}`.trim(),
			IGLESIA: `${d.IGLESIA ?? ''}`.trim(),
			DIRECCION_IGLESIA: `${d.DIRECCION_IGLESIA ?? ''}`.trim(),
			ES_CONTRIBUYENTE_CCF: !!d.ES_CONTRIBUYENTE_CCF,
			ES_JUBILADO: !!d.ES_JUBILADO,
			POSEE_DISCAPACIDAD: !!d.POSEE_DISCAPACIDAD,
			TIPO_DISCAPACIDAD: `${d.TIPO_DISCAPACIDAD ?? ''}`.trim(),
			EMERGENCIA_NOMBRE: `${d.EMERGENCIA_NOMBRE ?? ''}`.trim(),
			EMERGENCIA_PARENTESCO: `${d.EMERGENCIA_PARENTESCO ?? ''}`.trim(),
			EMERGENCIA_TELEFONO: `${d.EMERGENCIA_TELEFONO ?? ''}`.trim(),
			TIENE_FAMILIARES_UEES: !!d.TIENE_FAMILIARES_UEES,
			FOTO_URL: this.fotoUrlNueva,
			FAMILIARES_DIRECTOS: this.familiaresDirectos
				.filter((f) => this.tieneDatosFamiliarDirecto(f))
				.map((f) => ({
					TIPO: f.TIPO,
					NOMBRE: `${f.NOMBRE ?? ''}`.trim(),
					DOMICILIO: `${f.DOMICILIO ?? ''}`.trim(),
					FECHA_NACIMIENTO: f.FECHA_NACIMIENTO,
					OCUPACION: `${f.OCUPACION ?? ''}`.trim(),
				})),
			HIJOS: this.draftHijos.map((h) => ({
				NOMBRE: `${h.NOMBRE ?? ''}`.trim(),
				EDAD: h.EDAD,
				SEXO: `${h.SEXO ?? ''}`.trim(),
				FECHA_NACIMIENTO: h.FECHA_NACIMIENTO,
			})),
			ESTUDIOS: this.draftEstudios.map((e) => ({
				NIVEL: `${e.NIVEL ?? ''}`.trim(),
				INSTITUCION: `${e.INSTITUCION ?? ''}`.trim(),
				DESDE: e.DESDE,
				HASTA: e.HASTA,
				TITULO: `${e.TITULO ?? ''}`.trim(),
			})),
			IDIOMAS: this.draftIdiomas.map((i) => ({
				IDIOMA: `${i.IDIOMA ?? ''}`.trim(),
				NIVEL: `${i.NIVEL ?? ''}`.trim(),
			})),
			COMPETENCIAS: this.draftCompetencias.map((c) => ({
				HERRAMIENTA: `${c.HERRAMIENTA ?? ''}`.trim(),
				NIVEL: `${c.NIVEL ?? ''}`.trim(),
			})),
			EXPERIENCIAS: this.draftExperiencias.map((x) => ({
				EMPRESA: `${x.EMPRESA ?? ''}`.trim(),
				TELEFONO: `${x.TELEFONO ?? ''}`.trim(),
				CARGO: `${x.CARGO ?? ''}`.trim(),
				JEFE_INMEDIATO: `${x.JEFE_INMEDIATO ?? ''}`.trim(),
				FECHA_INICIO: x.FECHA_INICIO,
				FECHA_FIN: x.FECHA_FIN,
				SALARIO_INICIAL: x.SALARIO_INICIAL,
				SALARIO_FINAL: x.SALARIO_FINAL,
				MOTIVO_SALIDA: `${x.MOTIVO_SALIDA ?? ''}`.trim(),
			})),
			FAMILIARES_UEES: d.TIENE_FAMILIARES_UEES
				? this.draftFamiliaresUees.map((f) => ({
						NOMBRE: `${f.NOMBRE ?? ''}`.trim(),
						PARENTESCO: `${f.PARENTESCO ?? ''}`.trim(),
						UNIDAD: `${f.UNIDAD ?? ''}`.trim(),
						TELEFONO: `${f.TELEFONO ?? ''}`.trim(),
				  }))
				: [],
		};
	}

	private validarRequeridos(): string | null {
		const d = this.draft!;
		if (!`${d.NOMBRE1 ?? ''}`.trim()) {
			return 'El primer nombre es requerido.';
		}
		if (!`${d.APELLIDO1 ?? ''}`.trim()) {
			return 'El primer apellido es requerido.';
		}
		if (!d.FECHA_NACIMIENTO) {
			return 'Debe indicar la fecha de nacimiento.';
		}
		if (!`${d.CORREO ?? ''}`.trim()) {
			return 'El correo es requerido.';
		}
		if (!`${d.CELULAR ?? ''}`.trim()) {
			return 'El celular es requerido.';
		}
		if (!`${d.DIRECCION ?? ''}`.trim()) {
			return 'La dirección es requerida.';
		}
		if (!`${d.DUI ?? ''}`.trim()) {
			return 'El DUI es requerido.';
		}
		if (!`${d.EMERGENCIA_NOMBRE ?? ''}`.trim()) {
			return 'El contacto de emergencia es requerido.';
		}
		if (!`${d.EMERGENCIA_TELEFONO ?? ''}`.trim()) {
			return 'El teléfono de emergencia es requerido.';
		}
		if (d.POSEE_DISCAPACIDAD && !`${d.TIPO_DISCAPACIDAD ?? ''}`.trim()) {
			return 'Debe indicar el tipo de discapacidad.';
		}
		return null;
	}

	private createDraft(tipo: SubmodalTipo): any {
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
			default:
				return {};
		}
	}

	private validarDraft(tipo: SubmodalTipo, draft: any): string | null {
		switch (tipo) {
			case 'hijo':
				return !`${draft.NOMBRE ?? ''}`.trim() ? 'El nombre del hijo es requerido.' : null;
			case 'estudio':
				return !`${draft.NIVEL ?? ''}`.trim() || !`${draft.INSTITUCION ?? ''}`.trim()
					? 'Nivel e institución son requeridos.'
					: null;
			case 'idioma':
				return !`${draft.IDIOMA ?? ''}`.trim() || !`${draft.NIVEL ?? ''}`.trim()
					? 'Idioma y nivel son requeridos.'
					: null;
			case 'competencia':
				return !`${draft.HERRAMIENTA ?? ''}`.trim() || !`${draft.NIVEL ?? ''}`.trim()
					? 'Herramienta y nivel son requeridos.'
					: null;
			case 'experiencia':
				return !`${draft.EMPRESA ?? ''}`.trim() || !`${draft.CARGO ?? ''}`.trim()
					? 'Empresa y cargo son requeridos.'
					: null;
			case 'familiarUees':
				return !`${draft.NOMBRE ?? ''}`.trim() ? 'El nombre del familiar es requerido.' : null;
			case 'familiarDirecto':
				return null;
			default:
				return null;
		}
	}

	private insertarFila(tipo: SubmodalTipo, draft: any): void {
		switch (tipo) {
			case 'hijo':
				this.draftHijos = [...this.draftHijos, draft];
				break;
			case 'estudio':
				this.draftEstudios = [...this.draftEstudios, draft];
				break;
			case 'idioma':
				this.draftIdiomas = [...this.draftIdiomas, draft];
				break;
			case 'competencia':
				this.draftCompetencias = [...this.draftCompetencias, draft];
				break;
			case 'experiencia':
				this.draftExperiencias = [...this.draftExperiencias, draft];
				break;
			case 'familiarUees':
				this.draftFamiliaresUees = [...this.draftFamiliaresUees, draft];
				break;
		}
	}

	private actualizarFila(tipo: SubmodalTipo, id: number, draft: any): void {
		const merge = (row: any) => (row.ID === id ? { ...row, ...draft, ID: id } : row);
		switch (tipo) {
			case 'hijo':
				this.draftHijos = this.draftHijos.map(merge);
				break;
			case 'estudio':
				this.draftEstudios = this.draftEstudios.map(merge);
				break;
			case 'idioma':
				this.draftIdiomas = this.draftIdiomas.map(merge);
				break;
			case 'competencia':
				this.draftCompetencias = this.draftCompetencias.map(merge);
				break;
			case 'experiencia':
				this.draftExperiencias = this.draftExperiencias.map(merge);
				break;
			case 'familiarUees':
				this.draftFamiliaresUees = this.draftFamiliaresUees.map(merge);
				break;
		}
	}

	private crearSlotsFamiliares(): FamiliarDirectoDraft[] {
		return [
			{ TIPO: 'PADRE', ETIQUETA: 'Padre', NOMBRE: '', DOMICILIO: '', FECHA_NACIMIENTO: null, OCUPACION: '' },
			{ TIPO: 'MADRE', ETIQUETA: 'Madre', NOMBRE: '', DOMICILIO: '', FECHA_NACIMIENTO: null, OCUPACION: '' },
			{ TIPO: 'ESPOSO', ETIQUETA: 'Esposo(a)', NOMBRE: '', DOMICILIO: '', FECHA_NACIMIENTO: null, OCUPACION: '' },
		];
	}

	private tieneDatosFamiliarDirecto(familiar: FamiliarDirectoDraft): boolean {
		return (
			!!`${familiar.NOMBRE ?? ''}`.trim() ||
			!!`${familiar.DOMICILIO ?? ''}`.trim() ||
			familiar.FECHA_NACIMIENTO != null ||
			!!`${familiar.OCUPACION ?? ''}`.trim()
		);
	}

	private parseFecha(value: any): Date | null {
		if (value == null || value === '') {
			return null;
		}
		if (value instanceof Date) {
			return Number.isNaN(value.getTime()) ? null : value;
		}
		if (typeof value === 'object' && value.year != null && value.month != null && value.day != null) {
			const d = new Date(Number(value.year), Number(value.month) - 1, Number(value.day));
			return Number.isNaN(d.getTime()) ? null : d;
		}
		const raw = `${value}`.trim();
		const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
		if (m) {
			const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
			return Number.isNaN(d.getTime()) ? null : d;
		}
		const d = new Date(raw);
		return Number.isNaN(d.getTime()) ? null : d;
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

	private validarArchivoFoto(file: File): string | null {
		const tipos = ['image/jpeg', 'image/png', 'image/webp'];
		if (!tipos.includes((file.type || '').toLowerCase())) {
			return 'Formato no permitido. Use JPG, PNG o WEBP.';
		}
		if (file.size > 5 * 1024 * 1024) {
			return 'La fotografía no debe superar 5 MB.';
		}
		return null;
	}

	private revocarFotoLocal(): void {
		if (this.fotoLocalUrl) {
			URL.revokeObjectURL(this.fotoLocalUrl);
			this.fotoLocalUrl = null;
		}
	}

	private toastError(detail: string): void {
		this.messageService.add({ severity: 'error', summary: 'Error', detail });
	}

	private extraerMensajeError(error: any): string {
		const body = error?.error;
		if (!body) {
			return 'No fue posible guardar los cambios.';
		}
		if (typeof body === 'string' && body.trim()) {
			return body;
		}
		if (body.ErrorMessage || body.errorMessage) {
			return body.ErrorMessage || body.errorMessage;
		}
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
		return 'No fue posible guardar los cambios.';
	}
}
