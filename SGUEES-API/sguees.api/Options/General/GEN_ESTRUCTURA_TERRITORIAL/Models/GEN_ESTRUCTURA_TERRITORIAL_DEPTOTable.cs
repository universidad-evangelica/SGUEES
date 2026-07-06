using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable : BaseEntity
	{
		public int CORR_PAIS { get; set; }
		public int CORR_DEPTO { get; set; }
		public string NOMBRE_DEPTO { get; set; }
		public string CODIGO_DEPTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
