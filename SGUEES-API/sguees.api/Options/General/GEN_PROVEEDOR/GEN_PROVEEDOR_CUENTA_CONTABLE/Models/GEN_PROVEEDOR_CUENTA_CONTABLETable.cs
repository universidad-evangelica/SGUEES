using System;
using System.ComponentModel.DataAnnotations;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PROVEEDOR_CUENTA_CONTABLETable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int CORR_CUENTA { get; set; }

		[Required(ErrorMessage = "Debe seleccionar el tipo de cuenta")]
		[StringLength(3, MinimumLength = 3, ErrorMessage = "Debe seleccionar el tipo de cuenta")]
		public string TIPO_CUENTA { get; set; }

		[Required(ErrorMessage = "Debe seleccionar la cuenta contable")]
		[StringLength(30, MinimumLength = 1, ErrorMessage = "Debe seleccionar la cuenta contable")]
		public string CUENTA_CONTABLE { get; set; }

		public bool ACTIVO { get; set; } = true;
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
