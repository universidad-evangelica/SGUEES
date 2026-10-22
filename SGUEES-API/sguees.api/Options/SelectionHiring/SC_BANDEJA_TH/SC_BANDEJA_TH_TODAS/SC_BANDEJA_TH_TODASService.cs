using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	// Qué hace: Servicio de lógica para la consulta de la pestaña Todas en Bandeja TH.
	// Cómo lo hace: Mapea SC_BANDEJA_TH_TODASParam a lista de CParameter e invoca a GetTodasPagedAsync del repositorio.
	public class SC_BANDEJA_TH_TODASService : ISC_BANDEJA_TH_TODASService
	{
		private readonly ISC_BANDEJA_TH_TODASRepository _repo;

		public SC_BANDEJA_TH_TODASService(ISC_BANDEJA_TH_TODASRepository repo)
		{
			_repo = repo;
		}

		// Qué hace: Orquesta la consulta unificada de Todas traduciendo parámetros a CParameter.
		// Cómo lo hace: Añade CORR_EMPRESA, PAGE, PAGE_SIZE, SORT_FIELD, SORT_DESC, TIPO, NOMBRE_UNIDAD, FECHA_DESDE, FECHA_HASTA y BUSQUEDA.
		public async Task<CResult> GetTodasAsync(SC_BANDEJA_TH_TODASParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = DbType.Int32 },
				new() { ParameterName = "PAGE", Value = xWhere.PAGE <= 0 ? 1 : xWhere.PAGE, DbType = DbType.Int32 },
				new() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = DbType.Int32 },
				new() { ParameterName = "SORT_FIELD", Value = xWhere.SORT_FIELD ?? "", DbType = DbType.String },
				new() { ParameterName = "SORT_DESC", Value = xWhere.SORT_DESC, DbType = DbType.Boolean },
			};

			if (!string.IsNullOrWhiteSpace(xWhere.TIPO) && !string.Equals(xWhere.TIPO, "TODOS", System.StringComparison.OrdinalIgnoreCase))
			{
				p.Add(new CParameter
				{
					ParameterName = "TIPO",
					Value = xWhere.TIPO.Trim().ToUpper(),
					DbType = DbType.String,
				});
			}

			// Qué hace: Pasa el estado al repositorio si fue especificado y no es TODOS.
			// Cómo lo hace: Evalúa xWhere.ESTADO e inserta el CParameter correspondiente.
			if (!string.IsNullOrWhiteSpace(xWhere.ESTADO) && !string.Equals(xWhere.ESTADO, "TODOS", System.StringComparison.OrdinalIgnoreCase))
			{
				p.Add(new CParameter
				{
					ParameterName = "ESTADO",
					Value = xWhere.ESTADO.Trim(),
					DbType = DbType.String,
				});
			}

			if (!string.IsNullOrWhiteSpace(xWhere.NOMBRE_UNIDAD) && !string.Equals(xWhere.NOMBRE_UNIDAD, "TODOS", System.StringComparison.OrdinalIgnoreCase))
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

			return await _repo.GetTodasPagedAsync(p);
		}
	}
}
