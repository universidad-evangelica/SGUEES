namespace sguees.Models
{
	public class CON_CATALOGO_CUENTAView
	{
		public int CORR_EMPRESA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public bool ES_DEBE { get; set; }
		public bool ES_HABER { get; set; }
		public bool ES_DETALLE { get; set; }
		public int NIVEL { get; set; }
		public string CUENTA_MAYOR { get; set; }
		public string CODIGO_RUBRO { get; set; }
		public string NOMBRE_RUBRO { get; set; }
		public bool NO_HABILITADA { get; set; }
		public string CLASE_RUBRO { get; set; }
		public string NOMBRE_CLASE_RUBRO { get; set; }
		public bool? ES_LIQUIDADORA { get; set; }
		public string CLASE_VALUACION { get; set; }
		public string NOMBRE_CLASE_VALUACION { get; set; }
	}
}
