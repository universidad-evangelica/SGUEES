import {
	CompetenciaRow,
	EstudioRow,
	ExperienciaRow,
	FamiliarDirecto,
	FamiliarUeesRow,
	FormularioEmpleoData,
	HijoRow,
	IdiomaRow,
	PortalPaso,
} from './formulario-empleo-form.models';

export interface ProgressBucket {
	llenos: number;
	total: number;
}

export interface PasoProgressResumen {
	paso: PortalPaso;
	label: string;
	requeridos: ProgressBucket;
	opcionales: ProgressBucket;
	/** Requeridos del paso completos (pasos sin requeridos: se marcan al visitarlos). */
	completoRequeridos: boolean;
}

export interface DeclaracionesProgress {
	declaraVerdad: boolean;
	autorizaVerificacion: boolean;
	firmaElectronica: boolean;
	requeridasCompletas: boolean;
}

export interface FormularioProgressSnapshot {
	total: ProgressBucket;
	requeridos: ProgressBucket;
	opcionales: ProgressBucket;
	porcentaje: number;
	pasos: PasoProgressResumen[];
	declaraciones: DeclaracionesProgress;
}

export interface FormularioProgressContext {
	formData: FormularioEmpleoData;
	familiaresDirectos: FamiliarDirecto[];
	hijos: HijoRow[];
	estudios: EstudioRow[];
	idiomas: IdiomaRow[];
	competencias: CompetenciaRow[];
	experiencias: ExperienciaRow[];
	familiaresUees: FamiliarUeesRow[];
	/** Mayor paso de contenido alcanzado (1–6), para chips de pasos solo opcionales. */
	maxPasoAlcanzado: PortalPaso;
	/** false = eventual: no contar el paso 5 (familiares UEES). */
	esFormularioCompleto?: boolean;
}

const PASO_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
	1: 'Datos personales',
	2: 'Información familiar',
	3: 'Formación académica',
	4: 'Experiencia laboral',
	5: 'Información adicional',
};

function emptyBucket(): ProgressBucket {
	return { llenos: 0, total: 0 };
}

function add(bucket: ProgressBucket, filled: boolean): void {
	bucket.total += 1;
	if (filled) {
		bucket.llenos += 1;
	}
}

function addGridRows(bucket: ProgressBucket, totalRows: number, validRows: number): void {
	if (totalRows <= 0) {
		return;
	}
	bucket.total += totalRows;
	bucket.llenos += validRows;
}

function merge(a: ProgressBucket, b: ProgressBucket): ProgressBucket {
	return { llenos: a.llenos + b.llenos, total: a.total + b.total };
}

function isFilledText(value: unknown): boolean {
	return `${value ?? ''}`.trim().length > 0;
}

function isFilledDate(value: Date | null | undefined): boolean {
	return !!value && !Number.isNaN(new Date(value).getTime());
}

function isFilledNumber(value: number | null | undefined): boolean {
	return value !== null && value !== undefined && !Number.isNaN(Number(value)) && Number(value) > 0;
}

function pct(bucket: ProgressBucket): number {
	if (bucket.total <= 0) {
		return 0;
	}
	return Math.round((bucket.llenos / bucket.total) * 100);
}

function countFamiliarDirectoFields(familiares: FamiliarDirecto[]): ProgressBucket {
	const bucket = emptyBucket();
	for (const f of familiares) {
		add(bucket, isFilledText(f.NOMBRE));
		add(bucket, isFilledText(f.OCUPACION));
		add(bucket, isFilledDate(f.FECHA_NACIMIENTO));
		add(bucket, isFilledText(f.DOMICILIO));
	}
	return bucket;
}

function countValidHijos(rows: HijoRow[]): number {
	return rows.filter((r) => isFilledText(r.NOMBRE)).length;
}

function countValidEstudios(rows: EstudioRow[]): number {
	return rows.filter((r) => isFilledText(r.NIVEL) && isFilledText(r.INSTITUCION)).length;
}

function countValidIdiomas(rows: IdiomaRow[]): number {
	return rows.filter((r) => isFilledText(r.IDIOMA) && isFilledText(r.NIVEL)).length;
}

function countValidCompetencias(rows: CompetenciaRow[]): number {
	return rows.filter((r) => isFilledText(r.HERRAMIENTA) && isFilledText(r.NIVEL)).length;
}

function countValidExperiencias(rows: ExperienciaRow[]): number {
	return rows.filter((r) => isFilledText(r.EMPRESA) && isFilledText(r.CARGO)).length;
}

function countValidFamiliaresUees(rows: FamiliarUeesRow[]): number {
	return rows.filter((r) => isFilledText(r.NOMBRE)).length;
}

