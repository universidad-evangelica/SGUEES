// Qué hace: período académico que se puede marcar en el popup.
// Cómo: toma de V_ACA_PERIODOS_MTTO el año, la sede y el lugar donde aplica.
using System;

namespace SGUEES.Models
{
	public class ACA_PERIODO_ACADEMICO_DOCUMENTOItem
	{
		public int CORR_PERIODO_ACADEMICO { get; set; }
		public int CORR_EMPRESA { get; set; }
		public short ANIO { get; set; }
		public byte? NUMERO_PERIODO { get; set; }
		public DateTime? FECHA_INICIO { get; set; }
		public DateTime? FECHA_FIN { get; set; }
		public bool ACTIVO { get; set; }
		public string NOMBRE_SEDE { get; set; }
		public string NOMBRE_AREA { get; set; }
		public string NOMBRE_FACULTAD { get; set; }
		public string NOMBRE_CARRERA { get; set; }
		public string ALCANCE { get; set; }
	}
}
