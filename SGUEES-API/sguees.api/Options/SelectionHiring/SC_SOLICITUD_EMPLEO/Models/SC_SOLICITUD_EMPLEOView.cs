using System;

namespace sguees.Models
{
	public class SC_SOLICITUD_EMPLEOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
        public DateTime FECHA_GENERACION { get; set; }
        public string CORREO_INVITACION { get; set; }
        public string DUI { get; set; } //Documento identidad
        public string NOMBRE { get; set; }
        public int CORR_TIPO_CONTRATACION { get; set; }
        // Nombre y bit vienen del JOIN a SC_TIPO_CONTRATACION (no se guardan en la solicitud).
        public string NOMBRE_TIPO_CONTRATACION { get; set; }
        public bool ES_PERMANENTE { get; set; } //es permanente o eventual
        public int? CORR_PERSONA_DATOS { get; set; } = null; //Se llena al completar el formulario público
        public bool ACTIVO { get; set; } = true; //Activo o inactivo
        public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
