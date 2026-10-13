using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_NOTIFICACIONTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_NOTIFICACION { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public string TITULO { get; set; }
		public string MENSAJE { get; set; }
		public string URL_DESTINO { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public bool LEIDA { get; set; }
		public DateTime? FECHA_LECTURA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
