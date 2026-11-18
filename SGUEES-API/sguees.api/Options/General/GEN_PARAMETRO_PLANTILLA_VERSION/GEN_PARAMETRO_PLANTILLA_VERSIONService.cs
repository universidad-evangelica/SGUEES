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
		private readonly IGEN_PARAMETRO_PLANTILLARepository _plantillaRepo;

		public GEN_PARAMETRO_PLANTILLA_VERSIONService(
			IGEN_PARAMETRO_PLANTILLA_VERSIONRepository repo,
			IGEN_PARAMETRO_PLANTILLARepository plantillaRepo)
		{
			_repo = repo;
			_plantillaRepo = plantillaRepo;
		}

		public async Task<CResult> GetAllAsync(GEN_PARAMETRO_PLANTILLA_VERSIONParam xWhere, string login)
		{
			if (xWhere == null || xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_PARAMETRO_PLANTILLA <= 0)
			{
				return ValidationError("Debe especificar una plantilla de correo válida.");
			}

			if (!await _plantillaRepo.PuedeVerPlantillaAsync(
				xWhere.CORR_EMPRESA,
				xWhere.CORR_PARAMETRO_PLANTILLA,
				login))
			{
				return AccessDenied("No tiene acceso a las versiones de esta plantilla.");
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = xWhere.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 }
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_PARAMETRO_PLANTILLA_VERSIONParam xWhere, string login)
		{
			if (xWhere == null || xWhere.CORR_EMPRESA <= 0 ||
				xWhere.CORR_PARAMETRO_PLANTILLA <= 0 || xWhere.NUMERO_VERSION <= 0)
			{
				return ValidationError("Debe especificar una versión de plantilla válida.");
			}

			if (!await _plantillaRepo.PuedeVerPlantillaAsync(
				xWhere.CORR_EMPRESA,
				xWhere.CORR_PARAMETRO_PLANTILLA,
				login))
			{
				return AccessDenied("No tiene acceso a esta versión de plantilla.");
			}

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
			if (Data == null || Data.CORR_EMPRESA <= 0 || Data.CORR_PARAMETRO_PLANTILLA <= 0)
			{
				return ValidationError("Debe especificar una plantilla de correo válida.");
			}

			if (!await _plantillaRepo.PuedeAdministrarPlantillaAsync(
				Data.CORR_EMPRESA,
				Data.CORR_PARAMETRO_PLANTILLA,
				vLOGIN_SISTEMA))
			{
				return AccessDenied("No tiene acceso para crear versiones de esta plantilla.");
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarVersionAsync(int corrEmpresa, int corrPlantilla, int numeroVersion, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (corrEmpresa <= 0 || corrPlantilla <= 0 || numeroVersion <= 0)
			{
				return ValidationError("Debe especificar una versión de plantilla válida.");
			}

			if (!await _plantillaRepo.PuedeAdministrarPlantillaAsync(corrEmpresa, corrPlantilla, vLOGIN_SISTEMA))
			{
				return AccessDenied("No tiene acceso para activar versiones de esta plantilla.");
			}

			return await _repo.ActivarVersionAsync(corrEmpresa, corrPlantilla, numeroVersion, vLOGIN_SISTEMA, vESTACION);
		}

		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Result = false,
				ErrorCode = -1,
				ErrorMessage = message,
			};
		}

		private static CResult AccessDenied(string message)
		{
			return new CResult
			{
				Result = false,
				ErrorCode = -403,
				ErrorMessage = message,
			};
		}
	}
}
