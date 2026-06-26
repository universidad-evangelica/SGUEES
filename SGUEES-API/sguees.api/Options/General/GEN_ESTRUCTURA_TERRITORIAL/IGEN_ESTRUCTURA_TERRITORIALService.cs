using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IGEN_ESTRUCTURA_TERRITORIALService
	{
		Task<CResult> GetAllPaisesAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISParam xWhere);
		Task<CResult> GetPaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISParam xWhere);
		Task<CResult> CreatePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdatePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeletePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion);

		Task<CResult> GetAllDeptosAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOParam xWhere);
		Task<CResult> GetDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOParam xWhere);
		Task<CResult> CreateDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion);

		Task<CResult> GetAllMunicipiosAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOParam xWhere);
		Task<CResult> GetMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOParam xWhere);
		Task<CResult> CreateMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion);

		Task<CResult> GetAllDistritosAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam xWhere);
		Task<CResult> GetDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam xWhere);
		Task<CResult> CreateDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion);
	}
}
