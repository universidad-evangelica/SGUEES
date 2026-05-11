using System;
using eFramework.Data;

namespace sguees.Models
{
	public class PLA_DEPARTAMENTOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DEPARTAMENTO { get; set; }
		public string NOMBRE_DEPARTAMENTO { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string CODIGO_DEPARTAMENTO { get; set; }
		public string CLASE_DEPARTAMENTO { get; set; }
		public int CORR_EMPLEADO_JEFE { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
