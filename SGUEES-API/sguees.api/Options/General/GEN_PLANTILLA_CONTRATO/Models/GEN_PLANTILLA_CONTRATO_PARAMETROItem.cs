// Qué hace: DTO de lectura para los parámetros disponibles de plantillas de contratos.
// Cómo lo hace: mapea las columnas devueltas por la vista V_GEN_PLANTILLA_CONTRATO_PARAMETROS.
namespace sguees.Models
{
	// Qué hace: representa una fila individual de parámetro catalogado para contratos laborales.
	// Cómo lo hace: expone categoría, clave token, etiqueta, descripción y órdenes de visualización.
	public class GEN_PLANTILLA_CONTRATO_PARAMETROItem
	{
		public string CATEGORIA { get; set; }
		public int ORDEN_CATEGORIA { get; set; }
		public string KEY_PARAMETRO { get; set; }
		public string LABEL_PARAMETRO { get; set; }
		public string DESCRIPCION { get; set; }
		public int ORDEN_PARAMETRO { get; set; }
	}
}
