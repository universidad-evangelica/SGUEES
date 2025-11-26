using System;

namespace scuees.Models
{
	public class COM_BITACORAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_BITACORA { get; set; }
		public DateTime FECHA_BITACORA { get; set; }
		public string CODIGO_OPCION { get; set; }
		public string NOMBRE_CODIGO_OPCION { get; set; }
		public string CLASE_BITACORA { get; set; }
		public string NOMBRE_CLASE_BITACORA { get; set; }
		public string LLAVE_TRANSACCION { get; set; }
		public string REFERENCIA_TRANSACCION { get; set; }
		public string USUARIO_CREA_TRANS { get; set; }
		public string ESTACION_CREA_TRANS { get; set; }
		public DateTime FECHA_CREA_TRANS { get; set; }
		public string USUARIO_ACTU_TRANS { get; set; }
		public string ESTACION_ACTU_TRANS { get; set; }
		public DateTime FECHA_ACTU_TRANS { get; set; }
		public string USUARIO_CREA_BITACORA { get; set; }
		public string ESTACION_CREA_BITACORA { get; set; }
		public DateTime FECHA_CREA_BITACORA { get; set; }
	}
}
