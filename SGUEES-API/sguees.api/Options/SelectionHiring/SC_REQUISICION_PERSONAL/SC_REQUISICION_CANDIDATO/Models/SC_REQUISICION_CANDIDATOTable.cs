using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_REQUISICION_CANDIDATOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_REQUISICION_CANDIDATO { get; set; }
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public string ESTADO_DECISION { get; set; }
		public string OBSERVACION_DECISION { get; set; }
		public DateTime FECHA_DECISION { get; set; }
		public string USUARIO_DECISION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
