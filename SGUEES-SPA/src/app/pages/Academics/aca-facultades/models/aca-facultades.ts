// Qué hace: modelo TypeScript de una facultad (ACA_FACULTADES / V_ACA_FACULTADES).
// Cómo lo hace: campos de formulario y auditoría; los conteos y las sedes vienen de la vista y son solo lectura.
export interface AcaFacultades {
	CORR_FACULTAD: number;
	CORR_EMPRESA: number;
	CODIGO_FACULTAD: string;
	NOMBRE_FACULTAD: string;
	ACTIVO: boolean;
    CORR_DECANO?:number|null;
    NOMBRE_DECANO?:string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
	CARRERAS_ACTIVAS?: number;
	CARRERAS?: number;
	PERIODOS?: number;
	SEDES?: string;
}
