using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_SOLICITUD_EMPLEOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
        public DateTime FECHA_GENERACION { get; set; }
        public string CORREO_INVITACION { get; set; }
        public int? CORR_CANDIDATO { get; set; } = null; //Se llenará al recibir la data del candidato
        public bool ACTIVO { get; set; } = true; //Activo o inactivo

        public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
