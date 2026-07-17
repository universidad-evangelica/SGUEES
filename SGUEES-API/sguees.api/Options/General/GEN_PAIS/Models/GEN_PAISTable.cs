using System;
using eFramework.Data;

namespace SGUEES.Models
{
	// Entidad de persistencia de la tabla GEN_PAIS (catálogo de países).
	public class GEN_PAISTable : BaseEntity
	{
		// PK del país.
		public int CORR_PAIS { get; set; }
		public string NOMBRE_PAIS { get; set; }
		public string CODIGO_PAIS { get; set; }
		public string NACIONALIDAD { get; set; }
		public string NOMBRE_CORTO { get; set; }
		// Auditoría de creación/actualización.
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
