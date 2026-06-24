using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_PARTIDA_DETARepository : BaseRepository<CON_PARTIDA_DETATable>, ICON_PARTIDA_DETARepository
	{
		private const string _TableName = "CON_PARTIDA_DETA";

		public CON_PARTIDA_DETARepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_PARTIDA_DETAView>().FromDataReader(reader).ToList();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true;
				objResultado.RowsAffected = response.Count; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_PARTIDA_DETAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA",Value=Data.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA_DETA",Value=Data.CORR_PARTIDA_DETA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NOMBRE_TRAN",Value=Data.NOMBRE_TRAN,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="MONTO_CARGO",Value=Data.MONTO_CARGO,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_ABONO",Value=Data.MONTO_ABONO,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="ESTA_CONCILIA",Value=Data.ESTA_CONCILIA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="CORR_AUXILIAR",Value=Data.CORR_AUXILIAR,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MONTO_CARGO_FORANEA",Value=Data.MONTO_CARGO_FORANEA,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_ABONO_FORANEA",Value=Data.MONTO_ABONO_FORANEA,DbType=System.Data.DbType.Decimal},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "CORR_PARTIDA_DETA", pWhere);
				var response = new List<CON_PARTIDA_DETAView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NOMBRE_TRAN",Value=Data.NOMBRE_TRAN,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="MONTO_CARGO",Value=Data.MONTO_CARGO,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_ABONO",Value=Data.MONTO_ABONO,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="ESTA_CONCILIA",Value=Data.ESTA_CONCILIA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="CORR_AUXILIAR",Value=Data.CORR_AUXILIAR,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MONTO_CARGO_FORANEA",Value=Data.MONTO_CARGO_FORANEA,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_ABONO_FORANEA",Value=Data.MONTO_ABONO_FORANEA,DbType=System.Data.DbType.Decimal},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA",Value=Data.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA_DETA",Value=Data.CORR_PARTIDA_DETA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_PARTIDA_DETAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA_DETA",Value=Data.CORR_PARTIDA_DETA,DbType=System.Data.DbType.Int32},
				};
				if (Data.CORR_PARTIDA > 0)
				{
					pWhere.Add(new CParameter() { ParameterName = "CORR_PARTIDA", Value = Data.CORR_PARTIDA, DbType = System.Data.DbType.Int32 });
				}
				if (Data.CORR_CLASE_PARTIDA > 0)
				{
					pWhere.Add(new CParameter() { ParameterName = "CORR_CLASE_PARTIDA", Value = Data.CORR_CLASE_PARTIDA, DbType = System.Data.DbType.Int32 });
				}
				if (Data.ANIO_PERIODO > 0)
				{
					pWhere.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				}
				if (Data.MES_PERIODO > 0)
				{
					pWhere.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 });
				}
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}
	}
}
