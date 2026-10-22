// Qué hace: parámetro para asociar o desasociar una persona natural con un usuario.
// Cómo lo hace: transporta LOGIN_SISTEMA y CORR_PERSONA para la persistencia en GEN_PERSONA_USUARIO.
namespace sguees.Models
{
	public class SEG_USUARIO_ASOCIAR_PERSONAParam
	{
		public string LOGIN_SISTEMA { get; set; }
		public long CORR_PERSONA { get; set; }
	}
}
