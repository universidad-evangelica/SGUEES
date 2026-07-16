using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_BANCOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string NOMBRE_BANCO { get; set; }
		public string CLASE_BANCO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string CODIGO_TRANSACION_UNI { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int CORR_BANCO { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string NOMBRE_BANCO_CORTO { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public bool? ESTADO_BANCO { get; set; } = true;
	}
}
