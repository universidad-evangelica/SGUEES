using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: parámetros de consulta de bitácora por llave de partida.
	// Cómo lo hace: filtra por empresa, periodo, clase y número de partida.
	public class CON_PARTIDA_BITACORAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public int CORR_PARTIDA_BITACORA { get; set; }
	}
}
