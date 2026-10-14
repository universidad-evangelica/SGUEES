// Qué hace: modelo de escritura de GEN_PERSONA_DOMICILIO.
// Cómo lo hace: PK compuesta + dirección/territorio/activo + auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_DOMICILIOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_DOMICILIO { get; set; }
		public string DIRECCION { get; set; }
		public int? CORR_PAIS { get; set; }
		public int? CORR_DEPTO { get; set; }
		public int? CORR_MUNICIPIO { get; set; }
		public int? CORR_DISTRITO { get; set; }
		public bool? ACTIVO_DOMICILIO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
