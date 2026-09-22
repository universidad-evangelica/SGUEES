// Qué hace: modelo de escritura de GEN_PERSONA_FORMACION_ACADEMICA.
// Cómo lo hace: define PK compuesta + datos de formación y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_FORMACION_ACADEMICATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_FORMACION_ACADEMICA { get; set; }
		public string TITULO { get; set; }
		public string CENTRO_EDUCATIVO { get; set; }
		public string NIVEL { get; set; }
		public DateTime? DESDE { get; set; }
		public DateTime? HASTA { get; set; }
		public int? PERIODO_INICIAL { get; set; }
		public int? PERIODO_FINAL { get; set; }
		public string PERIODO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
