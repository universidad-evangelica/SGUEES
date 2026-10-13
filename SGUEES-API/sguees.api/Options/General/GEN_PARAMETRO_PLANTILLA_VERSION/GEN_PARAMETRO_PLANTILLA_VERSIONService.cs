// Qué hace: servicio de lógica de negocio para versiones de plantillas de correo.
// Cómo lo hace: prepara los filtros CParameter por empresa y plantilla y delega llamadas al repositorio IGEN_PARAMETRO_PLANTILLA_VERSIONRepository.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PARAMETRO_PLANTILLA_VERSIONService : IGEN_PARAMETRO_PLANTILLA_VERSIONService
	{
		private readonly IGEN_PARAMETRO_PLANTILLA_VERSIONRepository _repo;

		public GEN_PARAMETRO_PLANTILLA_VERSIONService(IGEN_PARAMETRO_PLANTILLA_VERSIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_PARAMETRO_PLANTILLA_VERSIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = xWhere.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 }
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_PARAMETRO_PLANTILLA_VERSIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = xWhere.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "NUMERO_VERSION", Value = xWhere.NUMERO_VERSION, DbType = System.Data.DbType.Int32 }
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_PARAMETRO_PLANTILLA_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarVersionAsync(int corrEmpresa, int corrPlantilla, int numeroVersion, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.ActivarVersionAsync(corrEmpresa, corrPlantilla, numeroVersion, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
