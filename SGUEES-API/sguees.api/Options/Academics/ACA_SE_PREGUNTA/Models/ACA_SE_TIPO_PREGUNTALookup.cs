// Qué hace: lookup de tipos de pregunta para el select del mantenimiento.
namespace sguees.Models
{
	public class ACA_SE_TIPO_PREGUNTALookup
	{
		public int CORR_TIPO_PREGUNTA { get; set; }
		public string CODIGO { get; set; }
		public string NOMBRE { get; set; }
		public bool? ACTIVO { get; set; }
	}
}
