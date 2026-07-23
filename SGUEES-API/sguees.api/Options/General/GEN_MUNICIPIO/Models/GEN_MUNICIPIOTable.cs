using System;
using eFramework.Data;

namespace SGUEES.Models
{
	// Qué hace: define la entidad de persistencia de la tabla GEN_MUNICIPIO (municipios por departamento).
	public class GEN_MUNICIPIOTable : BaseEntity
	{
		// Qué hace: FK al departamento padre.
		public int CORR_DEPTO { get; set; }
		// Qué hace: correlativo del municipio dentro del departamento.
		public int CORR_MUNICIPIO { get; set; }
		// Qué hace: FK al país de la jerarquía territorial.
		public int CORR_PAIS { get; set; }
		public string NOMBRE_MUNICIPIO { get; set; }
		public string CODIGO_MUNICIPIO { get; set; }
		// Qué hace: campos de auditoría.
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
