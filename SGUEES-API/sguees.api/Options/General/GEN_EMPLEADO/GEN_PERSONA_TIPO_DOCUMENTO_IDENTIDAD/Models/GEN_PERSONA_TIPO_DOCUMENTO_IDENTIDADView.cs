// Qué hace: modelo de lectura de documento de identidad de persona (catálogo + valor).
// Cómo lo hace: proyecta campos para el tab Documentos de gen-empleado.
using System;

namespace sguees.Models
{
	public class GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADView
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public string NOMBRE_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public short? NUMERO_CARACTERES { get; set; }
		public bool? ACTIVO_CARACTERES { get; set; }
		public string FORMATO_CARACTERES { get; set; }
		public string APLICA_PARA { get; set; }
		public bool? ACTIVO_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public string VALOR_DOCUMENTO { get; set; }
		public bool EXISTE { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
