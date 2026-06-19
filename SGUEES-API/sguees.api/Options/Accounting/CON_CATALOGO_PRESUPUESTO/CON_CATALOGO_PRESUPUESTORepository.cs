using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_CATALOGO_PRESUPUESTORepository : BaseRepository<CON_CATALOGO_PRESUPUESTOTable>, ICON_CATALOGO_PRESUPUESTORepository
	{
		private const string _TableName = "CON_CATALOGO_PRESUPUESTO";

		public CON_CATALOGO_PRESUPUESTORepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_CATALOGO_PRESUPUESTOView>().FromDataReader(reader).ToList();
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
				var response = new List<CON_CATALOGO_PRESUPUESTOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(CON_CATALOGO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_1",Value=Data.MONTO_PRESUPUESTO_1,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_2",Value=Data.MONTO_PRESUPUESTO_2,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_3",Value=Data.MONTO_PRESUPUESTO_3,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_4",Value=Data.MONTO_PRESUPUESTO_4,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_5",Value=Data.MONTO_PRESUPUESTO_5,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_6",Value=Data.MONTO_PRESUPUESTO_6,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_7",Value=Data.MONTO_PRESUPUESTO_7,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_8",Value=Data.MONTO_PRESUPUESTO_8,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_9",Value=Data.MONTO_PRESUPUESTO_9,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_10",Value=Data.MONTO_PRESUPUESTO_10,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_11",Value=Data.MONTO_PRESUPUESTO_11,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_12",Value=Data.MONTO_PRESUPUESTO_12,DbType=System.Data.DbType.Decimal},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "", pWhere);
				var response = new List<CON_CATALOGO_PRESUPUESTOView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(CON_CATALOGO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_1",Value=Data.MONTO_PRESUPUESTO_1,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_2",Value=Data.MONTO_PRESUPUESTO_2,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_3",Value=Data.MONTO_PRESUPUESTO_3,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_4",Value=Data.MONTO_PRESUPUESTO_4,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_5",Value=Data.MONTO_PRESUPUESTO_5,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_6",Value=Data.MONTO_PRESUPUESTO_6,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_7",Value=Data.MONTO_PRESUPUESTO_7,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_8",Value=Data.MONTO_PRESUPUESTO_8,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_9",Value=Data.MONTO_PRESUPUESTO_9,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_10",Value=Data.MONTO_PRESUPUESTO_10,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_11",Value=Data.MONTO_PRESUPUESTO_11,DbType=System.Data.DbType.Decimal},
					new CParameter() {ParameterName="MONTO_PRESUPUESTO_12",Value=Data.MONTO_PRESUPUESTO_12,DbType=System.Data.DbType.Decimal},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_CATALOGO_PRESUPUESTOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(CON_CATALOGO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
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
