using System;

namespace SGUEES.Models
{
	public class SC_EXPEDIENTE_ENTREVISTAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_EXPEDIENTE_ENTREVISTA { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public string TIPO_ENTREVISTA { get; set; }
		public DateTime FECHA_ENTREVISTA { get; set; }
		public string ENTREVISTADOR { get; set; }
		public string ESTADO_ENTREVISTA { get; set; }
		public string RESULTADO_ENTREVISTA { get; set; }
		public string RESUMEN_ENTREVISTA { get; set; }
		public string CORREO_INVITACION { get; set; }
		public string NOMBRE_SOLICITUD { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
