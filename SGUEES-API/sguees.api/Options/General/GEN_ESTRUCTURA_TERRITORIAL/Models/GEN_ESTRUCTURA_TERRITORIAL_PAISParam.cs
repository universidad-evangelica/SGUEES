using eFramework.Data;

namespace SGUEES.Models
{
	public class GEN_ESTRUCTURA_TERRITORIAL_PAISParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
		public string BUSQUEDA { get; set; }
		public string NOMBRE_PAIS { get; set; }
		public string CODIGO_PAIS { get; set; }
		public string NACIONALIDAD { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public int PAGE { get; set; } = 1;
		public int PAGE_SIZE { get; set; } = 10;
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
