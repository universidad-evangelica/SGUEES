using System;
using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: modelo de escritura de CON_CENTRO_COSTO.
	// Cómo lo hace: mapea PK y campos editables, incluidos nivel y centro mayor.
	public class CON_CENTRO_COSTOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_CENTRO { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string CODIGO_CENTRO_COSTO { get; set; }
		public int CORR_CENTRO_COSTO_MAYOR { get; set; }
		public int CORR_CENTRO_COSTO_NIVEL { get; set; }
		public int CORR_TIPO_CENTRO_COSTO { get; set; }
		public string ESTADO_CENTRO_COSTO { get; set; }
		public int CORR_UNIDAD_NEGOCIO { get; set; }
		public int CORR_AREA_FUNCIONAL { get; set; }
		public string CODIGO_TERMINACION { get; set; }
		public int CORR_EMPLEADO_JEFE { get; set; }
		public int CORR_CLIENTE { get; set; }
		public DateTime FECHA_INICIAL { get; set; }
		public DateTime FECHA_FINAL { get; set; }
	}
}
