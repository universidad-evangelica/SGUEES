using System;

namespace sguees.Models
{
	public class CON_PARTIDA_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public string NOMBRE_CLASE_PARTIDA { get; set; }
		public string NOMBRE_CORTO_CLASE { get; set; }
		public int CORR_PARTIDA { get; set; }
		public int NUMERO_PARTIDA { get; set; }
		public DateTime FECHA_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public string ESTADO_PARTIDA { get; set; }
		public string NOMBRE_ESTADO_PARTIDA { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string CLASE_PARTIDA { get; set; }
		public string NOMBRE_CLASE_PARTIDA2 { get; set; }
		public int CORR_PARTIDA_DETA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_CENTRO { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public string NUMERO_DOCUMENTO_DETA { get; set; }
		public string CORR_AUXILIAR { get; set; }
		public string CORR_AUXILIAR_REPLICADO { get; set; }
		public string CORR_CENTRO_COSTO_REPLICADO { get; set; }
		public string DESCRIPCION_MONEDA { get; set; }
		public bool MOSTRAR_FECHA_IMPRESION { get; set; }
		public bool FOLIADO { get; set; }
		public int NUMERO_FOLIO { get; set; }
		public string NOMBRE_MONEDA { get; set; }
		public string CUENTA_MAYOR { get; set; }
		public string NOMBRE_CUENTA_MAYOR { get; set; }

		public string NOMBRE_EMPRESA { get; set; }
		public string PERIODO { get; set; }
		public byte[] LOGO1 { get; set; }
		public byte[] LOGO2 { get; set; }
		public string TITULO_REPORTE { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public DateTime FECHA_IMPRESION { get; set; }
	}
}
