// Qué hace: modelo de lectura del tab Salarios (V_PLA_PUESTO_SALARIO).
// Cómo lo hace: proyecta el salario y el nombre de la unidad del puesto.
using System;

namespace SGUEES.Models
{
	public class PLA_PUESTO_SALARIOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PUESTO_SALARIO { get; set; }
		public decimal? SALARIO_INICIAL { get; set; }
		public decimal? SALARIO_FINAL { get; set; }
		public int? CORR_UNIDAD { get; set; }
		public string CODIGO_UNIDAD { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public int? CORR_PUESTO { get; set; }
		public string CODIGO_PUESTO { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public bool? ACTIVO_PUESTO_SALARIO { get; set; }
		public DateTime? FECHA_INGRESO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
