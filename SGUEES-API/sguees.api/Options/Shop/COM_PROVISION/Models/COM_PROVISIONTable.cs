using System;
using eFramework.Data;

namespace eadmindevprojectmanagement.Models
{
	public class COM_PROVISIONTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PROVISION { get; set; }
		public DateTime FECHA_PROVISION { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public decimal MONTO_PAGO { get; set; }
		public int? ANIO_PERIODO_PARTIDA { get; set; }
		public int? MES_PERIODO_PARTIDA { get; set; }
		public int? CORR_CLASE_PARTIDA { get; set; }
		public int? CORR_PARTIDA { get; set; }
		public string ESTADO_PROVISION { get; set; }
		public int? ANIO_PERIODO_PARTIDA_ANULACION { get; set; }
		public int? MES_PERIODO_PARTIDA_ANULACION { get; set; }
		public int? CORR_CLASE_PARTIDA_ANULACION { get; set; }
		public int? CORR_PARTIDA_ANULACION { get; set; }
		public DateTime? FECHA_ANULACION { get; set; }
		public string NOMBRE_BENEFICIARIO { get; set; }
		public string USUARIO_ACTU { get; set; }
	}
}
