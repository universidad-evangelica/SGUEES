using System;

namespace sguees.Models
{
	public class SC_TIPO_MODALIDADView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_MODALIDAD { get; set; }
        public string MODALIDAD_NOMBRE { get; set; }
        public string MODALIDAD_DESCRIPCION { get; set; } //nuevo campo
        public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
