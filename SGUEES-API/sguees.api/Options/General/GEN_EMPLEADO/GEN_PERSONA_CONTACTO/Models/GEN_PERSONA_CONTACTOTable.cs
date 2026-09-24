// Qué hace: modelo de escritura de GEN_PERSONA_CONTACTO.
// Cómo lo hace: PK compuesta + tipo, valor y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_CONTACTOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_CONTACTO { get; set; }
		public string VALOR_CONTACTO { get; set; }
		public bool? ACTIVO_CONTACTO { get; set; }
		public int CORR_TIPO_CONTACTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
