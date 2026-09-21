// Qué hace: modelo de escritura de GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD.
// Cómo lo hace: define PK compuesta + VALOR_DOCUMENTO y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public string VALOR_DOCUMENTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
