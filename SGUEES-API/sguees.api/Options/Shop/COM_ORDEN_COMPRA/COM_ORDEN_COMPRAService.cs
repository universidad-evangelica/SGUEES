using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_ORDEN_COMPRAService : ICOM_ORDEN_COMPRAService
	{
		private readonly ICOM_ORDEN_COMPRARepository _repo;
		private readonly ICOM_REPORepository _repoRepo;
		private readonly ISEG_USUARIOService _repoUser;

		public COM_ORDEN_COMPRAService(
			ICOM_ORDEN_COMPRARepository repo,
			ICOM_REPORepository repoRepo,
			ISEG_USUARIOService repoUser)
		{
			_repo = repo;
			_repoRepo = repoRepo;
			_repoUser = repoUser;
		}

		public async Task<CResult> GetAllAsync(COM_ORDEN_COMPRAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = xWhere.LOGIN_SISTEMA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "@FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "@FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "@OPCION_CONSULTA", Value = xWhere.OPCION_CONSULTA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(COM_ORDEN_COMPRAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_ORDEN_COMPRA", Value = xWhere.CORR_ORDEN_COMPRA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (string.IsNullOrWhiteSpace(Data.ESTADO_ORDEN))
			{
				Data.ESTADO_ORDEN = "DI";
			}
			return _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> DeleteAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> AplicarAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.AplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> AnularAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.AnularAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> DesAplicarAsync(COM_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.DesAplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<Stream> GetPDFAsync(COM_ORDEN_COMPRAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = xWhere.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "NUMERO_ORDEN", Value = xWhere.NUMERO_ORDEN_COMPRA, DbType = System.Data.DbType.Int32 },
			};

			var vRespuesta = await _repo.GetOrdenCompraImpr(p);
			if (vRespuesta.Result)
			{
				return await _repoRepo.GetComCuadroComparativoOrdenCompraImprAsync(
					(List<COM_ORDEN_COMPRA_IMPRView>)vRespuesta.Data,
					_repoUser.GenerateRptToken("Admin"));
			}

			return null;
		}
	}
}
