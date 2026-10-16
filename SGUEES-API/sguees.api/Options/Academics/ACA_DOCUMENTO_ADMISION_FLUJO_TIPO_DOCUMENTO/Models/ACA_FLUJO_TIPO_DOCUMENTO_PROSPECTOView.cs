// Qué hace: fila del browse de solicitudes ACA_PROSPECTO.
// Cómo: proyecta V_ACA_FLUJO_TIPO_DOCUMENTO_PROSPECTO con el conteo de documentos asignados.
using System;

namespace SGUEES.Models
{
	public class ACA_FLUJO_TIPO_DOCUMENTO_PROSPECTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public string NOMBRE_TIPO { get; set; }
		public string DESCRIPCION { get; set; }
		public string CODIGO_OPCION { get; set; }
		public bool ACTIVO { get; set; }
		public int CANT_DOCUMENTOS { get; set; }
	}
}
