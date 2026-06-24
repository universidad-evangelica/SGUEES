using eFramework.Data;

namespace sguees.Models
{
	public class CON_PERIODO_CONTABLETable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public string ESTADO_PERIODO_CON { get; set; }
		public string ESTADO_PERIODO_BAN { get; set; }
		public string ESTADO_PERIODO_VEN { get; set; }
		public string ESTADO_PERIODO_ACT { get; set; }
		public string ESTADO_PERIODO_INV { get; set; }
		public string ESTADO_PERIODO_PLA { get; set; }
		public string ESTADO_PERIODO_COM { get; set; }
		public DateTime? FECHA_CIERRE_CON { get; set; }
		public DateTime? FECHA_CIERRE_BAN { get; set; }
		public DateTime? FECHA_CIERRE_VEN { get; set; }
		public DateTime? FECHA_CIERRE_ACT { get; set; }
		public DateTime? FECHA_CIERRE_INV { get; set; }
		public DateTime? FECHA_CIERRE_PLA { get; set; }
		public DateTime? FECHA_CIERRE_COM { get; set; }
	}
}
