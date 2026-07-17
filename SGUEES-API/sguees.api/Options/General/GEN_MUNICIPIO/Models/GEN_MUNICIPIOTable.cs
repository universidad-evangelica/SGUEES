using System;
using eFramework.Data;

namespace SGUEES.Models
{
	// Entidad de persistencia de la tabla GEN_MUNICIPIO (municipios por departamento).
	public class GEN_MUNICIPIOTable : BaseEntity
	{
		// FK al departamento padre.
		public int CORR_DEPTO { get; set; }
		// PK del municipio dentro del departamento.
		public int CORR_MUNICIPIO { get; set; }
		// FK al país (parte de la jerarquía territorial).
		public int CORR_PAIS { get; set; }
		public string NOMBRE_MUNICIPIO { get; set; }
		public string CODIGO_MUNICIPIO { get; set; }
		// Auditoría de creación/actualización.
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
