using System;
using eFramework.Data;

namespace sguees.Models
{
	public class BAN_CONCILIA_BANCARIATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public int CORR_CONCILIACION { get; set; }
		public DateTime FECHA_CONCILIACION { get; set; }
		public decimal? SALDO_CUENTA_BANCO { get; set; }
		public decimal? SALDO_CUENTA_CONTA { get; set; }
		public string ESTADO_CONCILIACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
