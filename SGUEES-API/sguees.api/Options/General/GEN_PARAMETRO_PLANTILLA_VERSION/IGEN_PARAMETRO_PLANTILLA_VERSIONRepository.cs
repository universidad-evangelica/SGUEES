// Qué hace: contrato de repositorio para acceso a datos de versiones de plantilla.
// Cómo lo hace: define operaciones asíncronas para listar, obtener, crear versión y activar una versión existente.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PARAMETRO_PLANTILLA_VERSIONRepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
		Task<CResult> GetAsync(List<CParameter> xWhere);
		Task<CResult> CreateAsync(GEN_PARAMETRO_PLANTILLA_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarVersionAsync(int corrEmpresa, int corrPlantilla, int numeroVersion, string vLOGIN_SISTEMA, string vESTACION);
	}
}
