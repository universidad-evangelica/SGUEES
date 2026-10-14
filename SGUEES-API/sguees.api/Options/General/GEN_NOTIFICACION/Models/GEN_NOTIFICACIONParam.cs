using eFramework.Data;

namespace sguees.Models
{
	public class GEN_NOTIFICACIONParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public int CORR_NOTIFICACION { get; set; }
		public bool SOLO_NO_LEIDAS { get; set; }
		public int PAGE { get; set; } = 1;
		public int PAGE_SIZE { get; set; } = 20;
	}
}
