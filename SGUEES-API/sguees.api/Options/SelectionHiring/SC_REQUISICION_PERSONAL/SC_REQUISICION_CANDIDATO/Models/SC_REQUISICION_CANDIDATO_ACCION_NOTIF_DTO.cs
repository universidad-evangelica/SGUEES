using System.Collections.Generic;

namespace SGUEES.Models
{
	/// <summary>
	/// Contexto para GEN_NOTIFICACION tras DecideAsync (APLICA / NO_APLICA).
	/// Destinatarios: usuarios con opción SC_BANDEJA_TH.
	/// </summary>
	public class SC_REQUISICION_CANDIDATO_ACCION_NOTIF_DTO
	{
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public string ESTADO_DECISION { get; set; }
		public string OBSERVACION_DECISION { get; set; }
		public string NOMBRE_PERSONA { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public List<string> LOGINS_DESTINO { get; set; } = new List<string>();
	}
}
