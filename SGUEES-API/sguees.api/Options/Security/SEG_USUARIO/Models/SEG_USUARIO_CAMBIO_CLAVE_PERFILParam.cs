using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
	public class SEG_USUARIO_CAMBIO_CLAVE_PERFILParam
	{
		[Required(ErrorMessage = "Debe especificar la clave actual")]
		public string CLAVE_USUARIO { get; set; }

		[Required(ErrorMessage = "Debe especificar una clave nueva")]
		public string CLAVE_USUARIO_NUEVA { get; set; }

		[Required(ErrorMessage = "Debe confirmar la clave")]
		public string CLAVE_CONFIRMAR { get; set; }

		public string CODIGO_SUITE { get; set; } = "SGUEES";
	}
}
