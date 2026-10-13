// Qué hace: campos de escritura de ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTO.
// Cómo: representa la llave empresa, tipo de flujo y documento de admisión, con auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public int CORR_DOCUMENTO_ADMISION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
