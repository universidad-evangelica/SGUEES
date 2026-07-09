using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_REQUISICION_OBSERVADORESTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
        public int? CORR_REQUISICION_PERSONAL { get; set; }
        public int CORR_REQUISICION_OBSERVADORES { get; set; }
		public string LOGIN_SISTEMA { get; set; }
        public string TIPO_OBSERVADOR { get; set; } //D DEFECTO/ R REQUISICION
        public DateTime FECHA_ASIGNACION { get; set; }
        public bool ACTIVO { get; set; } //Estado observador
        public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
