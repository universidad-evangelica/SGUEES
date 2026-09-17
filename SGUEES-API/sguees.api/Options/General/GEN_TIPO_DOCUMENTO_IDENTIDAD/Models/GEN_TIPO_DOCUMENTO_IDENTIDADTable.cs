// Qué hace: modelo de tabla GEN_TIPO_DOCUMENTO_IDENTIDAD.
// Cómo lo hace: define PK, nombres, activo, validación de caracteres y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_DOCUMENTO_IDENTIDADTable : BaseEntity
	{
		public int CORR_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public string NOMBRE_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public bool? ACTIVO_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public short? NUMERO_CARACTERES { get; set; }
		public bool? ACTIVO_CARACTERES { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
