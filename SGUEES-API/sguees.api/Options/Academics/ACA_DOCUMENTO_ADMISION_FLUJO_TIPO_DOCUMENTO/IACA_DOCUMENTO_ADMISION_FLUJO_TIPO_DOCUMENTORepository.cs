// Qué hace: contrato del repositorio de documentos por solicitud.
// Cómo: extiende IRepository y agrega el catálogo de documentos y las asignaciones.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTORepository : IRepository<ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable>
	{
		Task<CResult> GetAsignacionesAsync(List<CParameter> xWhere);
		Task<CResult> GetDocumentosAsync();
		Task<bool> ExistsAsignacionAsync(int corrEmpresa, int corrTipoDocumento, int corrDocumentoAdmision);
		Task<bool> ExistsTipoProspectoAsync(int corrEmpresa, int corrTipoDocumento);
		Task<bool> ExistsDocumentoAsync(int corrDocumentoAdmision);
	}
}
