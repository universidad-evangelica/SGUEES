using System;
using eFramework.Data;

namespace sguees.Models
{
	public class BAN_SOLI_CHEQUEParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public DateTime? FECHA_INICIAL { get; set; }
		public DateTime? FECHA_FINAL { get; set; }
		public bool? MUESTRA_CHEQUES { get; set; }
		public string ESTADO_DOCUMENTO { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public bool? EXCLUIR_ANULADOS { get; set; }
	}
}
