// Qué hace: modelo de lectura proyectado desde V_GEN_EMPLEADO_CONTRATO.
// Cómo lo hace: expone columnas de contrato, plantilla/versión origen, unidad/puesto, adjunto firmado y estado (int: 1=BORRADOR,2=VIGENTE,3=FINALIZADO,4=ANULADO).
using System;

namespace sguees.Models
{
	public class GEN_EMPLEADO_CONTRATOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO_CONTRATO { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public string CODIGO_EMPLEADO { get; set; }
		public string NOMBRE_EMPLEADO { get; set; }
		public string DUI { get; set; }
		public int? CORR_UNIDAD { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public int? CORR_PUESTO { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public int CORR_PLANTILLA_CONTRATO_VERSION { get; set; }
		public int? CORR_PLANTILLA_CONTRATO { get; set; }
		public string NOMBRE_PLANTILLA { get; set; }
		public int? CORR_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public int? NUMERO_VERSION { get; set; }
		public string NOMBRE_VERSION { get; set; }
		public string CUERPO_CONTRATO { get; set; }
		public DateTime FECHA_INICIO { get; set; }
		public DateTime? FECHA_FIN { get; set; }
		public DateTime? FECHA_FIRMA { get; set; }
		public int ESTADO_CONTRATO { get; set; }
		public string NOMBRE_ESTADO_CONTRATO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
		public string RUTA_ARCHIVO { get; set; }
		public bool TIENE_ARCHIVO_FIRMADO { get; set; }
		public DateTime? FECHA_CARGA { get; set; }
		public string MOTIVO_ANULACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}

