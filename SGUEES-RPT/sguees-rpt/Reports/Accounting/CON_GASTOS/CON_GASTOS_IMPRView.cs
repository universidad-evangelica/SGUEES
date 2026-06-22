using System;

namespace sgueesRpt.Models
{
	/// <summary>
	/// Dataset para CON_REPORTE_GASTOS.rpt (copiar desde e-Admin a Reports/Accounting/CON_GASTOSReport.rpt).
	/// </summary>
	public class CON_GASTOS_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public string CUENTA_MAYOR_2 { get; set; }
		public string CUENTA_MAYOR_3 { get; set; }
		public string CUENTA_MAYOR_4 { get; set; }
		public string CUENTA_DEPARTAMENTO { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public int ANIO_PERIODO { get; set; }
		public decimal ENERO { get; set; }
		public decimal FEBRERO { get; set; }
		public decimal MARZO { get; set; }
		public decimal ABRIL { get; set; }
		public decimal MAYO { get; set; }
		public decimal JUINIO { get; set; }
		public decimal JULIO { get; set; }
		public decimal AGOSTO { get; set; }
		public decimal SEPTIEMBRE { get; set; }
		public decimal OCTUBRE { get; set; }
		public decimal NOVIEMBRE { get; set; }
		public decimal DICIEMBRE { get; set; }
		public decimal TOTAL { get; set; }

		public string NOMBRE_EMPRESA { get; set; }
		public string PERIODO { get; set; }
		public byte[] LOGO1 { get; set; }
		public byte[] LOGO2 { get; set; }
		public string TITULO_REPORTE { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public DateTime FECHA_IMPRESION { get; set; }
	}
}
