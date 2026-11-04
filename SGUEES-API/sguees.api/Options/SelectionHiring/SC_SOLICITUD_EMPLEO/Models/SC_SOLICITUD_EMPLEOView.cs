using System;

namespace sguees.Models
{
	public class SC_SOLICITUD_EMPLEOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
        public DateTime FECHA_GENERACION { get; set; }
        public string CORREO_INVITACION { get; set; }
        public string DUI { get; set; } // Documento identidad
        public string NOMBRE { get; set; }
        public int CORR_TIPO_CONTRATACION { get; set; }
        // Nombre y bit vienen del JOIN a SC_TIPO_CONTRATACION (no se guardan en la solicitud).
        public string NOMBRE_TIPO_CONTRATACION { get; set; }
        public bool ES_PERMANENTE { get; set; } // Es permanente o eventual
        public int? CORR_PERSONA_DATOS { get; set; } = null; // Se llena al completar el formulario público
        // Qué hace: Indica si la solicitud ya está vinculada a un expediente de candidato.
        // Cómo lo hace: Se obtiene mediante subconsulta EXISTS en la tabla SC_EXPEDIENTE_SOLICITUD desde la vista SQL.
        public bool TIENE_EXPEDIENTE { get; set; } = false;
        // Qué hace: Identificador del expediente de candidato vinculado si existe.
        // Cómo lo hace: Se lee de la tabla SC_EXPEDIENTE_SOLICITUD a través de la vista SQL.
        public int? CORR_EXPEDIENTE_CANDIDATO { get; set; }
        // Qué hace: Indica si la solicitud ya tiene tokens generados o enviados al candidato.
        // Cómo lo hace: Se evalúa mediante subconsulta EXISTS en SC_SOLICITUD_EMPLEO_TOKEN o FECHA_GENERACION no nula.
        public bool TIENE_TOKEN { get; set; } = false;
        public bool ACTIVO { get; set; } = true; // Activo o inactivo
        public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
