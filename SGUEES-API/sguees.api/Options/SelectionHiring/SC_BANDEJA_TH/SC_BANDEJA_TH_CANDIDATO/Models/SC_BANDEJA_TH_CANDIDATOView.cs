using System;

namespace SGUEES.Models
{
	/// <summary>
	/// Fila de postulación (solicitud + requisición) para la bandeja TH · Candidatos.
	/// </summary>
	public class SC_BANDEJA_TH_CANDIDATOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public int CORR_PERSONA_DATOS { get; set; }
		public int? CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int? CORR_ESTADO_EXPEDIENTE { get; set; }
		public string ESTADO_CICLO_CANDIDATO { get; set; }
		public string ESTADO_DECISION { get; set; }
		public string OBSERVACION_DECISION { get; set; }
		public DateTime? FECHA_DECISION { get; set; }
		public DateTime FECHA_GENERACION { get; set; }
		public string NOMBRE_PERSONA { get; set; }
		public string DUI_PERSONA { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public string MODALIDAD_NOMBRE { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public int CORR_ESTADO_REQUISICION { get; set; }
		public decimal? SALARIO { get; set; }
		public string HORARIO { get; set; }
		public int? TIEMPO_CONTRATO { get; set; }
		public string USUARIO_SOLICITANTE_REQ { get; set; }
		public string NOMBRE_SOLICITANTE { get; set; }
		public int CANTIDAD_ENTREVISTAS { get; set; }
		public string ULTIMA_ENTREVISTA { get; set; }
	}
}
