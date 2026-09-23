using System;

namespace SGUEES.Models
{
	/// <summary>Fecha de ingreso propuesta de un movimiento nacido en requisición eventual.</summary>
	public class SC_MOVIMIENTO_FECHA_INGRESOParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public DateTime? FECHA_INGRESO_PROPUESTA { get; set; }
	}
}
