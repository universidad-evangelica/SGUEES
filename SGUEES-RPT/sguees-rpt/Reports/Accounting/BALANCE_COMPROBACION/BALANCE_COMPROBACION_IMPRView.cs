using System;

namespace sgueesRpt.Models
{
	public class BALANCE_COMPROBACION_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public string NOMBRE_EMPRESA { get; set; }
		public string PERIODO { get; set; }
		public byte[] LOGO1 { get; set; }
		public byte[] LOGO2 { get; set; }
		public string TITULO_REPORTE { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public DateTime FECHA_IMPRESION { get; set; }

		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public decimal SALDO_INICIAL { get; set; }
		public decimal CARGO_PERIODO { get; set; }
		public decimal ABONO_PERIODO { get; set; }
		public decimal SALDO_FINAL { get; set; }
		public string CUENTA_CONTABLE1 { get; set; }
		public string NOMBRE_CUENTA1 { get; set; }
		public decimal SALDO_FINAL1 { get; set; }
		public int NIVEL1 { get; set; }
		public string CUENTA_CONTABLE2 { get; set; }
		public string NOMBRE_CUENTA2 { get; set; }
		public decimal SALDO_FINAL2 { get; set; }
		public int NIVEL2 { get; set; }
		public int NIVEL_MAXIMO { get; set; }
		public int NIVEL { get; set; }
		public int NIVEL_CUENTA_MAYOR { get; set; }
		public string CODIGO_RUBRO { get; set; }
		public string DESCRIPCION_MONEDA { get; set; }
		public bool FOLIADO { get; set; }
		public int NUMERO_FOLIO { get; set; }
		public bool CUENTA_A_CERO { get; set; }
		public bool CONSOLIDADO { get; set; }
		public string CUENTA_DEPARTAMENTO { get; set; }
		public string CUENTA_CONTABLE_N1 { get; set; }
		public string NOMBRE_CUENTA_N1 { get; set; }
		public string CUENTA_CONTABLE_N2 { get; set; }
		public string NOMBRE_CUENTA_N2 { get; set; }
		public string CUENTA_CONTABLE_N3 { get; set; }
		public string NOMBRE_CUENTA_N3 { get; set; }
		public string CUENTA_CONTABLE_N4 { get; set; }
		public string NOMBRE_CUENTA_N4 { get; set; }
		public string CUENTA_CONTABLE_N5 { get; set; }
		public string NOMBRE_CUENTA_N5 { get; set; }
		public string NOMBRE_CUENTA_MAYOR { get; set; }
		public string CUENTA_MAYOR_1 { get; set; }
		public string NOMBRE_CUENTA_MAYOR_1 { get; set; }
		public string CUENTA_MAYOR_2 { get; set; }
		public string NOMBRE_CUENTA_MAYOR_2 { get; set; }
		public string CUENTA_MAYOR_3 { get; set; }
		public string NOMBRE_CUENTA_MAYOR_3 { get; set; }
		public string CUENTA_MAYOR_4 { get; set; }
		public string NOMBRE_CUENTA_MAYOR_4 { get; set; }
		public decimal SALDO_MES { get; set; }
		public string CLASE_RUBRO { get; set; }
		public bool MUESTRA_FIRMA { get; set; }
		public bool MOSTRAR_FECHA_IMPRESION { get; set; }
		public string NOMBRE_PUESTO1 { get; set; }
		public string DESCRIPCION_PUESTO1 { get; set; }
		public string NOMBRE_PUESTO2 { get; set; }
		public string DESCRIPCION_PUESTO2 { get; set; }
		public string NOMBRE_PUESTO3 { get; set; }
		public string DESCRIPCION_PUESTO3 { get; set; }
		public DateTime? FECHA_FINAL { get; set; }

		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public string NOMBRE_CLASE_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public int CORR_PARTIDA { get; set; }
		public int CORR_PARTIDA_DETA { get; set; }
		public DateTime? FECHA_PARTIDA { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_CENTRO { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public decimal SALDO_FINAL_MES { get; set; }
		public decimal SALDO_FINAL_2 { get; set; }
		public string NOMBRE_MONEDA { get; set; }
		public string SIMBOLO_MONEDA { get; set; }
	}
}
