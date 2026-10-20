using System;

namespace SGUEES.Models
{
	// Qué hace: Representa una fila consolidada de movimiento para la pestaña Todas en la Bandeja TH.
	// Cómo lo hace: Homologa los campos comunes de Requisiciones, Candidatos y Contrataciones en una estructura única.
	public class SC_BANDEJA_TH_TODASView
	{
		public string TIPO { get; set; }
		public int CORR_EMPRESA { get; set; }
		public int? CORR_REQUISICION_PERSONAL { get; set; }
		public int? CORR_DESCRIPTOR_PUESTO { get; set; }
		public int? CORR_UNIDAD { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public int? CORR_PUESTO { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public int? CORR_TIPO_MODALIDAD { get; set; }
		public string MODALIDAD_NOMBRE { get; set; }
		public int? CORR_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public int? CORR_TIPO_VACANTE { get; set; }
		public string NOMBRE_TIPO_VACANTE { get; set; }
		public int? CANTIDAD_PLAZAS { get; set; }
		public int? PLAZAS_CUBIERTAS { get; set; }
		public DateTime? FECHA_REQUISICION { get; set; }
		public string JUSTIFICACION { get; set; }
		public string CORR_EMPLEADO_SUSTITUTO { get; set; }
		public decimal? SALARIO { get; set; }
		public int? CORR_ESTADO_REQUISICION { get; set; }
		public DateTime? FECHA_APROBACION { get; set; }
		public DateTime? FECHA_CIERRE { get; set; }
		public int? TIEMPO_CONTRATO { get; set; }
		public string HORARIO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string NOMBRE_SOLICITANTE { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }

		// Candidatos / Contrataciones
		public int? CORR_SOLICITUD_EMPLEO { get; set; }
		public int? CORR_PERSONA_DATOS { get; set; }
		public int? CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int? CORR_ESTADO_EXPEDIENTE { get; set; }
		public string ESTADO_CICLO_CANDIDATO { get; set; }
		public string ESTADO_DECISION { get; set; }
		public string OBSERVACION_DECISION { get; set; }
		public DateTime? FECHA_DECISION { get; set; }
		public DateTime? FECHA_GENERACION { get; set; }
		public string NOMBRE_PERSONA { get; set; }
		public string DUI_PERSONA { get; set; }
		public string USUARIO_SOLICITANTE_REQ { get; set; }
		public int? CANTIDAD_ENTREVISTAS { get; set; }
		public string ULTIMA_ENTREVISTA { get; set; }

		// Contratación
		public int? CORR_REQUISICION_CANDIDATO { get; set; }
		public int? CORR_MOVIMIENTO_PERSONAL { get; set; }
		public string ESTADO_MOVIMIENTO { get; set; }
		public bool? CONFIRMADO { get; set; }
		public int? CORR_EMPLEADO { get; set; }
		public DateTime? FECHA_EFECTIVA { get; set; }
		public DateTime FECHA_ORDEN { get; set; }
	}
}
