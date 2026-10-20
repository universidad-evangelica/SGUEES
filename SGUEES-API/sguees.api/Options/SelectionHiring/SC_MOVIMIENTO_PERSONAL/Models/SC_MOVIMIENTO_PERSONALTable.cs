using System;
using System.ComponentModel.DataAnnotations;
using eFramework.Data;

namespace SGUEES.Models
{
	/// <summary>
	/// Tabla SC_MOVIMIENTO_PERSONAL — documento de movimiento de personal.
	/// </summary>
	public class SC_MOVIMIENTO_PERSONALTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }

		public DateTime FECHA_ELABORACION { get; set; }

		/// <summary>DIRECTO | REQUISICION</summary>
		[MaxLength(20)]
		public string ORIGEN_MOVIMIENTO { get; set; }

		/// <summary>
		/// Tipo de contratación de la requisición origen (2 = Eventual).
		/// No se persiste; solo decide si FECHA_FINALIZACION aplica.
		/// </summary>
		public int? CORR_TIPO_CONTRATACION { get; set; }

		/// <summary>PERMANENTE | EVENTUAL | ASCENSO | TRASLADO</summary>
		[MaxLength(20)]
		public string TIPO_MOVIMIENTO { get; set; }

		/// <summary>DI SO OB AP DE AN</summary>
		[MaxLength(2)]
		public string ESTADO_MOVIMIENTO { get; set; }

		[MaxLength(250)]
		public string NOMBRE_COMPLETO { get; set; }

		/// <summary>Referencia a GEN_EMPLEADO (sin FK).</summary>
		public int? CORR_EMPLEADO { get; set; }

		[MaxLength(50)]
		public string NUMERO_ID { get; set; }

		public DateTime? FECHA_INGRESO_PROPUESTA { get; set; }
		public DateTime? FECHA_FINALIZACION { get; set; }

		[MaxLength(200)]
		public string GERENCIA_ACTUAL { get; set; }
		public int? CORR_UNIDAD_ACTUAL { get; set; }

		[MaxLength(150)]
		public string NOMBRE_UNIDAD_ACTUAL { get; set; }

		public int? CORR_PUESTO_ACTUAL { get; set; }

		[MaxLength(200)]
		public string NOMBRE_PUESTO_ACTUAL { get; set; }

		public decimal? SALARIO_ACTUAL { get; set; }
		public int? CORR_TIPO_MODALIDAD_ACTUAL { get; set; }

		[MaxLength(100)]
		public string NOMBRE_MODALIDAD_ACTUAL { get; set; }

		[MaxLength(250)]
		public string HORARIO_ACTUAL { get; set; }

		[MaxLength(200)]
		public string GERENCIA_PROPUESTA { get; set; }
		public int? CORR_UNIDAD_PROPUESTA { get; set; }

		[MaxLength(150)]
		public string NOMBRE_UNIDAD_PROPUESTA { get; set; }

		public int? CORR_PUESTO_PROPUESTO { get; set; }

		[MaxLength(200)]
		public string NOMBRE_PUESTO_PROPUESTO { get; set; }

		public decimal? SALARIO_PROPUESTO { get; set; }
		public int? CORR_TIPO_MODALIDAD_PROPUESTA { get; set; }

		[MaxLength(100)]
		public string NOMBRE_MODALIDAD_PROPUESTA { get; set; }

		[MaxLength(250)]
		public string HORARIO_PROPUESTO { get; set; }

		[MaxLength(1000)]
		public string JUSTIFICACION { get; set; }

		public DateTime? FECHA_EFECTIVA { get; set; }

		/// <summary>Confirmación TH (independiente del flujo).</summary>
		public bool CONFIRMADO { get; set; }

		/// <summary>LOGIN_SISTEMA de quien confirmó.</summary>
		[MaxLength(50)]
		public string USUARIO_CONFIRMA { get; set; }

		public DateTime? FECHA_CONFIRMA { get; set; }

		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
