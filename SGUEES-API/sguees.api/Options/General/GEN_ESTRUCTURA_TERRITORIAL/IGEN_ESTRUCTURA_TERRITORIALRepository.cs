using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IGEN_ESTRUCTURA_TERRITORIALRepository
	{
		Task<CResult> GetAllPaisesAsync(List<CParameter> xWhere);
		Task<CResult> GetPaisAsync(List<CParameter> xWhere);
		Task<CResult> CreatePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdatePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeletePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion);

		Task<CResult> GetAllDeptosAsync(List<CParameter> xWhere);
		Task<CResult> GetDeptoAsync(List<CParameter> xWhere);
		Task<CResult> CreateDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion);

		Task<CResult> GetAllMunicipiosAsync(List<CParameter> xWhere);
		Task<CResult> GetMunicipioAsync(List<CParameter> xWhere);
		Task<CResult> CreateMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion);

		Task<CResult> GetAllDistritosAsync(List<CParameter> xWhere);
		Task<CResult> GetDistritoAsync(List<CParameter> xWhere);
		Task<CResult> CreateDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion);
	}
}
