using eFramework.Data;

namespace sguees.Models
{
	public class BAN_LINEA_TRABAJO_CONCILIACIONTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_LINEA { get; set; }
		public string NOMBRE_LINEA_TRABAJO { get; set; }
		public int AUMENTA_DISMINUYE { get; set; }
	}
}
