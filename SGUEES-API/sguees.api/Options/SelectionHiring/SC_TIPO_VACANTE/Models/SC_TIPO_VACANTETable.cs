using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_TIPO_VACANTETable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_VACANTE { get; set; }
		public string NOMBRE_TIPO_VACANTE { get; set; }
        public bool REQUIERE_SUSTITUCION { get; set; } //Requiere sustitucion o no
		public bool ACTIVO { get; set; } = true; //Activo o inactivo
        public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
