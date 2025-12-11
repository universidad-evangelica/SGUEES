using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CONFIGURACION { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
