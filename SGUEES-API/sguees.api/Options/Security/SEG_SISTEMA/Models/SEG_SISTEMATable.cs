using eFramework.Data;

namespace sguees.Models
{
	public class SEG_SISTEMATable : BaseEntity
	{
		public string CODIGO_SISTEMA { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public string IMAGEN_SISTEMA { get; set; }
		public string PREFIJO { get; set; }
		public string NOMBRE_MODULO { get; set; }
	}
}
