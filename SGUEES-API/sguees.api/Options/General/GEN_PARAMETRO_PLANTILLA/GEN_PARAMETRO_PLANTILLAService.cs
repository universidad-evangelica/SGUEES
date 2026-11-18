// Qué hace: servicio de lógica de negocio para plantillas de correo.
// Cómo lo hace: construye los filtros por empresa y servidor SMTP, y delega operaciones a IGEN_PARAMETRO_PLANTILLARepository.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PARAMETRO_PLANTILLAService : IGEN_PARAMETRO_PLANTILLAService
	{
		private readonly IGEN_PARAMETRO_PLANTILLARepository _repo;

		public GEN_PARAMETRO_PLANTILLAService(IGEN_PARAMETRO_PLANTILLARepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista plantillas de correo filtradas por empresa y opcionalmente por cuenta SMTP o código.
		// Cómo lo hace: añade parámetros a la lista p y llama a GetAllAsync del repositorio.
		public async Task<CResult> GetAllAsync(GEN_PARAMETRO_PLANTILLAParam xWhere, string login)
		{
			if (xWhere == null)
			{
				return ValidationError("Los filtros de consulta son requeridos.");
			}

			return await _repo.GetAllVisibleAsync(xWhere, login);
		}

		// Qué hace: obtiene una plantilla por su correlativo o código.
		// Cómo lo hace: consulta únicamente si el registro es visible para el usuario autenticado.
		public async Task<CResult> GetAsync(GEN_PARAMETRO_PLANTILLAParam xWhere, string login)
		{
			if (xWhere == null ||
				(xWhere.CORR_PARAMETRO_PLANTILLA <= 0 && string.IsNullOrWhiteSpace(xWhere.CODIGO_PLANTILLA)))
			{
				return ValidationError("Debe especificar una plantilla de correo válida.");
			}

			var result = await _repo.GetVisibleAsync(xWhere, login);
			if (result.Result && result.Data == null)
			{
				return AccessDenied("No tiene acceso a esta plantilla de correo.");
			}

			return result;
		}

		public async Task<CResult> CreateAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EMPRESA <= 0 || string.IsNullOrWhiteSpace(vLOGIN_SISTEMA))
			{
				return ValidationError("La empresa y el usuario de sesión son requeridos.");
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EMPRESA <= 0 || Data.CORR_PARAMETRO_PLANTILLA <= 0)
			{
				return ValidationError("Debe seleccionar una plantilla de correo válida.");
			}

			if (!await _repo.PuedeAdministrarPlantillaAsync(
				Data.CORR_EMPRESA,
				Data.CORR_PARAMETRO_PLANTILLA,
				vLOGIN_SISTEMA))
			{
				return AccessDenied("No tiene acceso para modificar esta plantilla de correo.");
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EMPRESA <= 0 || Data.CORR_PARAMETRO_PLANTILLA <= 0)
			{
				return ValidationError("Debe seleccionar una plantilla de correo válida.");
			}

			if (!await _repo.PuedeAdministrarPlantillaAsync(
				Data.CORR_EMPRESA,
				Data.CORR_PARAMETRO_PLANTILLA,
				vLOGIN_SISTEMA))
			{
				return AccessDenied("No tiene acceso para eliminar esta plantilla de correo.");
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: obtiene la lista de módulos / sistemas registrados a los que el usuario tiene acceso.
		// Cómo lo hace: delega la consulta a _repo.GetModulosAsync filtrando por LOGIN_SISTEMA.
		public async Task<CResult> GetModulosAsync(string loginSistema = "")
		{
			return await _repo.GetModulosAsync(loginSistema);
		}

		// Qué hace: obtiene las opciones de menú de un módulo a las que el usuario tiene permiso asignado.
		// Cómo lo hace: delega la consulta a _repo.GetOpcionesPorModuloAsync filtrando por CODIGO_SISTEMA y LOGIN_SISTEMA.
		public async Task<CResult> GetOpcionesPorModuloAsync(string codigoSistema, string loginSistema = "")
		{
			return await _repo.GetOpcionesPorModuloAsync(codigoSistema, loginSistema);
		}

		// Qué hace: obtiene los parámetros dinámicos institucionales y de BD para la opción seleccionada.
		// Cómo lo hace: delega la consulta a _repo.GetParametrosDisponiblesAsync.
		public async Task<CResult> GetParametrosDisponiblesAsync(string codigoOpcion, string codigoSistema)
		{
			return await _repo.GetParametrosDisponiblesAsync(codigoOpcion, codigoSistema);
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
