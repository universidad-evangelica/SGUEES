// Qué hace: consulta las firmas guardadas de un descriptor.
// Cómo lo hace: si faltan las llaves devuelve lista vacía; si no, lee la tabla.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_DESCRIPTOR_PUESTO_FIRMASService : ISC_DESCRIPTOR_PUESTO_FIRMASService
	{
		private readonly ISC_DESCRIPTOR_PUESTO_FIRMASRepository _repo;

		public SC_DESCRIPTOR_PUESTO_FIRMASService(ISC_DESCRIPTOR_PUESTO_FIRMASRepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista las firmas del descriptor.
		// Cómo lo hace: exige empresa y descriptor antes de consultar.
		public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_FIRMASParam xWhere)
		{
			if (xWhere == null || xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_DESCRIPTOR_PUESTO <= 0)
			{
				return new CResult
				{
					Data = new List<SC_DESCRIPTOR_PUESTO_FIRMASView>(),
					Result = true,
					RowsAffected = 0,
					ErrorCode = 0,
					ErrorMessage = string.Empty,
				};
			}

			return await _repo.GetAllAsync(xWhere);
		}
	}
}
