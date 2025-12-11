using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_SOLI_COTIZACIONTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
		public DateTime FECHA_SOLI_COTIZACION { get; set; }
		public DateTime FECHA_LIMITE_COTIZACION { get; set; }
		public string CODIGO_DEPTO { get; set; }
		public string USUARIO_SOLI { get; set; }
		public string OBSERVACIONES { get; set; }
		public string ESTADO_SOLI_COTIZACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int CORR_TIPO_SOLI_COTIZA { get; set; }
		public string JUSTIFICACION_ELIMINAR { get; set; }
	}
}
