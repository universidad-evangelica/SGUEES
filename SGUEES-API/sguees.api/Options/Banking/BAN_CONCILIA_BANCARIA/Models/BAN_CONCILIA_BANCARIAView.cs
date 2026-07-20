using System;

namespace sguees.Models
{
	public class BAN_CONCILIA_BANCARIAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public string NUMERO_CUENTA_BANCO { get; set; }
		public string NOMBRE_CUENTA_BANCO { get; set; }
		public string NOMBRE_TIPO_CUENTA_BANCO { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public int CORR_CONCILIACION { get; set; }
		public DateTime FECHA_CONCILIACION { get; set; }
		public decimal? SALDO_CUENTA_CONTA { get; set; }
		public decimal? SALDO_CUENTA_BANCO { get; set; }
		public decimal MONTO_AUMENTA { get; set; }
		public decimal MONTO_DISMINUYE { get; set; }
		public decimal SEGUN_LIBROS { get; set; }
		public string ESTADO_CONCILIACION { get; set; }
		public string NOMBRE_ESTADO_CONCILIACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
