// Qué hace: lectura de una marca documento-período.
// Cómo: proyecta V_ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS.
using System;

namespace SGUEES.Models
{
	public class ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO_ADMISION { get; set; }
		public string CODIGO { get; set; }
		public string NOMBRE_DOCUMENTO { get; set; }
		public int ORDEN { get; set; }
		public bool OBLIGATORIO { get; set; }
		public bool ACTIVO_DOCUMENTO { get; set; }
		public int CORR_PERIODO_ACADEMICO { get; set; }
		public short ANIO { get; set; }
		public byte? NUMERO_PERIODO { get; set; }
		public DateTime? FECHA_INICIO { get; set; }
		public DateTime? FECHA_FIN { get; set; }
		public bool ACTIVO_PERIODO { get; set; }
		public string NOMBRE_SEDE { get; set; }
		public string NOMBRE_AREA { get; set; }
		public string NOMBRE_FACULTAD { get; set; }
		public string NOMBRE_CARRERA { get; set; }
		public string ALCANCE { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
