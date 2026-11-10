using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PROVEEDORService : IGEN_PROVEEDORService
	{
		private readonly IGEN_PROVEEDORRepository _repo;

		public GEN_PROVEEDORService(IGEN_PROVEEDORRepository repo)
		{
			_repo = repo;
		}

		/// <summary>
		/// Lista paginada. PAGE_SIZE &lt;= 0 = Todos.
		/// Filtros filter-row (LIKE por columna) + ACTIVO_PROVEEDOR opcional.
		/// Data = página; RowsAffected = total filtrado.
		/// </summary>
		public async Task<CResult> GetAllAsync(GEN_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "PAGE", Value = xWhere.PAGE < 1 ? 1 : xWhere.PAGE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "SORT_FIELD", Value = xWhere.SORT_FIELD ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "SORT_DESC", Value = xWhere.SORT_DESC, DbType = System.Data.DbType.Boolean },
			};

			AddTextIfPresent(p, "CODIGO_PROVEEDOR", xWhere.CODIGO_PROVEEDOR);
			AddTextIfPresent(p, "NOMBRE_COMERCIAL", xWhere.NOMBRE_COMERCIAL);
			AddTextIfPresent(p, "NOMBRE_PROVEEDOR", xWhere.NOMBRE_PROVEEDOR);
			AddTextIfPresent(p, "NOMBRE_TIPO_PERSONERIA", xWhere.NOMBRE_TIPO_PERSONERIA);
			AddTextIfPresent(p, "USUARIO_CREA", xWhere.USUARIO_CREA);
			AddTextIfPresent(p, "USUARIO_ACTU", xWhere.USUARIO_ACTU);
			AddTextIfPresent(p, "SEARCH", xWhere.SEARCH);

			if (xWhere.CORR_PROVEEDOR > 0)
			{
				p.Add(new CParameter
				{
					ParameterName = "CORR_PROVEEDOR",
					Value = xWhere.CORR_PROVEEDOR,
					DbType = System.Data.DbType.Int32,
				});
			}

			if (xWhere.ACTIVO_PROVEEDOR.HasValue)
			{
				p.Add(new CParameter
				{
					ParameterName = "ACTIVO_PROVEEDOR",
					Value = xWhere.ACTIVO_PROVEEDOR.Value,
					DbType = System.Data.DbType.Boolean,
				});
			}

			return await _repo.GetAllAsync(p);
		}

		private static void AddTextIfPresent(List<CParameter> p, string name, string value)
		{
			if (string.IsNullOrWhiteSpace(value))
			{
				return;
			}

			p.Add(new CParameter
			{
				ParameterName = name,
				Value = value.Trim(),
				DbType = System.Data.DbType.String,
			});
		}

		public Task<CResult> GetLookupAsync(int corrEmpresa)
			=> _repo.GetLookupAsync(corrEmpresa);

		public async Task<CResult> GetAsync(GEN_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> GetPersonasLookupAsync(GEN_PROVEEDORParam xWhere)
			=> _repo.GetPersonasLookupAsync(xWhere.CORR_EMPRESA, xWhere.CORR_PERSONA);

		public Task<CResult> GetPersonaAsync(GEN_PROVEEDORParam xWhere)
			=> _repo.GetPersonaAsync(xWhere.CORR_EMPRESA, xWhere.CORR_PERSONA);

		public Task<CResult> CreatePersonaNaturalAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreatePersonaNaturalAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdatePersonaNaturalAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdatePersonaNaturalAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> CreatePersonaJuridicaAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreatePersonaJuridicaAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdatePersonaJuridicaAsync(GEN_PROVEEDOR_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdatePersonaJuridicaAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> CreateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			ApplyCreateDefaults(Data);
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		private static void ApplyCreateDefaults(GEN_PROVEEDORTable Data)
		{
			Data.CODIGO_PROVEEDOR ??= string.Empty;
			Data.ESTADO_PROVEEDOR = string.IsNullOrWhiteSpace(Data.ESTADO_PROVEEDOR) ? "A" : Data.ESTADO_PROVEEDOR;
			Data.ESTADO_PROVEEDOR_WEB = string.IsNullOrWhiteSpace(Data.ESTADO_PROVEEDOR_WEB) ? "D" : Data.ESTADO_PROVEEDOR_WEB;
		}
	}
}
