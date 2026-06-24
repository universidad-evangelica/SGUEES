using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_PERIODO_CONTABLERepository : BaseRepository<CON_PERIODO_CONTABLETable>, ICON_PERIODO_CONTABLERepository
	{
		private const string _TableName = "CON_PERIODO_CONTABLE";

		public CON_PERIODO_CONTABLERepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_PERIODO_CONTABLEView>().FromDataReader(reader).ToList();
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
				var response = new List<CON_PERIODO_CONTABLEView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ESTADO_PERIODO_CON",Value=Data.ESTADO_PERIODO_CON,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_BAN",Value=Data.ESTADO_PERIODO_BAN,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_VEN",Value=Data.ESTADO_PERIODO_VEN,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_ACT",Value=Data.ESTADO_PERIODO_ACT,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_INV",Value=Data.ESTADO_PERIODO_INV,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_PLA",Value=Data.ESTADO_PERIODO_PLA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_COM",Value=Data.ESTADO_PERIODO_COM,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "", pWhere);
				var response = new List<CON_PERIODO_CONTABLEView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="ESTADO_PERIODO_CON",Value=Data.ESTADO_PERIODO_CON,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_BAN",Value=Data.ESTADO_PERIODO_BAN,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_VEN",Value=Data.ESTADO_PERIODO_VEN,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_ACT",Value=Data.ESTADO_PERIODO_ACT,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_INV",Value=Data.ESTADO_PERIODO_INV,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_PLA",Value=Data.ESTADO_PERIODO_PLA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTADO_PERIODO_COM",Value=Data.ESTADO_PERIODO_COM,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CIERRE_CON",Value=Data.FECHA_CIERRE_CON,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_CIERRE_BAN",Value=Data.FECHA_CIERRE_BAN,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_CIERRE_VEN",Value=Data.FECHA_CIERRE_VEN,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_CIERRE_ACT",Value=Data.FECHA_CIERRE_ACT,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_CIERRE_INV",Value=Data.FECHA_CIERRE_INV,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_CIERRE_PLA",Value=Data.FECHA_CIERRE_PLA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_CIERRE_COM",Value=Data.FECHA_CIERRE_COM,DbType=System.Data.DbType.DateTime},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_PERIODO_CONTABLEView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="MES_PERIODO",Value=Data.MES_PERIODO,DbType=System.Data.DbType.Int32},
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GenerarCierreAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecPeriodoOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_CON_PERIODO_CIERRE");
		}

		public async Task<CResult> GenerarAperturaAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await ExecPeriodoOperacionAsync(Data, vLOGIN_SISTEMA, vESTACION, "PRAL_GENE_CON_PERIODO_APERTURA");
		}

		private async Task<CResult> ExecPeriodoOperacionAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION, string spName)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@TIPO_PERIODO", Value = Data.TIPO_PERIODO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Decimal, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

				// Capturamos los parámetros de salida AHORA, antes de que GetDataReader recree objCommand.
				var vNumeroError = (decimal)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
				var vMensajeError = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
				var vFilasAfectadas = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;

				if (vNumeroError == 0)
				{
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
					};
					var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
					var response = new List<CON_PERIODO_CONTABLEView>().FromDataReader(readerGet).FirstOrDefault();
					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = vFilasAfectadas;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = (int)vNumeroError;
					objResultado.ErrorMessage = vMensajeError;
					objResultado.ErrorSource = "C" + _TableName + ".Gene(" + spName + ")";
				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}
	}
}
