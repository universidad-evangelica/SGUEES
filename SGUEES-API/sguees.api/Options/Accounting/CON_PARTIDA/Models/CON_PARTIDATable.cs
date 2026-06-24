using System;
using eFramework.Data;

namespace sguees.Models
{
	public class CON_PARTIDATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public DateTime FECHA_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public string ESTADO_PARTIDA { get; set; }
		public string CLASE_PARTIDA { get; set; }
		public int? CORR_MONEDA { get; set; }
		public decimal? FACTOR_CAMBIO { get; set; }
		public string OPERADOR { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
