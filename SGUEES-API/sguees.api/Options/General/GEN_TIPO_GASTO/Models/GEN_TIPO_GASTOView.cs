using System;

namespace scuees.Models
{
	public class GEN_TIPO_GASTOView
	{
		public int CORR_SUSCRIPCION { get; set; }
		public int CORR_CONFI_PAIS { get; set; }
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public string NOMBRE_TIPO_GASTO { get; set; }
		public bool ES_SERVICIO { get; set; }
		public bool ES_INTANGIBLE { get; set; }
	}
}
