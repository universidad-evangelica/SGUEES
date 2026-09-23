// Qué hace: servicio de empleados (browse + Iniciar + personales vía SP).
// Cómo lo hace: Iniciar/UpdatePersonales delegan a PRAL_MTTO_GEN_EMPLEADO (persona + natural + empleado).
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

		// Qué hace: inicia empleado nuevo (4 tablas en una transacción SP).
		// Cómo: PRAL_MTTO_GEN_EMPLEADO TIPO 1; Data = V_GEN_EMPLEADO.
		public async Task<CResult> IniciarAsync(GEN_EMPLEADO_MTTOTable data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
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

			data ??= new GEN_EMPLEADO_MTTOTable();
			data.CORR_PERSONA = 0;
			data.CORR_PERSONA_NATURAL = 0;
			data.CORR_EMPLEADO = 0;
			data.ES_JUBILADO ??= false;
			data.POSEE_DISCAPACIDAD ??= false;
			data.ES_EXTRANJERO ??= false;
			data.ACTIVO_EMPLEADO ??= true;

			return await _repo.MttoEmpleadoAsync(data, (int)UpdateType.Add, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
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

		// Qué hace: actualiza personales + datos GEN_EMPLEADO del form.
		// Cómo: PRAL_MTTO_GEN_EMPLEADO TIPO 2; relee natural en Data (empleado ya en memoria SPA).
		public Task<CResult> UpdatePersonalesAsync(GEN_EMPLEADO_MTTOTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.MttoEmpleadoAsync(Data, (int)UpdateType.Update, corrEmpresa, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> CreateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
