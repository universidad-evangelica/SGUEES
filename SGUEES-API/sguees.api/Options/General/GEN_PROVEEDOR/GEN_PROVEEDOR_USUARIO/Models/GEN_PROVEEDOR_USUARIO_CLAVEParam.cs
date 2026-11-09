using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
	public class GEN_PROVEEDOR_USUARIO_CLAVEParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }

		[Required(ErrorMessage = "Debe especificar el login")]
		public string LOGIN_SISTEMA { get; set; }

		[Required(ErrorMessage = "Debe especificar la clave nueva")]
		public string CLAVE_USUARIO_NUEVA { get; set; }

		[Required(ErrorMessage = "Debe confirmar la clave")]
		public string CLAVE_CONFIRMAR { get; set; }
	}
}
