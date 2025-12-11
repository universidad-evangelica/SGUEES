using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using eFramework.Data;

namespace sguees.Models
{
	public class SEG_USUARIOTable : BaseEntity
	{
		[Required(ErrorMessage = "Debe especificar el Login")]
		[StringLength(30, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 30 caracteres")]
		public string LOGIN_SISTEMA { get; set; }
		[Required(ErrorMessage = "Debe especificar el nombre completo del usuario")]
		[StringLength(100, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 100 caracteres")]
		public string NOMBRE_USUARIO { get; set; }
		public byte[] CLAVE_USUARIO { get; set; }
		public byte[] CLAVE_USUARIO_SAL { get; set; }
		[Required(ErrorMessage = "Debe especificar el correo electrónico")]
		[StringLength(255, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 100 caracteres")]
		public string CORREO_ELECTRONICO { get; set; }
		public int TIPO_USUARIO { get; set; }
		public int ESTADO_USUARIO { get; set; }
		public string IDIOMA { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string USUARIO_AD { get; set; }
		public int CORR_SUSCRIPCION { get; set; }
		public int CORR_CONFI_PAIS { get; set; }
		public int CORR_EMPRESA { get; set; }
		public List<SEG_USUARIO_OPCIONView> DETALLE { get; set; }
		public SEG_USUARIOTable()
		{
			FECHA_CREA = DateTime.Now;
			FECHA_ACTU = DateTime.Now;
		}
	}
}
