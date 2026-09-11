using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: parámetros de filtro para Get/GetAll de niveles.
	// Cómo lo hace: empresa + correlativo de nivel.
	public class CON_CENTRO_COSTO_NIVELParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CENTRO_COSTO_NIVEL { get; set; }
	}
}
