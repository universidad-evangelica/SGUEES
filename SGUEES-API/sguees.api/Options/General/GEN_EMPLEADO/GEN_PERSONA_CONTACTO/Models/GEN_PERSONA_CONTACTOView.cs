// Qué hace: modelo de lectura de contacto de persona (catálogo + valor).
// Cómo lo hace: proyecta campos para el tab Contactos de gen-empleado.
using System;

namespace sguees.Models
{
	public class GEN_PERSONA_CONTACTOView
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_CONTACTO { get; set; }
		public string VALOR_CONTACTO { get; set; }
		public bool? ACTIVO_CONTACTO { get; set; }
		public int CORR_TIPO_CONTACTO { get; set; }
		public string NOMBRE_TIPO_CONTACTO { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public short? NUMERO_CARACTERES { get; set; }
		public bool? ACTIVO_CARACTERES { get; set; }
		public string FORMATO_CARACTERES { get; set; }
		public string APLICA_PARA { get; set; }
		public bool? ACTIVO_TIPO_CONTACTO { get; set; }
		public bool EXISTE { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
