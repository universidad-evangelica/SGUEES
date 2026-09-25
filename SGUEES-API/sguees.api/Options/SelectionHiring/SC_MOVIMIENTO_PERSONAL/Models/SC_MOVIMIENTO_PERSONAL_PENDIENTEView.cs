using System;

namespace SGUEES.Models
{
	/// <summary>Movimiento de ascenso o traslado con notificación pendiente para el actor.</summary>
	public class SC_MOVIMIENTO_PERSONAL_PENDIENTEView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public DateTime FECHA_ELABORACION { get; set; }
		public string TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public string ESTADO_MOVIMIENTO { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public string NOMBRE_PUESTO_PROPUESTO { get; set; }
		public string NOMBRE_UNIDAD_PROPUESTA { get; set; }
		public int? CORR_UNIDAD_PROPUESTA { get; set; }
		public string JUSTIFICACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string NOMBRE_SOLICITANTE { get; set; }
		public int? CORR_INSTANCIA { get; set; }
		public int? CORR_NOTIFICACION { get; set; }
		public string MENSAJE_NOTIFICACION { get; set; }
		public DateTime? FECHA_NOTIFICACION { get; set; }
		public int? CORR_UNIDAD_DOCUMENTO { get; set; }
	}
}
