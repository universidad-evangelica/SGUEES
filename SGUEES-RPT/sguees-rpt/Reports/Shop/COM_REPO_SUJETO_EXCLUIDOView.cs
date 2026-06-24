using System;

namespace sgueesRpt.Models
{
	public class COM_REPO_SUJETO_EXCLUIDOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int ANIO_PERIODO { get; set; }
		public string MES_PERIODO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTADO { get; set; }
		public string NOMBRE_ESTADO { get; set; }
		public string SERIE { get; set; }
		public string NUMERO_FACTURA { get; set; }
		public string CODIGO_GENERACION { get; set; }
		public string NUMERO_CONTROL { get; set; }
		public string SELLO_RECEPCION { get; set; }
		public DateTime FECHA_DOCUMENTO { get; set; }
		public string CIF { get; set; }
		public string NIT { get; set; }
		public string DUI { get; set; }
		public string NOMBRE_CLIENTE { get; set; }
		public decimal SUB_TOTAL { get; set; }
		public decimal RENTA { get; set; }
		public decimal TOTAL { get; set; }
		public string OBSERVACION { get; set; }
		public string DIRECCION_CLIENTE { get; set; }
		public string URL_CONSULTA { get; set; }
		public byte[] QR_CONSULTA { get; set; }
		public string NOMBRE_EMPRESA { get; set; }
		public string PERIODO { get; set; }
		public byte[] LOGO1 { get; set; }
		public byte[] LOGO2 { get; set; }
		public string TITULO_REPORTE { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public DateTime FECHA_IMPRESION { get; set; }
	}
}
