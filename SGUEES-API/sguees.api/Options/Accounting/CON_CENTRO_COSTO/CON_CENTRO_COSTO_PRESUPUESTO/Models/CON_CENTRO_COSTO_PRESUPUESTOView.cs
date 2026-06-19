namespace sguees.Models
{
	public class CON_CENTRO_COSTO_PRESUPUESTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_CENTRO { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public decimal MONTO_PRESUPUESTO { get; set; }
	}
}
