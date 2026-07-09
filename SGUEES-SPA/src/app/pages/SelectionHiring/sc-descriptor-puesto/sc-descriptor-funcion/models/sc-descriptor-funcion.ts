import { ScDescriptorFuncionActividad } from '../../sc-descriptor-funcion-actividad/models/sc-descriptor-funcion-actividad';

export interface ScDescriptorFuncion {
	CORR_EMPRESA?: number;
	CORR_DESCRIPTOR_PUESTO?: number;
	CORR_FUNCION: number;
	NOMBRE_FUNCION: string;
	TIPO_FUNCION: string;
	CANT_ACTIVIDADES?: number;
	actividadesPendientes?: ScDescriptorFuncionActividad[];
	_marcadaEliminar?: boolean;
}
