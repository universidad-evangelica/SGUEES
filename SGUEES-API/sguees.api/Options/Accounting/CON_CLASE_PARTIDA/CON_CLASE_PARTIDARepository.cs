using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_CLASE_PARTIDARepository : BaseRepository<CON_CLASE_PARTIDATable>, ICON_CLASE_PARTIDARepository
	{
		private const string _TableName = "CON_CLASE_PARTIDA";

		public CON_CLASE_PARTIDARepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_CLASE_PARTIDAView>().FromDataReader(reader).ToList();
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
				var response = new List<CON_CLASE_PARTIDAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NOMBRE_CLASE_PARTIDA",Value=Data.NOMBRE_CLASE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_CORTO_CLASE",Value=Data.NOMBRE_CORTO_CLASE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_LINEA_AUMENTA",Value=Data.CORR_LINEA_AUMENTA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_LINEA_DISMINUYE",Value=Data.CORR_LINEA_DISMINUYE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ACEPTA_MODIFICACION",Value=Data.ACEPTA_MODIFICACION,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PARTIDA_CIERRE",Value=Data.PARTIDA_CIERRE,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NOMBRE_REPORTE",Value=Data.NOMBRE_REPORTE,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "CORR_CLASE_PARTIDA", pWhere);
				var response = new List<CON_CLASE_PARTIDAView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_CLASE_PARTIDA",Value=Data.NOMBRE_CLASE_PARTIDA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_CORTO_CLASE",Value=Data.NOMBRE_CORTO_CLASE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_LINEA_AUMENTA",Value=Data.CORR_LINEA_AUMENTA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_LINEA_DISMINUYE",Value=Data.CORR_LINEA_DISMINUYE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ACEPTA_MODIFICACION",Value=Data.ACEPTA_MODIFICACION,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PARTIDA_CIERRE",Value=Data.PARTIDA_CIERRE,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NOMBRE_REPORTE",Value=Data.NOMBRE_REPORTE,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_CLASE_PARTIDAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
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
