namespace sguees.Models
{
	// Qué hace: modelo de lectura de V_CON_CENTRO_COSTO_NIVEL.
	// Cómo lo hace: expone nivel, nombre y auditoría para grillas/forms.
	public class CON_CENTRO_COSTO_NIVELView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CENTRO_COSTO_NIVEL { get; set; }
		public string NOMBRE_NIVEL { get; set; }
		public short? NIVEL { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public System.DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public System.DateTime? FECHA_ACTU { get; set; }
	}
}
