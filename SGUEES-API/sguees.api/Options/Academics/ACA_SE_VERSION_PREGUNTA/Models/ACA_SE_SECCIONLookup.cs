// Qué hace: lookup de secciones SE para asignar CORR_SECCION_SE en versión-pregunta.
// Cómo lo hace: lee ACA_SE_SECCION (activo) hasta existir el mantenimiento aca-se-seccion.
namespace sguees.Models
{
	public class ACA_SE_SECCIONLookup
	{
		public int CORR_SECCION_SE { get; set; }
		public int CORR_VERSION { get; set; }
		public string NOMBRE_SECCION { get; set; }
		public int ORDEN { get; set; }
		public bool ACTIVO { get; set; }
	}
}
