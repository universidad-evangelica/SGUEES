using System;
using System.ComponentModel.DataAnnotations;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PROVEEDOR_USUARIOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }

		[Required(ErrorMessage = "Debe especificar el login")]
		[StringLength(30, MinimumLength = 4, ErrorMessage = "El login debe tener entre 4 y 30 caracteres")]
		public string LOGIN_SISTEMA { get; set; }

		[Required(ErrorMessage = "Debe especificar el nombre del usuario")]
		[StringLength(100, MinimumLength = 4, ErrorMessage = "El nombre debe tener entre 4 y 100 caracteres")]
		public string NOMBRE_USUARIO { get; set; }

		[Required(ErrorMessage = "Debe especificar el correo electrónico")]
		[StringLength(255, MinimumLength = 4, ErrorMessage = "El correo debe tener entre 4 y 255 caracteres")]
		public string CORREO_ELECTRONICO { get; set; }

		public int ESTADO_USUARIO { get; set; } = 1;
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
