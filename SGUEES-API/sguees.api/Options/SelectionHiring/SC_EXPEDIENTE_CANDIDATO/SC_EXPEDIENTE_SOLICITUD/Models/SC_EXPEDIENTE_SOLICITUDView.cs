using System;

namespace SGUEES.Models
{
	public class SC_EXPEDIENTE_SOLICITUDView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_EXPEDIENTE_SOLICITUD { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public DateTime? FECHA_SOLICITUD { get; set; }
		public string CORREO_INVITACION { get; set; }
		public string DUI_SOLICITUD { get; set; }
		public string NOMBRE_SOLICITUD { get; set; }
		public int CORR_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public int CORR_PERSONA_DATOS { get; set; }
		public bool? ACTIVO_SOLICITUD { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
