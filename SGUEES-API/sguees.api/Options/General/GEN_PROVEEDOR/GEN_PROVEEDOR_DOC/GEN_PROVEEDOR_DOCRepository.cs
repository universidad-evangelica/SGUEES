using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PROVEEDOR_DOCRepository : BaseRepository<GEN_PROVEEDOR_DOCTable>, IGEN_PROVEEDOR_DOCRepository
	{
		private const string _TableName = "GEN_PROVEEDOR_DOC";

		public GEN_PROVEEDOR_DOCRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_TableName, xWhere);
				var response = new List<GEN_PROVEEDOR_DOCView>().FromDataReader(reader).ToList();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
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
				var reader = await objData.GetDataReader(_TableName, xWhere);
				var response = new List<GEN_PROVEEDOR_DOCView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response != null ? 1 : 0;
				objResultado.ErrorCode = response != null ? 0 : 30000;
				if (response == null)
				{
					objResultado.ErrorMessage = "Documento no encontrado.";
				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<int> NextCorrDocumentoAsync(int corrEmpresa, int corrProveedor)
		{
			try
			{
				var sql = @"
SELECT ISNULL(MAX(CORR_DOCUMENTO), 0) + 1
FROM dbo.GEN_PROVEEDOR_DOC WITH (UPDLOCK, HOLDLOCK)
WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PROVEEDOR = @CORR_PROVEEDOR;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PROVEEDOR", Value = corrProveedor, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				int next = 1;
				if (reader.Read())
				{
					next = System.Convert.ToInt32(reader.GetValue(0));
				}
				reader.Close();
				return next;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		public async Task<CResult> CreateAsync(GEN_PROVEEDOR_DOCTable Data)
		{
			CResult objResultado = new();
			try
			{
				var sql = @"
INSERT INTO dbo.GEN_PROVEEDOR_DOC
(
	CORR_EMPRESA, CORR_PROVEEDOR, CORR_DOCUMENTO,
	URL_DOCUMENTO, NOMBRE_ARCHIVO,
	USUARIO_CREA, FECHA_CREA, ESTACION_CREA,
	USUARIO_ACTU, FECHA_ACTU, ESTACION_ACTU
)
VALUES
(
	@CORR_EMPRESA, @CORR_PROVEEDOR, @CORR_DOCUMENTO,
	@URL_DOCUMENTO, @NOMBRE_ARCHIVO,
	@USUARIO_CREA, @FECHA_CREA, @ESTACION_CREA,
	@USUARIO_ACTU, @FECHA_ACTU, @ESTACION_ACTU
);";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@URL_DOCUMENTO", Value = Data.URL_DOCUMENTO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@NOMBRE_ARCHIVO", Value = Data.NOMBRE_ARCHIVO ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@USUARIO_CREA", Value = Data.USUARIO_CREA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new() { ParameterName = "@ESTACION_CREA", Value = Data.ESTACION_CREA ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? string.Empty, DbType = System.Data.DbType.String },
					new() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
					new() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU ?? string.Empty, DbType = System.Data.DbType.String },
				};

				await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);

				var get = await GetAsync(new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
				});
				return get;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				return objResultado;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		public async Task<CResult> DeleteAsync(GEN_PROVEEDOR_DOCTable Data)
		{
			CResult objResultado = new();
			try
			{
				var sql = @"
DELETE FROM dbo.GEN_PROVEEDOR_DOC
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_PROVEEDOR = @CORR_PROVEEDOR
  AND CORR_DOCUMENTO = @CORR_DOCUMENTO;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PROVEEDOR", Value = Data.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
				};

				await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}
	}
}
