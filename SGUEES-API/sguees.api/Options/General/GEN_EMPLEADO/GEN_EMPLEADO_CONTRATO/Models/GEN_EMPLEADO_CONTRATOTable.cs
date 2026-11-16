// Qué hace: entidad de persistencia para la tabla GEN_EMPLEADO_CONTRATO.
// Cómo lo hace: mapea exactamente las columnas reales de SQL Server (ESTADO_CONTRATO como int: 1=BORRADOR, 2=VIGENTE, 3=FINALIZADO, 4=ANULADO).
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_EMPLEADO_CONTRATOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO_CONTRATO { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public int? CORR_UNIDAD { get; set; }
		public int? CORR_PUESTO { get; set; }
		public int CORR_PLANTILLA_CONTRATO_VERSION { get; set; }
		public string CUERPO_CONTRATO { get; set; }
		public DateTime FECHA_INICIO { get; set; }
		public DateTime? FECHA_FIN { get; set; }
		public DateTime? FECHA_FIRMA { get; set; }
		public int ESTADO_CONTRATO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
		public string RUTA_ARCHIVO { get; set; }
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

