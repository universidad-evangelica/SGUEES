export interface ScSolicitudEmpleo {
	CORR_EMPRESA: number;
	CORR_SOLICITUD_EMPLEO: number;
	FECHA_GENERACION: Date;
	CORREO_INVITACION: string;
	DUI: string;
	NOMBRE: string;
	/** FK al catálogo SC_TIPO_CONTRATACION; es lo único que se persiste. */
	CORR_TIPO_CONTRATACION: number;
	/** Nombre del tipo: lo trae la vista (JOIN), no se guarda. */
	NOMBRE_TIPO_CONTRATACION?: string;
	/** Bit del catálogo (fija = true). Lo trae la vista; no se guarda. */
	ES_PERMANENTE?: boolean;
	CORR_PERSONA_DATOS: number;
	ACTIVO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
