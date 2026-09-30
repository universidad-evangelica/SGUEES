// Qué hace: modelo de vista V_GEN_TIPO_DOCUMENTO_IDENTIDAD.
// Cómo lo hace: proyecta catálogo + nombres de listas FORMATO_CARACTERES / APLICA_PARA.
using System;

namespace sguees.Models
{
	public class GEN_TIPO_DOCUMENTO_IDENTIDADView
	{
		public int CORR_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public string NOMBRE_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public bool? ACTIVO_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public short? NUMERO_CARACTERES { get; set; }
		public bool? ACTIVO_CARACTERES { get; set; }
		public string FORMATO_CARACTERES { get; set; }
		public string NOMBRE_FORMATO_CARACTERES { get; set; }
		public string APLICA_PARA { get; set; }
		public string NOMBRE_APLICA_PARA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
