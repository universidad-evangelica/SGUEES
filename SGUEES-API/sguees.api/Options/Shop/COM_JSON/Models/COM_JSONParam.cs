using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_JSONParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int TIPO_CONSULTA { get; set; }=0;
		public int OPCION_CONSULTA { get; set; } = 0;
		public DateTime FECHA_INICIAL { get; set; }
		public DateTime FECHA_FINAL { get; set; }
		public string USUARIO_CAJERO { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public string ESTADO_DOCUMENTO { get; set; }
		public string CODIGO_CLIENTE { get; set; }
		
	}
}
