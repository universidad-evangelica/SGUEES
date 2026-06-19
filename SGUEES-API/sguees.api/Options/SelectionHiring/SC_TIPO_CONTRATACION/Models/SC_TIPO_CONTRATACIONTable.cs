using System;
using System.ComponentModel.DataAnnotations;
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_TIPO_CONTRATACIONTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_CONTRATACION { get; set; }
		[MaxLength(250)]
        public string NOMBRE_TIPO_CONTRATACION { get; set; }
        public bool ES_PERMANENTE { get; set; } //es permanente o eventual
		[MaxLength(100)]
        public string AREA_APLICADA { get; set; } //Aplica a Todos, adminsitrativo, docente, investigador
		public bool ACTIVO { get; set; } = true; //Activo o inactivo
        public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }

		
	}
}
