// Qué hace: servicio de empleados (browse + Iniciar + personales vía SP).
// Cómo lo hace: Iniciar ejecuta PRAL_MTTO_GEN_PERSONA_NATURAL (Insert) y luego crea GEN_EMPLEADO;
//               personales Create/Update/Delete delegan al mismo SP.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_EMPLEADOService : IGEN_EMPLEADOService
	{
		private readonly IGEN_EMPLEADORepository _repo;

		public GEN_EMPLEADOService(IGEN_EMPLEADORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_EMPLEADOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
			if (xWhere.CORR_EMPLEADO > 0)
			{
				p.Add(new() { ParameterName = "CORR_EMPLEADO", Value = xWhere.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 });
			}
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_EMPLEADOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO", Value = xWhere.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		// Qué hace: inicia empleado nuevo con datos personales del tab.
		// Cómo: SP Insert (persona + empresa_persona + persona_natural con payload) y Create GEN_EMPLEADO; Data = V_GEN_EMPLEADO.
		public async Task<CResult> IniciarAsync(GEN_PERSONA_NATURALTable natural, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (corrEmpresa <= 0)
			{
				return new CResult
				{
					Result = false,
					ErrorCode = 4000,
					ErrorMessage = "CORR_EMPRESA es requerido para iniciar empleado.",
					ErrorSource = "[GEN_EMPLEADOService]",
				};
			}

			natural ??= new GEN_PERSONA_NATURALTable();
			natural.CORR_PERSONA = 0;
			natural.CORR_PERSONA_NATURAL = 0;
			natural.ES_JUBILADO ??= false;
			natural.POSEE_DISCAPACIDAD ??= false;
			natural.ES_EXTRANJERO ??= false;

			var spResult = await _repo.MttoPersonaNaturalAsync(natural, (int)UpdateType.Add, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
			if (!spResult.Result || spResult.ErrorCode != 0 || spResult.Data is not GEN_PERSONA_NATURALView naturalView)
			{
				return spResult;
			}

			var empleado = new GEN_EMPLEADOTable
			{
				CORR_EMPRESA = corrEmpresa,
				CORR_EMPLEADO = 0,
				CORR_PERSONA = naturalView.CORR_PERSONA,
				ACTIVO_EMPLEADO = true,
				USUARIO_CREA = natural.USUARIO_CREA,
				ESTACION_CREA = natural.ESTACION_CREA,
				FECHA_CREA = natural.FECHA_CREA,
				USUARIO_ACTU = natural.USUARIO_ACTU,
				ESTACION_ACTU = natural.ESTACION_ACTU,
				FECHA_ACTU = natural.FECHA_ACTU,
			};

			return await _repo.CreateAsync(empleado, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> GetPersonaNaturalAsync(GEN_PERSONA_NATURALParam xWhere)
		{
			var p = new List<CParameter>();
			if (xWhere.CORR_PERSONA_NATURAL > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PERSONA_NATURAL", Value = xWhere.CORR_PERSONA_NATURAL, DbType = System.Data.DbType.Int64 });
			}
			else if (xWhere.CORR_PERSONA > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PERSONA", Value = xWhere.CORR_PERSONA, DbType = System.Data.DbType.Int64 });
			}

			return await _repo.GetPersonaNaturalAsync(p);
		}

		public Task<CResult> CreatePersonaNaturalAsync(GEN_PERSONA_NATURALTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.MttoPersonaNaturalAsync(Data, (int)UpdateType.Add, corrEmpresa, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdatePersonaNaturalAsync(GEN_PERSONA_NATURALTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.MttoPersonaNaturalAsync(Data, (int)UpdateType.Update, corrEmpresa, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeletePersonaNaturalAsync(GEN_PERSONA_NATURALTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.MttoPersonaNaturalAsync(Data, (int)UpdateType.Delete, corrEmpresa, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> CreateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
