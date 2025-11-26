using System;
using eFramework.Data;

namespace eadmindevprojectmanagement.Models
{
	public class COM_DOCUMENTO_CRTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public bool ES_NACIONAL { get; set; }
		public bool ES_EXTRANJERO { get; set; }
		public string DESCRIPCION_DOCUMENTO { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
