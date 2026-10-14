// Qué hace: reglas para cargar empleados en el descriptor.
// Cómo lo hace: valida las llaves y delega la lectura y el filtro de puesto y unidad al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_DESCRIPTOR_PUESTO_EMPLEADOService : ISC_DESCRIPTOR_PUESTO_EMPLEADOService
	{
		private readonly ISC_DESCRIPTOR_PUESTO_EMPLEADORepository _repo;

		public SC_DESCRIPTOR_PUESTO_EMPLEADOService(ISC_DESCRIPTOR_PUESTO_EMPLEADORepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista los empleados ya cargados.
		// Cómo lo hace: filtra por empresa y, si viene, por descriptor.
		public async Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOParam xWhere)
		{
			if (xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_DESCRIPTOR_PUESTO <= 0)
			{
				return OkVacio();
			}

			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		// Qué hace: lista empleados que aplican al puesto y la unidad del descriptor.
		// Cómo lo hace: pide al repositorio los que están en GEN_EMPLEADO_PUESTO y aún no están cargados.
		public async Task<CResult> GetDisponiblesAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOParam xWhere)
		{
			if (xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_DESCRIPTOR_PUESTO <= 0)
			{
				return ValidationError("Debe guardar el descriptor antes de cargar empleados.");
			}

			return await _repo.GetDisponiblesAsync(xWhere.CORR_EMPRESA, xWhere.CORR_DESCRIPTOR_PUESTO);
		}

		// Qué hace: lista los descriptores ya asignados al empleado.
		// Cómo lo hace: filtra por empresa y empleado.
		public async Task<CResult> GetPorEmpleadoAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOParam xWhere)
		{
			if (xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_EMPLEADO <= 0)
			{
				return OkVacio();
			}

			return await _repo.GetPorEmpleadoAsync(xWhere.CORR_EMPRESA, xWhere.CORR_EMPLEADO);
		}

		// Qué hace: lista descriptores activos que aplican al puesto y la unidad del empleado.
		// Cómo lo hace: incluye los ya asignados para que el modal los muestre con check.
		public async Task<CResult> GetDisponiblesPorEmpleadoAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOParam xWhere)
		{
			if (xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_EMPLEADO <= 0)
			{
				return ValidationError("Debe guardar el empleado antes de asignar descriptores.");
			}

			return await _repo.GetDisponiblesPorEmpleadoAsync(xWhere.CORR_EMPRESA, xWhere.CORR_EMPLEADO);
		}

		// Qué hace: carga un empleado en el descriptor.
		// Cómo lo hace: exige la llave y deja que el repositorio valide puesto y unidad.
		public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_EMPLEADO <= 0)
			{
				return ValidationError("Debe indicar el descriptor y el empleado a cargar.");
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: activa o inactiva la carga del empleado en el descriptor.
		// Cómo lo hace: exige la llave y el bit, y deja que el repositorio actualice solo ese campo.
		public async Task<CResult> CambiarActivoAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_EMPLEADO <= 0)
			{
				return ValidationError("Debe indicar el descriptor y el empleado de la carga.");
			}

			if (Data.ACTIVO_DESCRIPTOR_PUESTO_EMPLEADO == null)
			{
				return ValidationError("Debe indicar si la carga queda activa o inactiva.");
			}

			return await _repo.CambiarActivoAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: quita un empleado del descriptor.
		// Cómo lo hace: exige la llave y elimina el vínculo.
		public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_EMPRESA <= 0 || Data.CORR_DESCRIPTOR_PUESTO <= 0 || Data.CORR_EMPLEADO <= 0)
			{
				return ValidationError("Debe indicar el empleado del descriptor a quitar.");
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static List<CParameter> BuildParameters(SC_DESCRIPTOR_PUESTO_EMPLEADOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
			if (xWhere.CORR_DESCRIPTOR_PUESTO > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 });
			}

			return p;
		}

		private static CResult OkVacio()
		{
			return new CResult
			{
				Data = new List<SC_DESCRIPTOR_PUESTO_EMPLEADOView>(),
				Result = true,
				RowsAffected = 0,
				ErrorCode = 0,
				ErrorMessage = "",
			};
		}

		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				RowsAffected = 0,
				ErrorCode = 4000,
				ErrorMessage = message,
				ErrorSource = "",
			};
		}
	}
}
