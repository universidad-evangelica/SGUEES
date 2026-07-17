using System;
using eFramework.Data;

namespace SGUEES.Models
{
	// Entidad de persistencia de la tabla GEN_DEPTO (departamentos por país).
	public class GEN_DEPTOTable : BaseEntity
	{
		// FK al país padre.
		public int CORR_PAIS { get; set; }
		// PK del departamento dentro del país.
		public int CORR_DEPTO { get; set; }
		public string NOMBRE_DEPTO { get; set; }
		public string CODIGO_DEPTO { get; set; }
		// Auditoría de creación/actualización.
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