function buildPaso1(form: FormularioEmpleoData): { requeridos: ProgressBucket; opcionales: ProgressBucket } {
	const requeridos = emptyBucket();
	const opcionales = emptyBucket();

	add(requeridos, isFilledText(form.NOMBRE1));
	add(requeridos, isFilledText(form.APELLIDO1));
	add(requeridos, isFilledDate(form.FECHA_NACIMIENTO));
	add(requeridos, isFilledText(form.ESTADO_CIVIL));
	add(requeridos, isFilledText(form.CORREO));
	add(requeridos, isFilledText(form.CELULAR));
	add(requeridos, isFilledText(form.DIRECCION));
	add(requeridos, isFilledText(form.DUI));
	add(requeridos, isFilledText(form.PLAZA_SOLICITADA));
	add(requeridos, isFilledText(form.DISPONIBILIDAD));

	add(opcionales, isFilledText(form.NOMBRE2));
	add(opcionales, isFilledText(form.APELLIDO2));
	add(opcionales, isFilledText(form.AFP));
	add(opcionales, isFilledText(form.NOMBRE_AFP));
	add(opcionales, isFilledText(form.FOTO_URL));
	add(opcionales, isFilledNumber(form.EDAD));
	add(opcionales, isFilledText(form.NACIONALIDAD));
	add(opcionales, isFilledText(form.TELEFONO));
	add(opcionales, isFilledText(form.PASAPORTE));
	add(opcionales, isFilledText(form.ISSS));
	add(opcionales, isFilledText(form.LICENCIA));
	add(opcionales, isFilledNumber(form.PRETENSION_SALARIAL));
	add(opcionales, isFilledText(form.RELIGION));
	add(opcionales, isFilledText(form.IGLESIA));
	add(opcionales, isFilledText(form.DIRECCION_IGLESIA));
	add(opcionales, form.ES_CONTRIBUYENTE_CCF === true);
	add(opcionales, form.ES_JUBILADO === true);
	add(opcionales, form.POSEE_DISCAPACIDAD === true);

	if (form.POSEE_DISCAPACIDAD) {
		add(requeridos, isFilledText(form.TIPO_DISCAPACIDAD));
	}

	return { requeridos, opcionales };
}

function buildPaso2(
	form: FormularioEmpleoData,
	familiaresDirectos: FamiliarDirecto[],
	hijos: HijoRow[]
): { requeridos: ProgressBucket; opcionales: ProgressBucket } {
	const requeridos = emptyBucket();
	const opcionales = emptyBucket();

	add(requeridos, isFilledText(form.EMERGENCIA_NOMBRE));
	add(requeridos, isFilledText(form.EMERGENCIA_TELEFONO));

	add(opcionales, isFilledText(form.EMERGENCIA_PARENTESCO));
	const familiaresBucket = countFamiliarDirectoFields(familiaresDirectos);
	opcionales.llenos += familiaresBucket.llenos;
	opcionales.total += familiaresBucket.total;
	addGridRows(opcionales, hijos.length, countValidHijos(hijos));

	return { requeridos, opcionales };
}

function buildPaso3(
	estudios: EstudioRow[],
	idiomas: IdiomaRow[],
	competencias: CompetenciaRow[]
): { requeridos: ProgressBucket; opcionales: ProgressBucket } {
	const requeridos = emptyBucket();
	const opcionales = emptyBucket();
	addGridRows(opcionales, estudios.length, countValidEstudios(estudios));
	addGridRows(opcionales, idiomas.length, countValidIdiomas(idiomas));
	addGridRows(opcionales, competencias.length, countValidCompetencias(competencias));
	return { requeridos, opcionales };
}

function buildPaso4(experiencias: ExperienciaRow[]): { requeridos: ProgressBucket; opcionales: ProgressBucket } {
	const requeridos = emptyBucket();
	const opcionales = emptyBucket();
	addGridRows(opcionales, experiencias.length, countValidExperiencias(experiencias));
	return { requeridos, opcionales };
}

function buildPaso5(
	form: FormularioEmpleoData,
	familiaresUees: FamiliarUeesRow[]
): { requeridos: ProgressBucket; opcionales: ProgressBucket } {
	const requeridos = emptyBucket();
	const opcionales = emptyBucket();

	add(opcionales, form.TIENE_FAMILIARES_UEES === true);

	if (form.TIENE_FAMILIARES_UEES) {
		addGridRows(opcionales, familiaresUees.length, countValidFamiliaresUees(familiaresUees));
	}

	return { requeridos, opcionales };
}

export function calcularProgresoFormulario(ctx: FormularioProgressContext): FormularioProgressSnapshot {
	const p1 = buildPaso1(ctx.formData);
	const p2 = buildPaso2(ctx.formData, ctx.familiaresDirectos, ctx.hijos);
	const p3 = buildPaso3(ctx.estudios, ctx.idiomas, ctx.competencias);
	const p4 = buildPaso4(ctx.experiencias);
	const p5 = buildPaso5(ctx.formData, ctx.familiaresUees);

	const porPaso: Array<{ paso: 1 | 2 | 3 | 4 | 5; data: typeof p1 }> = [
		{ paso: 1, data: p1 },
		{ paso: 2, data: p2 },
		{ paso: 3, data: p3 },
		{ paso: 4, data: p4 },
	];
	if (ctx.esFormularioCompleto !== false) {
		porPaso.push({ paso: 5, data: p5 });
	}

	const pasos: PasoProgressResumen[] = porPaso.map(({ paso, data }) => {
		const completoRequeridos =
			data.requeridos.total === 0
				? ctx.maxPasoAlcanzado > paso
				: data.requeridos.llenos === data.requeridos.total;

		return {
			paso,
			label: PASO_LABELS[paso],
			requeridos: data.requeridos,
			opcionales: data.opcionales,
			completoRequeridos,
		};
	});

	const requeridos = pasos.reduce((acc, p) => merge(acc, p.requeridos), emptyBucket());
	const opcionales = pasos.reduce((acc, p) => merge(acc, p.opcionales), emptyBucket());
	const total = merge(requeridos, opcionales);

	const declaraciones: DeclaracionesProgress = {
		declaraVerdad: ctx.formData.DECLARA_VERDAD === true,
		autorizaVerificacion: ctx.formData.AUTORIZA_VERIFICACION === true,
		firmaElectronica: isFilledText(ctx.formData.FIRMA_ELECTRONICA),
		requeridasCompletas:
			ctx.formData.DECLARA_VERDAD === true && ctx.formData.AUTORIZA_VERIFICACION === true,
	};

	return {
		total,
		requeridos,
		opcionales,
		porcentaje: pct(total),
		pasos,
		declaraciones,
	};
}

export function formatoBucket(bucket: ProgressBucket): string {
	return `${bucket.llenos} de ${bucket.total}`;
}
