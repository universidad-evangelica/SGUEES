using System;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO
{
	// Qué hace: DTO de impresión Formato corto (mismo contrato que API SC_DESCRIPTOR_PUESTO_IMPRView).
	// Cómo: incluye funciones CLAVE/SECUNDARIA (1 fila por función) para Crystal.
	public class SC_DESCRIPTOR_PUESTO_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		// Texto dd/MM/yyyy desde la vista; evita el 00:00:00 que agrega DateTime.
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

		// Funciones agregadas en un solo texto, numeradas y separadas por CRLF.
		public string LISTA_FUNCIONES_CLAVE { get; set; }
		public string LISTA_FUNCIONES_SECUNDARIA { get; set; }

		// Indicador de desempeño; una fila por indicador (detalle del reporte).
		public int? CORR_KPI_FUNCION { get; set; }
		public string NOMBRE_INDICADOR { get; set; }
		public int? META { get; set; }
		public int? CORR_FRECUENCIA { get; set; }
		public string NOMBRE_FRECUENCIA { get; set; }

		public string NOMBRE_EMPRESA { get; set; }
		public string PERIODO { get; set; }
		public byte[] LOGO1 { get; set; }
		public byte[] LOGO2 { get; set; }
		public string TITULO_REPORTE { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public DateTime FECHA_IMPRESION { get; set; }
	}
}
