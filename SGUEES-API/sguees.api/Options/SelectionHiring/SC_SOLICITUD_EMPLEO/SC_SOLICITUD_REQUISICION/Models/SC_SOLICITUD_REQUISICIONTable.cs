using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_SOLICITUD_REQUISICIONTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
        public int CORR_SOLICITUD_REQUISICION { get; set; }
        public int CORR_SOLICITUD_EMPLEO { get; set; }
        public int CORR_REQUISICION_PERSONAL { get; set; }

        public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
