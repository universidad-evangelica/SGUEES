using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_TIPO_MOVI_BANCARIORepository : BaseRepository<BAN_TIPO_MOVI_BANCARIOTable>, IBAN_TIPO_MOVI_BANCARIORepository
	{
		private const string _TableName = "BAN_TIPO_MOVI_BANCARIO";

		public BAN_TIPO_MOVI_BANCARIORepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<BAN_TIPO_MOVI_BANCARIOView>().FromDataReader(reader).ToList();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true;
				objResultado.RowsAffected = response.Count; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<BAN_TIPO_MOVI_BANCARIOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_TIPO_MOVIMIENTO",Value=Data.CORR_TIPO_MOVIMIENTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NOMBRE_TIPO_MOVIMIENTO",Value=Data.NOMBRE_TIPO_MOVIMIENTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_TIPO_CORTO",Value=Data.NOMBRE_TIPO_CORTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_LINEA",Value=Data.CORR_LINEA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="USA_CHEQUE_PROPIO",Value=Data.USA_CHEQUE_PROPIO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="SUMA_RESTA",Value=Data.SUMA_RESTA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CLASE_MOVIMIENTO",Value=Data.CLASE_MOVIMIENTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_GASTO",Value=Data.CUENTA_CONTABLE_GASTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_REPORTE",Value=Data.NOMBRE_REPORTE,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "CORR_TIPO_MOVIMIENTO", pWhere);
				var response = new List<BAN_TIPO_MOVI_BANCARIOView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_TIPO_MOVIMIENTO ?? 0;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_TIPO_MOVIMIENTO",Value=Data.NOMBRE_TIPO_MOVIMIENTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_TIPO_CORTO",Value=Data.NOMBRE_TIPO_CORTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_LINEA",Value=Data.CORR_LINEA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=Data.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="USA_CHEQUE_PROPIO",Value=Data.USA_CHEQUE_PROPIO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="SUMA_RESTA",Value=Data.SUMA_RESTA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CLASE_MOVIMIENTO",Value=Data.CLASE_MOVIMIENTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE_GASTO",Value=Data.CUENTA_CONTABLE_GASTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_REPORTE",Value=Data.NOMBRE_REPORTE,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_TIPO_MOVIMIENTO",Value=Data.CORR_TIPO_MOVIMIENTO,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<BAN_TIPO_MOVI_BANCARIOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_TIPO_MOVIMIENTO",Value=Data.CORR_TIPO_MOVIMIENTO,DbType=System.Data.DbType.Int32},
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}
	}
}
