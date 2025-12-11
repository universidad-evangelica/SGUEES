using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_CUADRO_COMPARATIVO_SOLI_COTIZACIONTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public DateTime FECHA_CUADRO_COMPARATIVO { get; set; }
		public string ESTADO_CUADRO_COMPARATIVO { get; set; }
		public string USUARIO_CUADRO_COMPARATIVO { get; set; }
		public string OBSERVACIONES { get; set; }
		public bool ES_MEJOR_PRECIO { get; set; }
		public bool TIENE_CREDITO_30_DIAS { get; set; }
		public bool TIENE_BUEN_SOPORTE_TECNICO { get; set; }
		public bool TIENE_BUENA_CALIDAD_PRODUCTO { get; set; }
		public bool TIENE_MEJOR_TIEMPO_ENTREGA { get; set; }
		public bool BRINDA_BUENA_EXPERIENCIA_PROVEEDOR { get; set; }
		public bool ES_PROVEEDOR_UNICO { get; set; }
		public bool EXISTE_OTRA_RAZON { get; set; }
		public string NOMBRE_OTRA_RAZON { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public List<COM_CUADRO_COMPARATIVO_SOLI_COTIZAView> SOLICITUDES { get; set; }
	}
}
