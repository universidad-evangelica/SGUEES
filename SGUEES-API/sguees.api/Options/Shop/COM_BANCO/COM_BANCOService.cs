using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_BANCOService: ICOM_BANCOService
	{
		private readonly ICOM_BANCORepository _repo;
		
		public COM_BANCOService(ICOM_BANCORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_BANCOParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_BANCOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_BANCO",Value=xWhere.CORR_BANCO,DbType=System.Data.DbType.Int16},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			Data.ESTADO_BANCO ??= true;
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(COM_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_BANCO <= 0)
			{
				return new CResult
				{
					Data = null,
					Result = false,
					CodeHelper = 0,
					ErrorCode = -1,
					ErrorMessage = "No se pudo identificar el banco a actualizar.",
					ErrorSource = "[COM_BANCOService]",
					RowsAffected = 0
				};
			}

			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
