using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class SC_SOLICITUD_REQUISICIONService : ISC_SOLICITUD_REQUISICIONService
	{
		private readonly ISC_SOLICITUD_REQUISICIONRepository _repo;

		public SC_SOLICITUD_REQUISICIONService(ISC_SOLICITUD_REQUISICIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SC_SOLICITUD_REQUISICIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = xWhere.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SC_SOLICITUD_REQUISICIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SOLICITUD_REQUISICION", Value = xWhere.CORR_SOLICITUD_REQUISICION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_SOLICITUD_REQUISICIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SC_SOLICITUD_REQUISICIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
