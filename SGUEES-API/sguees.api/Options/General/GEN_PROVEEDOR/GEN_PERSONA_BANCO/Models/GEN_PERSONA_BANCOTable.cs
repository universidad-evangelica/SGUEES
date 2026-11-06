using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_BANCOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_PERSONA_BANCO { get; set; }
		public int CORR_BANCO { get; set; }
		public string CUENTA_BANCARIA { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
