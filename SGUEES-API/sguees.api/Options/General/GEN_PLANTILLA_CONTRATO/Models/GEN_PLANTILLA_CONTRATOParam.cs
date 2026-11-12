// Qué hace: parámetros de consulta para plantillas de contrato.
// Cómo lo hace: extiende BaseParam agregando CORR_EMPRESA y CORR_PLANTILLA_CONTRATO.
using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: encapsula los filtros aceptados por el CRUD de GEN_PLANTILLA_CONTRATO.
	// Cómo lo hace: hereda propiedades base de consulta y agrega las llaves primarias de la tabla.
	public class GEN_PLANTILLA_CONTRATOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PLANTILLA_CONTRATO { get; set; }
	}
}

