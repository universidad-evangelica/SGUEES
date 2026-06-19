using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_PARTIDAService : ICON_PARTIDAService
	{
		private readonly ICON_PARTIDARepository _repo;
		public CON_PARTIDAService(ICON_PARTIDARepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_PARTIDAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=xWhere.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA",Value=xWhere.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
				new CParameter() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_PARTIDAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=xWhere.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA",Value=xWhere.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GetAllAplicarAsync(CON_PARTIDAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "OPCION_CONSULTA", Value = xWhere.OPCION_CONSULTA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAplicarAsync(p);
		}

		public async Task<CResult> AplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.AplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DesAplicarAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DesAplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> AnularAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.AnularAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> CrearPartidaModeloAsync(CON_PARTIDAParam Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CrearPartidaModeloAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> CrearModeloAsync(CON_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CrearModeloAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ImportarExcelAsync(CON_PARTIDA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.ImportarExcelAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GetAllDetaDocAsync(CON_PARTIDAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=xWhere.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA",Value=xWhere.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllDetaDocAsync(p);
		}
	}
}
