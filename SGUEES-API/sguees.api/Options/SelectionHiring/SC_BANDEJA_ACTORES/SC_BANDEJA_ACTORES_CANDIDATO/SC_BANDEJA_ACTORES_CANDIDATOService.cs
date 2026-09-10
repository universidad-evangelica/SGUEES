using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_BANDEJA_ACTORES_CANDIDATOService : ISC_BANDEJA_ACTORES_CANDIDATOService
	{
		private readonly ISC_BANDEJA_ACTORES_CANDIDATORepository _repo;

		public SC_BANDEJA_ACTORES_CANDIDATOService(ISC_BANDEJA_ACTORES_CANDIDATORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetCandidatosAsync(SC_BANDEJA_ACTORES_CANDIDATOParam xWhere)
		{
			var p = BuildBaseParams(xWhere.CORR_EMPRESA, xWhere.LOGIN_SISTEMA);
			p.Add(new CParameter { ParameterName = "PAGE", Value = xWhere.PAGE <= 0 ? 1 : xWhere.PAGE, DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "SORT_FIELD", Value = xWhere.SORT_FIELD ?? "", DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "SORT_DESC", Value = xWhere.SORT_DESC, DbType = DbType.Boolean });

			if (xWhere.CORR_UNIDAD > 0)
			{
				p.Add(new CParameter
				{
					ParameterName = "CORR_UNIDAD",
					Value = xWhere.CORR_UNIDAD,
					DbType = DbType.Int32,
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

			return await _repo.GetCandidatosPagedAsync(p);
		}

		public Task<int> CountCandidatosPendientesAsync(int corrEmpresa, string loginSistema) =>
			_repo.CountCandidatosPendientesAsync(BuildBaseParams(corrEmpresa, loginSistema));

		private static List<CParameter> BuildBaseParams(int corrEmpresa, string loginSistema) =>
			new()
			{
				new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				new()
				{
					ParameterName = "LOGIN_SISTEMA",
					Value = (loginSistema ?? string.Empty).Trim(),
					DbType = DbType.String,
				},
			};
	}
}
