// Qué hace: modelo de escritura de GEN_PERSONA_PARENTESCO_CONTACTO.
// Cómo lo hace: PK compuesta + persona de contacto, tipo, valor y emergencia.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_PARENTESCO_CONTACTOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_PARENTESCO_CONTACTO { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public int? CORR_PARENTESCO { get; set; }
		public int? CORR_TIPO_CONTACTO { get; set; }
		public string VALOR_CONTACTO { get; set; }
		public string DIRECCION { get; set; }
		public bool? ES_EXTRANJERO { get; set; }
		public bool? PARENTESCO_CONTACTO_EMERGENCIA { get; set; }
		public bool? ACTIVO_PARENTESCO_CONTACTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
