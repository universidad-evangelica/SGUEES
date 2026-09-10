using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_BANDEJA_TH_CONTRATOService : ISC_BANDEJA_TH_CONTRATOService
	{
		private readonly ISC_BANDEJA_TH_CONTRATORepository _repo;

		public SC_BANDEJA_TH_CONTRATOService(ISC_BANDEJA_TH_CONTRATORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetContratacionesAsync(SC_BANDEJA_TH_CONTRATOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = DbType.Int32 },
				new() { ParameterName = "PAGE", Value = xWhere.PAGE <= 0 ? 1 : xWhere.PAGE, DbType = DbType.Int32 },
				new() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = DbType.Int32 },
				new() { ParameterName = "SORT_FIELD", Value = xWhere.SORT_FIELD ?? "", DbType = DbType.String },
				new() { ParameterName = "SORT_DESC", Value = xWhere.SORT_DESC, DbType = DbType.Boolean },
			};

			if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_UNIDAD)
				&& !string.Equals(xWhere.NOMBRE_UNIDAD.Trim(), "TODOS", System.StringComparison.OrdinalIgnoreCase))
			{
				p.Add(new CParameter
				{
					ParameterName = "NOMBRE_UNIDAD",
					Value = xWhere.NOMBRE_UNIDAD.Trim(),
					DbType = DbType.String,
				});
			}

			if (xWhere.FECHA_DESDE.HasValue)
			{
				p.Add(new CParameter
				{
					ParameterName = "FECHA_DESDE",
					Value = xWhere.FECHA_DESDE.Value,
					DbType = DbType.Date,
				});
			}

			if (xWhere.FECHA_HASTA.HasValue)
			{
				p.Add(new CParameter
				{
					ParameterName = "FECHA_HASTA",
					Value = xWhere.FECHA_HASTA.Value,
					DbType = DbType.Date,
				});
			}

			if (!string.IsNullOrWhiteSpace(xWhere.BUSQUEDA))
			{
				p.Add(new CParameter
				{
					ParameterName = "BUSQUEDA",
					Value = xWhere.BUSQUEDA.Trim(),
					DbType = DbType.String,
				});
			}

			return await _repo.GetContratacionesPagedAsync(p);
		}
	}
}
