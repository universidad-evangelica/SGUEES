using eFramework.Data;

namespace sguees.Models
{
	public class CON_DIVISIONView : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DIVISION { get; set; }
		public string NOMBRE_DIVISION { get; set; } = "";
		public string CODIGO_DIVISION { get; set; } = "";
	}
}
