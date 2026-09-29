// Qué hace: modelo de escritura de PLA_PUESTO_SALARIO.
// Cómo lo hace: salario del puesto en una unidad, con fecha de ingreso y estado.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class PLA_PUESTO_SALARIOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PUESTO_SALARIO { get; set; }
		public decimal? SALARIO_INICIAL { get; set; }
		public decimal? SALARIO_FINAL { get; set; }
		public int? CORR_UNIDAD { get; set; }
		public int? CORR_PUESTO { get; set; }
		public bool? ACTIVO_PUESTO_SALARIO { get; set; }
		public DateTime? FECHA_INGRESO { get; set; }
		public DateTime? FECHA_FINALIZACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
