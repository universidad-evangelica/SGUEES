// Qué hace: modelo de lectura de persona de contacto del empleado.
// Cómo lo hace: proyecta la fila más nombres de parentesco y tipo de contacto.
using System;

namespace sguees.Models
{
	public class GEN_PERSONA_PARENTESCO_CONTACTOView
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_PARENTESCO_CONTACTO { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public int? CORR_PARENTESCO { get; set; }
		public string NOMBRE_PARENTESCO { get; set; }
		public int? CORR_TIPO_CONTACTO { get; set; }
		public string NOMBRE_TIPO_CONTACTO { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public short? NUMERO_CARACTERES { get; set; }
		public bool? ACTIVO_CARACTERES { get; set; }
		public string FORMATO_CARACTERES { get; set; }
		public string APLICA_PARA { get; set; }
		public string VALOR_CONTACTO { get; set; }
		public string DIRECCION { get; set; }
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
