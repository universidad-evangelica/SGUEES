using eFramework.Data;

namespace sguees.Models
{
	public class BAN_CUENTA_BANCARIATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public bool? VALIDAR_SALDO { get; set; }
		public string TIPO_CUENTA_BANCO { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_REPORTE { get; set; }
		public bool? USA_TRANSACIONES_UNI { get; set; }
		public int? CORR_CENTRO_COSTO { get; set; }
		public string ESTADO_CUENTA { get; set; }
		public int CORR_MONEDA { get; set; }
		public bool? NO_PERMITE_CHEQUES { get; set; }
		public string CODIGO_EMPRESARIAL_PROV { get; set; }
		public bool? VALIDA_FECHA { get; set; }
		public int CORR_BANCO { get; set; }
		public bool NO_PERMITE_MODIFICAR { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public string CLASE_CHEQUE { get; set; }
		public string NUMERO_CUENTA_BANCO { get; set; }
		public bool? PAGA_PLANILLA { get; set; }
		public string CODIGO_EMPRESARIAL { get; set; }
	}
}
