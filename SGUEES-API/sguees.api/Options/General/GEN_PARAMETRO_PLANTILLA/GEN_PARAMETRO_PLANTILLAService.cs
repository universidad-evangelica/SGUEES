// Qué hace: servicio de lógica de negocio para plantillas de correo.
// Cómo lo hace: construye los filtros por empresa y servidor SMTP, y delega operaciones a IGEN_PARAMETRO_PLANTILLARepository.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
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
		public async Task<CResult> GetAllAsync(GEN_PARAMETRO_PLANTILLAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }
			};

			if (xWhere.CORR_PARAMETRO_SMTP > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PARAMETRO_SMTP", Value = xWhere.CORR_PARAMETRO_SMTP, DbType = System.Data.DbType.Int32 });
			}

			if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_PLANTILLA))
			{
				p.Add(new CParameter() { ParameterName = "CODIGO_PLANTILLA", Value = xWhere.CODIGO_PLANTILLA, DbType = System.Data.DbType.String });
			}

			if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_SISTEMA))
			{
				p.Add(new CParameter() { ParameterName = "CODIGO_SISTEMA", Value = xWhere.CODIGO_SISTEMA, DbType = System.Data.DbType.String });
			}

			if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_OPCION))
			{
				p.Add(new CParameter() { ParameterName = "CODIGO_OPCION", Value = xWhere.CODIGO_OPCION, DbType = System.Data.DbType.String });
			}

			return await _repo.GetAllAsync(p);
		}

		// Qué hace: obtiene una plantilla por su correlativo o código.
		// Cómo lo hace: añade filtros por clave primaria y ejecuta GetAsync.
		public async Task<CResult> GetAsync(GEN_PARAMETRO_PLANTILLAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }
			};

			if (xWhere.CORR_PARAMETRO_PLANTILLA > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = xWhere.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 });
			}

			if (!string.IsNullOrWhiteSpace(xWhere.CODIGO_PLANTILLA))
			{
				p.Add(new CParameter() { ParameterName = "CODIGO_PLANTILLA", Value = xWhere.CODIGO_PLANTILLA, DbType = System.Data.DbType.String });
			}

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_PARAMETRO_PLANTILLATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
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
	}
}
