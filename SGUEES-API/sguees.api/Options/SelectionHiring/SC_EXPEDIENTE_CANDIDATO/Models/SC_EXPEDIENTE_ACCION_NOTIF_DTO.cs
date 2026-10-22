using System.Collections.Generic;

namespace SGUEES.Models
{
	/// <summary>
	/// Contexto para GEN_NOTIFICACION tras ActivarProcesoSeleccion (EN_SELECCION).
	/// Destinatarios: USUARIO_CREA de REQ ligada + jefes activos de la unidad.
	/// </summary>
	public class SC_EXPEDIENTE_ACCION_NOTIF_DTO
	{
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public string NOMBRE_PERSONA { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public List<string> LOGINS_DESTINO { get; set; } = new List<string>();
	}
}
