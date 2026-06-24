using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_PARTIDA_MODELORepository : BaseRepository<CON_PARTIDA_MODELOTable>, ICON_PARTIDA_MODELORepository
	{
		private const string _TableName = "CON_PARTIDA_MODELO";

		public CON_PARTIDA_MODELORepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_PARTIDA_MODELOView>().FromDataReader(reader).ToList();
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
				var response = new List<CON_PARTIDA_MODELOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA",Value=Data.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NUMERO_DOCUMENTO",Value=Data.NUMERO_DOCUMENTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_PARTIDA",Value=Data.NOMBRE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PARTIDA",Value=Data.ESTADO_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CLASE_PARTIDA",Value=Data.CLASE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_MONEDA",Value=Data.CORR_MONEDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FACTOR_CAMBIO",Value=Data.FACTOR_CAMBIO,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="OPERADOR",Value=Data.OPERADOR,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "CORR_PARTIDA", pWhere);
				var response = new List<CON_PARTIDA_MODELOView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NUMERO_DOCUMENTO",Value=Data.NUMERO_DOCUMENTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_PARTIDA",Value=Data.NOMBRE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PARTIDA",Value=Data.ESTADO_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CLASE_PARTIDA",Value=Data.CLASE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_MONEDA",Value=Data.CORR_MONEDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FACTOR_CAMBIO",Value=Data.FACTOR_CAMBIO,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="OPERADOR",Value=Data.OPERADOR,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA",Value=Data.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_PARTIDA_MODELOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_PARTIDA",Value=Data.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
				};
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
