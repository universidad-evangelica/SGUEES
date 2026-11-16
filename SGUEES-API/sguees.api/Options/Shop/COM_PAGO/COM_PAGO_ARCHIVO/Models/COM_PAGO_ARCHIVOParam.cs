using eFramework.Data;

namespace sguees.Models
{
	public class COM_PAGO_ARCHIVOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_ARCHIVO { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public int TIPO_CONSULTA { get; set; } = 1;
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
