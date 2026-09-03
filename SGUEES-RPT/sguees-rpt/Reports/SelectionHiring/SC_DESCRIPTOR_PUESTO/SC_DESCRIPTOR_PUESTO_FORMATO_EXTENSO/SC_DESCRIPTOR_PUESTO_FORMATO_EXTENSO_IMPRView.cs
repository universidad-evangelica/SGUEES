using System;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO
{
	// Qué hace: encabezado Formato extenso (contrato API); logos mergeados en la fila.
	public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		public string CODIGO_DESCRIPTOR_PUESTO { get; set; }
		public string FECHA_EMISION { get; set; }
		public string FECHA_REVISION { get; set; }
		public string OBJETIVO_PUESTO { get; set; }
		public int? NUM_PERSONAL_CARGO { get; set; }
		public int? CORR_PUESTO { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public int? CORR_UNIDAD { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public int? CORR_PUESTO_REPORTA { get; set; }
		public string NOMBRE_EMPLEADO_REPORTA { get; set; }
		public int? CORR_IMPACTO_ECONOMICO { get; set; }
		public string DESCRIPCION_IMPACTO_ECONOMICO { get; set; }
		public string RESPONSABLE { get; set; }
		public string FORMATO { get; set; }
		public int? VERSION { get; set; }
		public int? CORR_ESTADO { get; set; }
		public string NOMBRE_ESTADO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }

		public string NOMBRE_EMPRESA { get; set; }
		public string PERIODO { get; set; }
		public byte[] LOGO1 { get; set; }
		public byte[] LOGO2 { get; set; }
		public string TITULO_REPORTE { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public DateTime FECHA_IMPRESION { get; set; }
	}
}
