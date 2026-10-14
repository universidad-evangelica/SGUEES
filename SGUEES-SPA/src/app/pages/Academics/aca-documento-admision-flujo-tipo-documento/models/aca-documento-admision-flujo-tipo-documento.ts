// Qué hace: tipa solicitudes ACA_PROSPECTO, documentos y la marca de cada uno.
// Cómo: el browse usa el tipo de flujo; el popup agrega SELECCION sobre el catálogo.

export interface AcaFlujoTipoProspecto {
	CORR_EMPRESA: number;
	CORR_TIPO_DOCUMENTO: number;
	NOMBRE_TIPO: string;
	DESCRIPCION?: string;
	CODIGO_OPCION?: string;
	ACTIVO?: boolean;
	CANT_DOCUMENTOS: number;
}

export interface AcaDocumentoAdmisionAsignacion {
	CORR_EMPRESA: number;
	CORR_TIPO_DOCUMENTO: number;
	NOMBRE_TIPO?: string;
	CORR_DOCUMENTO_ADMISION: number;
	CODIGO?: string;
	NOMBRE_DOCUMENTO?: string;
	ORDEN?: number;
	OBLIGATORIO?: boolean;
	ACTIVO?: boolean;
}

export interface AcaDocumentoAdmisionItem {
	CORR_DOCUMENTO_ADMISION: number;
	CODIGO: string;
	NOMBRE_DOCUMENTO: string;
	ORDEN: number;
	OBLIGATORIO?: boolean;
	ACTIVO?: boolean;
}

// Qué hace: documento seleccionable en el popup.
// Cómo: agrega el checkbox SELECCION al catálogo.
export interface AcaDocumentoAdmisionSeleccion extends AcaDocumentoAdmisionItem {
	SELECCION: boolean;
}
