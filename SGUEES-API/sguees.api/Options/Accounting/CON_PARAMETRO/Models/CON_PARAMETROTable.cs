using eFramework.Data;

namespace sguees.Models
{
	public class CON_PARAMETROTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public string NOMBRE_PUESTO1 { get; set; }
		public string DESCRIPCION_PUESTO1 { get; set; }
		public string NOMBRE_PUESTO2 { get; set; }
		public string DESCRIPCION_PUESTO2 { get; set; }
		public string NOMBRE_PUESTO3 { get; set; }
		public string DESCRIPCION_PUESTO3 { get; set; }
		public int NIVEL_CUENTA_MAYOR { get; set; }
		public int? CORR_CENTRO_COSTO_DEF { get; set; }
		public int CORR_MONEDA { get; set; }
		public string CUENTA_CONTABLE_PERDIDA { get; set; }
		public string CUENTA_CONTABLE_GANANCIA { get; set; }
		public string CUENTA_CONTABLE_IVA_DEBITO { get; set; }
		public string CUENTA_CONTABLE_IVA_CREDITO { get; set; }
		public string CUENTA_CONTABLE_IVA_RETENIDO { get; set; }
		public string CUENTA_CONTABLE_IVA_PERCIBIDO { get; set; }
		public string CUENTA_CONTABLE_RENTA { get; set; }
		public string CUENTA_CONTABLE_CAJA { get; set; }
		public string CUENTA_CONTABLE_CAJA_CHICA { get; set; }
		public bool APLICAR_DOC_CONTA { get; set; }
		public string PERIODO_MOSTRAR { get; set; }
		public string CARACTER_SEPARADOR { get; set; }
		public string CUENTA_CONTABLE_CAMBIO_DIFERENCIAL { get; set; }
		public int? CORR_CLASE_PARTIDA_DEFAULT { get; set; }
		public bool? OCULTA_CLASE_PARTIDA_BANCOS { get; set; }
		public bool? INCLUIR_PARTIDA_LIQUIDACION { get; set; }
		public bool? INCLUIR_PARTIDA_CIERRE { get; set; }
		public bool? USA_AUXILIARES { get; set; }
		public bool? MOSTRAR_FECHA_IMPRESION { get; set; }
		public string PREFIJO { get; set; }
		public string CUENTA_CONTABLE_CAMBIO_DIF_GASTO { get; set; }
	}
}
