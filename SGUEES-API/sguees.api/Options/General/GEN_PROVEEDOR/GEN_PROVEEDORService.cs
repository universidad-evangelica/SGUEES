using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PROVEEDORService : IGEN_PROVEEDORService
	{
		private readonly IGEN_PROVEEDORRepository _repo;

		public GEN_PROVEEDORService(IGEN_PROVEEDORRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			ApplyCreateDefaults(Data);
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		private static void ApplyCreateDefaults(GEN_PROVEEDORTable Data)
		{
			Data.CODIGO_PROVEEDOR ??= string.Empty;
			Data.TIPO_PERSONERIA ??= string.Empty;
			Data.NOMBRE_PROVEEDOR ??= string.Empty;
			Data.PRIMER_NOMBRE ??= string.Empty;
			Data.SEGUNDO_NOMBRE ??= string.Empty;
			Data.PRIMER_APELLIDO ??= string.Empty;
			Data.SEGUNDO_APELLIDO ??= string.Empty;
			Data.NOMBRE_COMERCIAL ??= string.Empty;
			Data.NUMERO_DIP ??= string.Empty;
			Data.NUMERO_NRC ??= string.Empty;
			Data.NUMERO_NIT ??= string.Empty;
			Data.DIRECCION_PROVEEDOR ??= string.Empty;
			Data.NOMBRE_CONTACTO ??= string.Empty;
			Data.TELEFONO_FIJO ??= string.Empty;
			Data.TELEFONO_MOVIL ??= string.Empty;
			Data.CORREO_ELECTRONICO_1 ??= string.Empty;
			Data.CORREO_ELECTRONICO_2 ??= string.Empty;
			Data.CUENTA_BANCARIA ??= string.Empty;
			Data.ESTADO_PROVEEDOR ??= "AC";
			Data.ESTADO_PROVEEDOR_WEB ??= "AC";
		}
	}
}
