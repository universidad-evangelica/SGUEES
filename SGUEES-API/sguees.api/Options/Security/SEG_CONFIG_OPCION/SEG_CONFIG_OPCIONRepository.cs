using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class SEG_CONFIG_OPCIONRepository : BaseRepository<SEG_CONFIG_OPCIONTable>, ISEG_CONFIG_OPCIONRepository
	{
		private const string _TableName = "SEG_CONFIG_OPCION";

		public SEG_CONFIG_OPCIONRepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SEG_CONFIG_OPCIONView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SEG_CONFIG_OPCIONView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CreateAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CODIGO_SISTEMA", Value = Data.CODIGO_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_MENU", Value = Data.CODIGO_MENU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_OPCION", Value = Data.CODIGO_OPCION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ORDEN_SISTEMA", Value = Data.ORDEN_SISTEMA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ORDEN_MENU", Value = Data.ORDEN_MENU, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ORDEN_OPCION", Value = Data.ORDEN_OPCION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				};

				var pWhere = new List<CParameter>();

				var reader = await objData.Insert(_TableName, p, "", pWhere);
				var response = new List<SEG_CONFIG_OPCIONView>().FromDataReader(reader).FirstOrDefault();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> UpdateAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "ORDEN_SISTEMA", Value = Data.ORDEN_SISTEMA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ORDEN_MENU", Value = Data.ORDEN_MENU, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ORDEN_OPCION", Value = Data.ORDEN_OPCION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CODIGO_SISTEMA", Value = Data.CODIGO_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_MENU", Value = Data.CODIGO_MENU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_OPCION", Value = Data.CODIGO_OPCION, DbType = System.Data.DbType.String },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SEG_CONFIG_OPCIONView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> DeleteAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CODIGO_SISTEMA", Value = Data.CODIGO_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_MENU", Value = Data.CODIGO_MENU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CODIGO_OPCION", Value = Data.CODIGO_OPCION, DbType = System.Data.DbType.String },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}
	}
}
