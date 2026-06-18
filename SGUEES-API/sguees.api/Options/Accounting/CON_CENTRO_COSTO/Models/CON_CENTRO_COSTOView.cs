using System;

namespace sguees.Models
{
	public class CON_CENTRO_COSTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_CENTRO { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string CODIGO_CENTRO_COSTO { get; set; }
		public int CORR_TIPO_CENTRO_COSTO { get; set; }
		public string NOMBRE_TIPO_CENTRO_COSTO { get; set; }
		public string CLASE_CENTRO_COSTO { get; set; }
		public string ESTADO_CENTRO_COSTO { get; set; }
		public string NOMBRE_ESTADO_CENTRO_COSTO { get; set; }
		public string CORR_CENTRO_COSTO_REPLICADO { get; set; }
		public int CORR_UNIDAD_NEGOCIO { get; set; }
		public string NOMBRE_UNIDAD_NEGOCIO { get; set; }
		public string CODIGO_UNIDAD_NEGOCIO { get; set; }
		public int CORR_AREA_FUNCIONAL { get; set; }
		public string NOMBRE_AREA_FUNCIONAL { get; set; }
		public string CODIGO_TERMINACION { get; set; }
		public int CORR_EMPLEADO_JEFE { get; set; }
		public string NOMBRE_EMPLEADO { get; set; }
		public int CORR_CLIENTE { get; set; }
		public DateTime FECHA_INICIAL { get; set; }
		public DateTime FECHA_FINAL { get; set; }
	}
}
