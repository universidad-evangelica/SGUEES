// Qué hace: modelo de escritura de GEN_PERSONA_EXPERIENCIA_LABORAL.
// Cómo lo hace: define PK compuesta + datos laborales y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_EXPERIENCIA_LABORALTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_EXPERIENCIA_LABORAL { get; set; }
		public string LUGAR_TRABAJO { get; set; }
		public string CARGO_DESEMPENADO { get; set; }
		public string TELEFONO { get; set; }
		public string JEFE_INMEDIATO { get; set; }
		public decimal? SALARIO_INICIAL { get; set; }
		public decimal? SALARIO_FINAL { get; set; }
		public DateTime? FECHA_INICIO { get; set; }
		public DateTime? FECHA_FIN { get; set; }
		public int? PERIODO_INICIAL { get; set; }
		public int? PERIODO_FINAL { get; set; }
		public string PERIODO { get; set; }
		public string MOTIVO_SALIDA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
