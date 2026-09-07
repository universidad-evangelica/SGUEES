using System;

namespace SGUEES.Models
{
	/// <summary>
	/// Postulación expediente↔requisición (vista con LEFT JOIN a decisión).
	/// </summary>
	public class SC_EXPEDIENTE_CANDIDATO_POSTULACIONView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_EXPEDIENTE_SOLICITUD { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public int CORR_SOLICITUD_REQUISICION { get; set; }
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public string MODALIDAD_NOMBRE { get; set; }
		public int CORR_ESTADO_REQUISICION { get; set; }
		public int? CORR_REQUISICION_CANDIDATO { get; set; }
		public string ESTADO_DECISION { get; set; }
		public string OBSERVACION_DECISION { get; set; }
		public DateTime? FECHA_DECISION { get; set; }
		public string USUARIO_DECISION { get; set; }
	}
}
