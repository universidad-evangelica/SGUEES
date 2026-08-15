using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_DOCUMENTOService : IBAN_DOCUMENTOService
	{
		private readonly IBAN_DOCUMENTORepository _repo;

		public BAN_DOCUMENTOService(IBAN_DOCUMENTORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(BAN_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "MUESTRA_CHEQUES", Value = xWhere.MUESTRA_CHEQUES.HasValue ? xWhere.MUESTRA_CHEQUES.Value : System.DBNull.Value, DbType = System.Data.DbType.Boolean },
				new() { ParameterName = "ESTADO_DOCUMENTO", Value = string.IsNullOrWhiteSpace(xWhere.ESTADO_DOCUMENTO) ? string.Empty : xWhere.ESTADO_DOCUMENTO.Trim(), DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "EXCLUIR_ANULADOS", Value = xWhere.EXCLUIR_ANULADOS == true, DbType = System.Data.DbType.Boolean },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> AplicarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.AplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> AnularAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.AnularAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ImprimirChequeAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.ImprimirChequeAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GetChequeImprimirDatosAsync(BAN_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetChequeImprimirDatosAsync(p);
		}

		public async Task<CResult> GetAllContabilizarAsync(BAN_DOCUMENTOParam xWhere)
		{
			xWhere.CORR_DOCUMENTO = 0;
			xWhere.EXCLUIR_ANULADOS = true;
			xWhere.ESTADO_DOCUMENTO = string.Empty;
			xWhere.MUESTRA_CHEQUES = null;

			var result = await GetAllAsync(xWhere);
			if (!result.Result || result.Data == null)
			{
				return result;
			}

			var rows = (result.Data as List<BAN_DOCUMENTOView>) ?? new List<BAN_DOCUMENTOView>();
			var filtro = xWhere.FILTRO_ESTA_CONTABILIZADO ?? -1;
			var baseRows = rows.Where(d => d.ESTADO_DOCUMENTO != "AN");

			List<BAN_DOCUMENTOView> lista;
			if (filtro == 0)
			{
				lista = baseRows
					.Where(d => (d.ESTADO_DOCUMENTO == "AP" || d.ESTADO_DOCUMENTO == "IM") && !d.ESTA_CONTABILIZADO)
					.ToList();
			}
			else if (filtro == 1)
			{
				lista = baseRows.Where(d => d.ESTA_CONTABILIZADO).ToList();
			}
			else
			{
				lista = baseRows
					.Where(d => d.ESTA_CONTABILIZADO || d.ESTADO_DOCUMENTO == "AP" || d.ESTADO_DOCUMENTO == "IM")
					.ToList();
			}
			result.Data = lista;
			result.RowsAffected = lista.Count;
			return result;
		}

		public async Task<CResult> ContabilizarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.ContabilizarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DesContabilizarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DesContabilizarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
