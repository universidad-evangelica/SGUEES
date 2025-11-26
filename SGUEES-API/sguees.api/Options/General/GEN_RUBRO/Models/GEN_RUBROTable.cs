using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_RUBROTable: BaseEntity
	{
		public int CORR_SUSCRIPCION { get; set; }
		public int CORR_CONFI_PAIS { get; set; }
		public int CORR_EMPRESA { get; set; }
		public int CORR_RUBRO { get; set; }
		public string NOMBRE_RUBRO { get; set; }
		public string DESCRIPCION_RUBRO { get; set; }
		public bool ES_IMPUESTO { get; set; }
		public decimal POR_IMPUESTO { get; set; }
		public bool MUESTRA_DETALLE { get; set; }
		public bool MUESTRA_TOTAL { get; set; }
		public int SUMA_RESTA { get; set; }
		public string CLASE_RUBRO { get; set; }
		public string TIPO_APLICACION { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string CODIGO_FEL { get; set; }
	}
}
