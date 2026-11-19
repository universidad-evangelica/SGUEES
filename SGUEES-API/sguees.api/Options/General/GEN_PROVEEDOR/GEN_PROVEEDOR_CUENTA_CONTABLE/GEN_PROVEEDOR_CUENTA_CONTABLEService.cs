using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PROVEEDOR_CUENTA_CONTABLEService : IGEN_PROVEEDOR_CUENTA_CONTABLEService
	{
		private static readonly HashSet<string> TiposValidos = new()
		{
			"CXP", "GAS", "PRO", "ANT", "RET", "IVA", "DES", "DEV",
		};

		private readonly IGEN_PROVEEDOR_CUENTA_CONTABLERepository _repo;

		public GEN_PROVEEDOR_CUENTA_CONTABLEService(IGEN_PROVEEDOR_CUENTA_CONTABLERepository repo)
		{
			_repo = repo;
		}

		public Task<CResult> GetAllAsync(GEN_PROVEEDOR_CUENTA_CONTABLEParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
			};
			return _repo.GetAllAsync(p);
		}

		public Task<CResult> GetAsync(GEN_PROVEEDOR_CUENTA_CONTABLEParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA", Value = xWhere.CORR_CUENTA, DbType = System.Data.DbType.Int32 },
			};
			return _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var invalido = Validar(Data, false);
			if (invalido != null)
			{
				return Task.FromResult(invalido);
			}

			Normalizar(Data);
			Data.CORR_CUENTA = 0;
			return _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var invalido = Validar(Data, true);
			if (invalido != null)
			{
				return Task.FromResult(invalido);
			}

			Normalizar(Data);
			return _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_PROVEEDOR <= 0 || Data.CORR_CUENTA <= 0)
			{
				return Error("Debe indicar la cuenta que desea eliminar.");
			}

			var actual = await _repo.GetAsync(new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA", Value = Data.CORR_CUENTA, DbType = System.Data.DbType.Int32 },
			});
			if (!actual.Result)
			{
				return actual;
			}

			if (actual.Data is not GEN_PROVEEDOR_CUENTA_CONTABLEView fila)
			{
				return Error("La cuenta no está asignada a este proveedor.");
			}

			if (fila.ACTIVO)
			{
				return Error("No se puede eliminar una cuenta activa. Desactívela antes de eliminarla.");
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static void Normalizar(GEN_PROVEEDOR_CUENTA_CONTABLETable Data)
		{
			Data.TIPO_CUENTA = (Data.TIPO_CUENTA ?? string.Empty).Trim().ToUpperInvariant();
			Data.CUENTA_CONTABLE = (Data.CUENTA_CONTABLE ?? string.Empty).Trim();
		}

		private static CResult Validar(GEN_PROVEEDOR_CUENTA_CONTABLETable Data, bool exigeCorrelativo)
		{
			if (Data == null || Data.CORR_PROVEEDOR <= 0)
			{
				return Error("Guarde el proveedor antes de asignar cuentas.");
			}

			if (exigeCorrelativo && Data.CORR_CUENTA <= 0)
			{
				return Error("Debe indicar la cuenta que desea actualizar.");
			}

			var tipo = (Data.TIPO_CUENTA ?? string.Empty).Trim().ToUpperInvariant();
			if (!TiposValidos.Contains(tipo))
			{
				return Error("Debe seleccionar un tipo de cuenta.");
			}

			if (string.IsNullOrWhiteSpace(Data.CUENTA_CONTABLE))
			{
				return Error("Debe seleccionar la cuenta contable.");
			}

			return null;
		}

		private static CResult Error(string mensaje)
		{
			return new CResult
			{
				Result = false,
				ErrorCode = -1,
				ErrorMessage = mensaje,
			};
		}
	}
}
