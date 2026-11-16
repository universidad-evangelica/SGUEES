// Qué hace: contrato de negocio del catálogo plantillas de contrato.
// Cómo lo hace: declara GetAllAsync, GetAsync, CreateAsync, UpdateAsync y DeleteAsync.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PLANTILLA_CONTRATOService
	{
		// Qué hace: lista las plantillas de contrato según filtros.
		Task<CResult> GetAllAsync(GEN_PLANTILLA_CONTRATOParam xWhere);
		// Qué hace: consulta una plantilla de contrato específica por llave.
		Task<CResult> GetAsync(GEN_PLANTILLA_CONTRATOParam xWhere);
		// Qué hace: registra una nueva plantilla de contrato validada.
		Task<CResult> CreateAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: actualiza una plantilla de contrato existente validada.
		Task<CResult> UpdateAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: elimina una plantilla de contrato por llave.
		Task<CResult> DeleteAsync(GEN_PLANTILLA_CONTRATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: entrega el catálogo agrupado de parámetros para redacción de contratos.
		CResult GetParametrosDisponibles();
		// Qué hace: lista las versiones registradas de una plantilla de contrato.
		Task<CResult> GetVersionesAsync(GEN_PLANTILLA_CONTRATOParam xWhere);
		// Qué hace: crea una nueva versión basada en v1 validando contenido y observación.
		Task<CResult> CrearVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: actualiza el contenido HTML de una versión v2+ activa validando reglas de inmutabilidad.
		Task<CResult> ActualizarVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: activa una versión histórica elegible (v2+) como vigente.
		Task<CResult> ActivarVersionAsync(GEN_PLANTILLA_CONTRATO_VERSIONParam Data, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: lista los movimientos de bitácora de una plantilla de contrato.
		Task<CResult> GetBitacoraAsync(GEN_PLANTILLA_CONTRATOParam xWhere);
	}
}

