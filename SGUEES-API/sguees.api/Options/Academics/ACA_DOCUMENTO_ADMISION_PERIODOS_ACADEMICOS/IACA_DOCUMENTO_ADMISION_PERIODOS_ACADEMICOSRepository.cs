// Qué hace: contrato del repositorio de documentos por período.
// Cómo: extiende IRepository y agrega las marcas del documento en cada período.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSRepository : IRepository<ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable>
	{
		Task<CResult> GetAsignacionesAsync(List<CParameter> xWhere);
		Task<bool> ExistsAsignacionAsync(int corrEmpresa, int corrPeriodo, int corrDocumento);
		Task<bool> ExistsPeriodoAsync(int corrEmpresa, int corrPeriodo);
		Task<bool> ExistsDocumentoAsync(int corrDocumentoAdmision);
	}
}
