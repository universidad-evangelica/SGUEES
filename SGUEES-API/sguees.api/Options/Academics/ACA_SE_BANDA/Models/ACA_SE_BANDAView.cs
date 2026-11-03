// Qué hace: fila de V_ACA_SE_BANDA.
using System;

namespace sguees.Models
{
	public class ACA_SE_BANDAView
	{
		public int CORR_BANDA { get; set; }
		public string CODIGO_REGLA { get; set; }
		public decimal VALOR_DESDE { get; set; }
		public decimal VALOR_HASTA { get; set; }
		public decimal PUNTAJE { get; set; }
		public bool? ACTIVO { get; set; }
		public int CORR_EMPRESA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
	}
}
