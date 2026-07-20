using System;
using eFramework.Data;

namespace SGUEES.Models
{
	// Qué hace: define la entidad de persistencia de la tabla GEN_DISTRITO (distritos por municipio).
	public class GEN_DISTRITOTable : BaseEntity
	{
		// Qué hace: FK al país de la jerarquía.
		public int CORR_PAIS { get; set; }
		// Qué hace: FK al departamento.
		public int CORR_DEPTO { get; set; }
		// Qué hace: FK al municipio padre.
		public int CORR_MUNICIPIO { get; set; }
		// Qué hace: correlativo del distrito dentro del municipio.
		public int CORR_DISTRITO { get; set; }
		public string NOMBRE_DISTRITO { get; set; }
		// Qué hace: campos de auditoría.
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
