using eFramework.Data;

namespace sguees.Models
{
	public class BAN_TIPO_CHEQUETable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public string CLASE_TIPO_CHEQUE { get; set; }
		public int CORR_TIPO_CHEQUE { get; set; }
		public string NOMBRE_TIPO_CHEQUE { get; set; }
		public bool CONTABILIZAR_LUEGO_DE_IMPRIMIR { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public bool? ESTADO_TIPO_CHEQUE { get; set; } = true;
	}
}
