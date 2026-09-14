using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: modelo de escritura de CON_CENTRO_COSTO_NIVEL.
	// Cómo lo hace: mapea PK y campos editables del catálogo de niveles.
	public class CON_CENTRO_COSTO_NIVELTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CENTRO_COSTO_NIVEL { get; set; }
		public string NOMBRE_NIVEL { get; set; }
		public short? NIVEL { get; set; }
	}
}
