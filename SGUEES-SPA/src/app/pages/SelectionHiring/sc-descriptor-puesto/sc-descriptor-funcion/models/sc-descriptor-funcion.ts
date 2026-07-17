import { ScDescriptorFuncionActividad } from '../../sc-descriptor-funcion-actividad/models/sc-descriptor-funcion-actividad';

// Función clave o secundaria del descriptor. `_clientKey` identifica filas temporales del grid;
// `actividadesPendientes` guarda actividades aún no sincronizadas de una función nueva.
export interface ScDescriptorFuncion {
	CORR_EMPRESA?: number;
	CORR_DESCRIPTOR_PUESTO?: number;
	CORR_FUNCION: number;
	NOMBRE_FUNCION: string;
	TIPO_FUNCION: string;
	CANT_ACTIVIDADES?: number;
	actividadesPendientes?: ScDescriptorFuncionActividad[];
	_marcadaEliminar?: boolean;
	_clientKey?: string | number;
}
