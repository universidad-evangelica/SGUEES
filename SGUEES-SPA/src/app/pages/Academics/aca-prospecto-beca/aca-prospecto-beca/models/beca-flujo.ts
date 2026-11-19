export interface BecaSolicitudFlujo {
  CORR_PROSPECTO_BECA:number;
  VERSION_REGISTRO:string;
  ESTADO_BECA:string;
  ESTADO_TEXTO:string;
  CORR_INSTANCIA:number|null;
  NOMBRE_PASO:string;
  RESPONSABLE:string;
  FECHA_INICIO:string|null;
  FECHA_RESOLUCION:string|null;
  DIAS_EN_PASO:number|null;
  OBSERVACION_RESOLUCION:string|null;
  PUEDE_INICIAR:boolean;
  PUEDE_RESOLVER:boolean;
  PUEDE_MODIFICAR:boolean;
}

export interface BecaResolucion {
  CORR_PROSPECTO_BECA:number;
  VERSION_REGISTRO:string;
  OBSERVACION:string;
}

export interface BecaBitacoraFlujo {
  CORR_BITACORA:number; FECHA:string; USUARIO:string; PASO:string;
  ESTADO_ANTERIOR:string|null; ESTADO_NUEVO:string; COMENTARIO:string;
}

export interface BecaBitacoraEdicion {
  CORR_BITACORA_BECA:number; FECHA:string; USUARIO:string; DESCRIPCION:string;
  VALOR_ANTERIOR:string|null; VALOR_NUEVO:string|null;
}
