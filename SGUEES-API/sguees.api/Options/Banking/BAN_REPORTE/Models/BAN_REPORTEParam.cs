using System;
using eFramework.Data;

namespace sguees.Models
{
	public class BAN_REPORTEParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public string CODIGO_REPORTE { get; set; }
		public DateTime? FECHA_INICIAL { get; set; }
		public DateTime? FECHA_FINAL { get; set; }
		public DateTime? FECHA_IMPRESION { get; set; }
		public int? CORR_CUENTA_BANCO { get; set; }
		public int? CORR_TIPO_MOVIMIENTO { get; set; }
		public int? NUMERO_DOCUMENTO_INICIAL { get; set; }
		public int? NUMERO_DOCUMENTO_FINAL { get; set; }
	}
}
