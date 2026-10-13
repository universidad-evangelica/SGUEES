// Qué hace: documento del catálogo ACA_DOCUMENTO_ADMISION para el popup.
// Cómo: expone código, nombre, orden y si está activo.
namespace SGUEES.Models
{
	public class ACA_DOCUMENTO_ADMISIONItem
	{
		public int CORR_DOCUMENTO_ADMISION { get; set; }
		public string CODIGO { get; set; }
		public string NOMBRE_DOCUMENTO { get; set; }
		public int ORDEN { get; set; }
		public bool OBLIGATORIO { get; set; }
		public bool ACTIVO { get; set; }
	}
}
