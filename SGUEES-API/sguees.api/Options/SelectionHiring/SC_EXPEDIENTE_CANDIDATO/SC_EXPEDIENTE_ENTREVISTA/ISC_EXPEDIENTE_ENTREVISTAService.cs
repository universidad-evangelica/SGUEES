using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_EXPEDIENTE_ENTREVISTAService
	{
		Task<CResult> GetAllAsync(SC_EXPEDIENTE_ENTREVISTAParam xWhere);
		Task<CResult> GetAsync(SC_EXPEDIENTE_ENTREVISTAParam xWhere);
		Task<CResult> CreateAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION);

		/// <summary>
		/// Actualiza desde sc-requisicion-personal: solo el creador y solo si está PROGRAMADA.
		/// </summary>
		Task<CResult> UpdateByRequisicionAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION);

		/// <summary>
		/// Elimina desde sc-requisicion-personal: solo el creador y solo si está PROGRAMADA.
		/// </summary>
		Task<CResult> DeleteByRequisicionAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
