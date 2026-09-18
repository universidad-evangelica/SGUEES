using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	// Qué hace: servicio de lectura de empleados (browse/lookups).
	// Cómo lo hace: arma parámetros de empresa/empleado y delega al repositorio V_GEN_EMPLEADO.
	public class GEN_EMPLEADOService : IGEN_EMPLEADOService
	{
		private readonly IGEN_EMPLEADORepository _repo;

		public GEN_EMPLEADOService(IGEN_EMPLEADORepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista empleados de la empresa de sesión.
		// Cómo lo hace: filtra por CORR_EMPRESA y opcionalmente CORR_EMPLEADO.
		public async Task<CResult> GetAllAsync(GEN_EMPLEADOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
			if (xWhere.CORR_EMPLEADO > 0)
			{
				p.Add(new() { ParameterName = "CORR_EMPLEADO", Value = xWhere.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 });
			}
			return await _repo.GetAllAsync(p);
		}

		// Qué hace: obtiene un empleado por llave.
		// Cómo lo hace: filtra CORR_EMPRESA + CORR_EMPLEADO en la vista.
		public async Task<CResult> GetAsync(GEN_EMPLEADOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO", Value = xWhere.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}
	}
}
