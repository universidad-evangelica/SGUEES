// Modelo TypeScript de inducción (campos del formulario y grilla).
export interface ScInduccion {
	CORR_EMPRESA: number;
	CORR_INDUCCION: number;
	NOMBRE_INDUCCION: string;
	TIEMPO_INDUCCION: number;
	UNIDAD_TIEMPO: string; // 'Semanas' | 'Meses'
	ESTADO_INDUCCION: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}

export const UNIDAD_TIEMPO_SEMANAS = 'Semanas';
export const UNIDAD_TIEMPO_MESES = 'Meses';
