using System;

namespace eadmindevprojectmanagement.Models
{
	public class COM_PROVISIONView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PROVISION { get; set; }
		public DateTime FECHA_PROVISION { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public decimal MONTO_PAGO { get; set; }
		public int? ANIO_PERIODO_PARTIDA { get; set; }
		public int? MES_PERIODO_PARTIDA { get; set; }
		public int? CORR_CLASE_PARTIDA { get; set; }
		public string NOMBRE_CLASE_PARTIDA { get; set; }
		public int? CORR_PARTIDA { get; set; }
		public string ESTADO_PROVISION { get; set; }
		public string NOMBRE_ESTADO_PROVISION { get; set; }
		public DateTime? FECHA_ANULACION { get; set; }
		public int? ANIO_PERIODO_PARTIDA_ANULACION { get; set; }
		public int? MES_PERIODO_PARTIDA_ANULACION { get; set; }
		public int? CORR_CLASE_PARTIDA_ANULACION { get; set; }
		public int? CORR_PARTIDA_ANULACION { get; set; }
		public string NOMBRE_BENEFICIARIO { get; set; }
		public bool NO_CONTABILIZAR { get; set; }
	}
}
