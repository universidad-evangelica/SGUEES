using System;
using eFramework.Data;

namespace SGUEES.Models
{
	// Entidad de persistencia de la tabla GEN_DISTRITO (distritos por municipio).
	public class GEN_DISTRITOTable : BaseEntity
	{
		// FK al país de la jerarquía.
		public int CORR_PAIS { get; set; }
		// FK al departamento.
		public int CORR_DEPTO { get; set; }
		// FK al municipio padre.
		public int CORR_MUNICIPIO { get; set; }
		// PK del distrito dentro del municipio.
		public int CORR_DISTRITO { get; set; }
		public string NOMBRE_DISTRITO { get; set; }
		// Auditoría de creación/actualización.
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
