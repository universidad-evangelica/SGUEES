// Qué hace: define el modelo de datos para la solicitud de envío de correo a un candidato basado en plantilla.
// Cómo lo hace: encapsula los identificadores de solicitud y plantilla, el correo destino y el contenido personalizado.
using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
	public class SC_SOLICITUD_EMPLEO_ENVIAR_CORREOParam
	{
		[Required]
		public int CORR_SOLICITUD_EMPLEO { get; set; }

		[Required]
		public int CORR_PARAMETRO_PLANTILLA { get; set; }

		[Required(ErrorMessage = "El correo de destino es requerido.")]
		[EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido.")]
		public string CORREO_DESTINO { get; set; }

		public string ASUNTO { get; set; }

		public string CUERPO { get; set; }
	}
}
