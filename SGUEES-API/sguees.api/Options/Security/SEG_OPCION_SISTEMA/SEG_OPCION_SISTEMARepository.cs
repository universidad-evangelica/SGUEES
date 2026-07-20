using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class SEG_OPCION_SISTEMARepository : BaseRepository<SEG_OPCION_SISTEMATable>, ISEG_OPCION_SISTEMARepository
	{
		private const string _TableName = "SEG_OPCION_SISTEMA";
		private const string _SpMtto = "PRAL_MTTO_SEG_OPCION_SISTEMA";

		public SEG_OPCION_SISTEMARepository(IConfiguration config) :
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
				var response = new List<SEG_OPCION_SISTEMAView>().FromDataReader(reader).ToList();

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
				var response = new List<SEG_OPCION_SISTEMAView>().FromDataReader(reader).FirstOrDefault();

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

		public Task<CResult> CreateAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecMttoAsync(Data, UpdateType.Add, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecMttoAsync(Data, UpdateType.Update, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> ExecMttoAsync(Data, UpdateType.Delete, vLOGIN_SISTEMA, vESTACION);

		private async Task<CResult> ExecMttoAsync(
			SEG_OPCION_SISTEMATable Data,
			UpdateType tipo,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = BuildMttoParameters(Data, (int)tipo, vLOGIN_SISTEMA, vESTACION);
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, _SpMtto, true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value != 0)
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = 0;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + tipo + ")";
					return objResultado;
				}

				if (tipo == UpdateType.Delete)
				{
					objResultado.Data = null;
					objResultado.Result = true;
					objResultado.RowsAffected = (int)objData.objCommand.Parameters["@SYS_FILAS_AFECTADAS"].Value;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					objResultado.ErrorSource = "";
					return objResultado;
				}

				var codigo = (string)objData.objCommand.Parameters["@CODIGO_OPCION"].Value;
				if (string.IsNullOrWhiteSpace(codigo))
				{
					codigo = Data.CODIGO_OPCION;
				}

				var xWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CODIGO_OPCION", Value = codigo, DbType = System.Data.DbType.String },
				};

				var readerGet = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<SEG_OPCION_SISTEMAView>().FromDataReader(readerGet).FirstOrDefault();
				readerGet.Close();

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

		private static List<CParameter> BuildMttoParameters(
			SEG_OPCION_SISTEMATable Data,
			int tipoActualiza,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			var fechaCrea = ToSqlDateTime(Data.FECHA_CREA);
			var fechaActu = ToSqlDateTime(Data.FECHA_ACTU);

			return new List<CParameter>
			{
				new CParameter() { ParameterName = "@TIPO_ACTUALIZA", Value = tipoActualiza, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "@CODIGO_OPCION", Value = Data.CODIGO_OPCION, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 30 },
				new CParameter() { ParameterName = "@NOMBRE_OPCION", Value = Data.NOMBRE_OPCION, DbType = System.Data.DbType.String, Size = 100 },
				new CParameter() { ParameterName = "@URL_OPCION", Value = Data.URL_OPCION, DbType = System.Data.DbType.String, Size = 4000 },
				new CParameter() { ParameterName = "@IMAGEN_OPCION", Value = Data.IMAGEN_OPCION ?? string.Empty, DbType = System.Data.DbType.String, Size = 25 },
				new CParameter() { ParameterName = "@USUARIO_CREA", Value = Data.USUARIO_CREA ?? string.Empty, DbType = System.Data.DbType.String, Size = 30 },
				new CParameter() { ParameterName = "@FECHA_CREA", Value = fechaCrea, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "@ESTACION_CREA", Value = Data.ESTACION_CREA ?? string.Empty, DbType = System.Data.DbType.String, Size = 30 },
				new CParameter() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? string.Empty, DbType = System.Data.DbType.String, Size = 30 },
				new CParameter() { ParameterName = "@FECHA_ACTU", Value = fechaActu, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU ?? string.Empty, DbType = System.Data.DbType.String, Size = 30 },
				new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String, Size = 30 },
				new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String, Size = 50 },
				new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
			};
		}

		private static DateTime ToSqlDateTime(DateTime fecha)
		{
			return fecha.Year >= 1753 ? fecha : DateTime.Now;
		}
	}
}
