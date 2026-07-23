using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_LINEA_TRABAJO_CONCILIACIONRepository : BaseRepository<BAN_LINEA_TRABAJO_CONCILIACIONTable>, IBAN_LINEA_TRABAJO_CONCILIACIONRepository
	{
		private const string _TableName = "BAN_LINEA_TRABAJO_CONCILIACION";
		private const string _ViewName = "V_BAN_LINEA_TRABAJO_CONCILIACION";
		private const string _CampoPk = "CORR_LINEA";
		private const string _CampoEstado = "ESTADO_LINEA";
		private const bool _UsaEmpresa = true;

		public BAN_LINEA_TRABAJO_CONCILIACIONRepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<BAN_LINEA_TRABAJO_CONCILIACIONView>().FromDataReader(reader).ToList();
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
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<BAN_LINEA_TRABAJO_CONCILIACIONView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_LINEA",Value=Data.CORR_LINEA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NOMBRE_LINEA_TRABAJO",Value=Data.NOMBRE_LINEA_TRABAJO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="AUMENTA_DISMINUYE",Value=Data.AUMENTA_DISMINUYE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ESTADO_LINEA",Value=Data.ESTADO_LINEA ?? true,DbType=System.Data.DbType.Boolean},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "CORR_LINEA", pWhere);
				var response = new List<BAN_LINEA_TRABAJO_CONCILIACIONView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_LINEA ?? 0;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_LINEA_TRABAJO",Value=Data.NOMBRE_LINEA_TRABAJO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="AUMENTA_DISMINUYE",Value=Data.AUMENTA_DISMINUYE,DbType=System.Data.DbType.Int32},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_LINEA",Value=Data.CORR_LINEA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<BAN_LINEA_TRABAJO_CONCILIACIONView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_LINEA",Value=Data.CORR_LINEA,DbType=System.Data.DbType.Int32},
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> ActivarInactivarAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_LINEA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_LINEA", Value = Data.CORR_LINEA, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					var response = new List<BAN_LINEA_TRABAJO_CONCILIACIONView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_LINEA ?? Data.CORR_LINEA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_LINEA;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = Data.CORR_LINEA;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}
	}
}
