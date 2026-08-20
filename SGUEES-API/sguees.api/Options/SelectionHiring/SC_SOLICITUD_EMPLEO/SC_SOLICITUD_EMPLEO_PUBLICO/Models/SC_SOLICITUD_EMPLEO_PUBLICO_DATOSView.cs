using System.Collections.Generic;

namespace sguees.Models
{
	/// <summary>
	/// Payload de precarga del portal (persona + colecciones) cuando YA_TIENE_DATOS.
	/// </summary>
	public class SC_SOLICITUD_EMPLEO_PUBLICO_DATOSView
	{
		public SC_PERSONA_DATOSView PERSONA { get; set; }
		public List<SC_PERSONA_FAMILIARView> FAMILIARES_DIRECTOS { get; set; } = new();
		public List<SC_PERSONA_HIJOSView> HIJOS { get; set; } = new();
		public List<SC_PERSONA_ESTUDIOView> ESTUDIOS { get; set; } = new();
		public List<SC_PERSONA_IDIOMASView> IDIOMAS { get; set; } = new();
		public List<SC_PERSONA_COMPETENCIAS_TECNICASView> COMPETENCIAS { get; set; } = new();
		public List<SC_PERSONA_EXPERIENCIA_LABORALView> EXPERIENCIAS { get; set; } = new();
		public List<SC_PERSONA_FAMILIAR_UEESView> FAMILIARES_UEES { get; set; } = new();
	}
}
