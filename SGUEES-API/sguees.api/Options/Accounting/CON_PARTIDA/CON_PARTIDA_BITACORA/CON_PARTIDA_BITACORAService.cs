using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	// Qué hace: orquesta la consulta de bitácora de partida.
	// Cómo lo hace: arma parámetros CParameter y delega al repositorio.
	public class CON_PARTIDA_BITACORAService : ICON_PARTIDA_BITACORAService
	{
		private readonly ICON_PARTIDA_BITACORARepository _repo;

		public CON_PARTIDA_BITACORAService(ICON_PARTIDA_BITACORARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(CON_PARTIDA_BITACORAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = xWhere.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PARTIDA", Value = xWhere.CORR_PARTIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PARTIDA_BITACORA", Value = xWhere.CORR_PARTIDA_BITACORA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_PARTIDA_BITACORAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = xWhere.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PARTIDA", Value = xWhere.CORR_PARTIDA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PARTIDA_BITACORA", Value = xWhere.CORR_PARTIDA_BITACORA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}
	}
}
