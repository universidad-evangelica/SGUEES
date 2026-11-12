// Qué hace: contrato del repositorio de plantillas de contrato.
// Cómo lo hace: extiende IRepository<GEN_PLANTILLA_CONTRATOTable> y declara consultas de unicidad, versiones y bitácora.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PLANTILLA_CONTRATORepository : IRepository<GEN_PLANTILLA_CONTRATOTable>
	{
		// Qué hace: verifica si ya existe otra plantilla de contrato con el mismo nombre en la empresa.
		// Cómo lo hace: consulta V_GEN_PLANTILLA_CONTRATO filtrando por CORR_EMPRESA y excluyendo excludeCorr.
		Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
		// Qué hace: obtiene el historial ordenado de versiones de una plantilla de contrato.
		Task<CResult> GetVersionesAsync(List<CParameter> xWhere);
		// Qué hace: obtiene el cuerpo HTML de la Versión 1 para calcular el detalle de cambios en bitácora.
		Task<string> GetCuerpoVersionBaseAsync(int corrEmpresa, int corrPlantilla);
		// Qué hace: obtiene el cuerpo HTML guardado de una versión específica de plantilla de contrato.
		Task<string> GetCuerpoVersionAsync(int corrEmpresa, int corrPlantilla, int corrVersion);
		// Qué hace: crea una nueva versión v2+ vinculada a v1 como padre, la establece como activa y guarda el detalle calculado en bitácora.
		Task<CResult> CrearVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string detalleBitacora, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: actualiza el contenido HTML de una versión v2+ activa y guarda el detalle calculado en bitácora.
		Task<CResult> ActualizarVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string detalleBitacora, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: establece una versión histórica v2+ como activa desactivando la versión anterior.
		Task<CResult> ActivarVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: obtiene los registros cronológicos de bitácora de una plantilla de contrato.
		Task<CResult> GetBitacoraAsync(List<CParameter> xWhere);
	}
}

