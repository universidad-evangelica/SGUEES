using eFramework.Data;

namespace SGUEES.Models
{
	public class GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
		public int CORR_DEPTO { get; set; }
		public int CORR_MUNICIPIO { get; set; }
		public int CORR_DISTRITO { get; set; }
		public string BUSQUEDA { get; set; }
		public string NOMBRE_DISTRITO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
