using eFramework.Data;

namespace SGUEES.Models
{
	/// <summary>Filtros de consulta de movimiento de personal.</summary>
	public class SC_MOVIMIENTO_PERSONALParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public int CORR_UNIDAD { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
