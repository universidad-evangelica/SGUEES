using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_BANDEJA_ACTORES_REQUISICIONService : ISC_BANDEJA_ACTORES_REQUISICIONService
	{
		private readonly ISC_BANDEJA_ACTORES_REQUISICIONRepository _repo;

		public SC_BANDEJA_ACTORES_REQUISICIONService(ISC_BANDEJA_ACTORES_REQUISICIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetRequisicionesAsync(SC_BANDEJA_ACTORES_REQUISICIONParam xWhere)
		{
			var p = BuildBaseParams(xWhere.CORR_EMPRESA, xWhere.LOGIN_SISTEMA);
			p.Add(new CParameter { ParameterName = "PAGE", Value = xWhere.PAGE <= 0 ? 1 : xWhere.PAGE, DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = DbType.Int32 });
			p.Add(new CParameter { ParameterName = "SORT_FIELD", Value = xWhere.SORT_FIELD ?? "", DbType = DbType.String });
			p.Add(new CParameter { ParameterName = "SORT_DESC", Value = xWhere.SORT_DESC, DbType = DbType.Boolean });

			if (xWhere.CORR_ESTADO_REQUISICION > 0)
			{
				p.Add(new CParameter
				{
					ParameterName = "CORR_ESTADO_REQUISICION",
					Value = xWhere.CORR_ESTADO_REQUISICION,
					DbType = DbType.Int32,
				});
			}

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

			return await _repo.GetRequisicionesPagedAsync(p);
		}

		public async Task<CResult> GetBitacoraRequisicionAsync(SC_BANDEJA_ACTORES_BITACORAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new()
				{
					ParameterName = "CORR_TIPO_DOCUMENTO",
					Value = xWhere.CORR_TIPO_DOCUMENTO > 0 ? xWhere.CORR_TIPO_DOCUMENTO : 101,
					DbType = DbType.Int32,
				},
				new()
				{
					ParameterName = "CORR_DOCUMENTO",
					Value = xWhere.CORR_REQUISICION_PERSONAL,
					DbType = DbType.Int32,
				},
			};

			return await _repo.GetBitacoraRequisicionAsync(p);
		}

		public Task<CResult> GetUnidadesPendientesAsync(int corrEmpresa, string loginSistema) =>
			_repo.GetUnidadesPendientesAsync(BuildBaseParams(corrEmpresa, loginSistema));

		public Task<int> CountRequisicionesPendientesAsync(int corrEmpresa, string loginSistema) =>
			_repo.CountRequisicionesPendientesAsync(BuildBaseParams(corrEmpresa, loginSistema));

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
