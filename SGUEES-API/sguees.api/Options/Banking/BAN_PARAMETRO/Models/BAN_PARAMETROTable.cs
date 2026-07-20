using eFramework.Data;

namespace sguees.Models
{
	public class BAN_PARAMETROTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public bool CONTABILIZAR_LUEGO_DE_APLICAR { get; set; }
		public bool CONTABILIZAR_LUEGO_DE_IMPRIMIR { get; set; }
	}
}
