// Qué hace: contrato de servicio de negocio para las versiones de plantilla.
// Cómo lo hace: define métodos GetAllAsync, GetAsync, CreateAsync y ActivarVersionAsync.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PARAMETRO_PLANTILLA_VERSIONService
	{
		Task<CResult> GetAllAsync(GEN_PARAMETRO_PLANTILLA_VERSIONParam xWhere);
		Task<CResult> GetAsync(GEN_PARAMETRO_PLANTILLA_VERSIONParam xWhere);
		Task<CResult> CreateAsync(GEN_PARAMETRO_PLANTILLA_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarVersionAsync(int corrEmpresa, int corrPlantilla, int numeroVersion, string vLOGIN_SISTEMA, string vESTACION);
	}
}
