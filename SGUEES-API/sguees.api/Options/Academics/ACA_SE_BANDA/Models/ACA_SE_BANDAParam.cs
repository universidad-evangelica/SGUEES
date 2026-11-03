// Qué hace: parámetros de filtro para Get/GetAll de bandas SE.
// Cómo lo hace: CORR_BANDA y/o CODIGO_REGLA opcionales.
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_BANDAParam : BaseParam
	{
		public int CORR_BANDA { get; set; }
		public string CODIGO_REGLA { get; set; }
	}
}
