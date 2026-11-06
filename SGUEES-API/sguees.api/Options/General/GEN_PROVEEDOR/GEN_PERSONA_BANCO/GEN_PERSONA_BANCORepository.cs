using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PERSONA_BANCORepository : BaseRepository<GEN_PERSONA_BANCOTable>, IGEN_PERSONA_BANCORepository
	{
		public GEN_PERSONA_BANCORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var corrEmpresa = GetParamInt(xWhere, "CORR_EMPRESA");
				var corrPersona = GetParamLong(xWhere, "CORR_PERSONA");
				var sql = @"
SELECT
	A.CORR_EMPRESA,
	A.CORR_PERSONA,
	A.CORR_PERSONA_BANCO,
	A.CORR_BANCO,
	ISNULL(B.NOMBRE_BANCO, N'') AS NOMBRE_BANCO,
	A.CUENTA_BANCARIA,
	A.USUARIO_CREA,
	A.FECHA_CREA,
	A.ESTACION_CREA,
	A.USUARIO_ACTU,
	A.FECHA_ACTU,
	A.ESTACION_ACTU
FROM dbo.GEN_PERSONA_BANCO A
LEFT JOIN dbo.GEN_BANCO B
	ON B.CORR_EMPRESA = A.CORR_EMPRESA
	AND B.CORR_BANCO = A.CORR_BANCO
WHERE A.CORR_EMPRESA = @CORR_EMPRESA
  AND A.CORR_PERSONA = @CORR_PERSONA
ORDER BY A.CORR_PERSONA_BANCO;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var response = new List<GEN_PERSONA_BANCOView>().FromDataReader(reader).ToList();
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
				objResultado.ErrorMessage = NormalizeDbError(e.Message);
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
				var corrEmpresa = GetParamInt(xWhere, "CORR_EMPRESA");
				var corrPersona = GetParamLong(xWhere, "CORR_PERSONA");
				var corrPersonaBanco = GetParamInt(xWhere, "CORR_PERSONA_BANCO");
				var sql = @"
SELECT
	A.CORR_EMPRESA,
	A.CORR_PERSONA,
	A.CORR_PERSONA_BANCO,
	A.CORR_BANCO,
	ISNULL(B.NOMBRE_BANCO, N'') AS NOMBRE_BANCO,
	A.CUENTA_BANCARIA,
	A.USUARIO_CREA,
	A.FECHA_CREA,
	A.ESTACION_CREA,
	A.USUARIO_ACTU,
	A.FECHA_ACTU,
	A.ESTACION_ACTU
FROM dbo.GEN_PERSONA_BANCO A
LEFT JOIN dbo.GEN_BANCO B
	ON B.CORR_EMPRESA = A.CORR_EMPRESA
	AND B.CORR_BANCO = A.CORR_BANCO
WHERE A.CORR_EMPRESA = @CORR_EMPRESA
  AND A.CORR_PERSONA = @CORR_PERSONA
  AND A.CORR_PERSONA_BANCO = @CORR_PERSONA_BANCO;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					new() { ParameterName = "@CORR_PERSONA_BANCO", Value = corrPersonaBanco, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
				var response = new List<GEN_PERSONA_BANCOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = response != null;
				objResultado.RowsAffected = response != null ? 1 : 0;
				objResultado.ErrorCode = response != null ? 0 : 30000;
				if (response == null)
				{
					objResultado.ErrorMessage = "Cuenta bancaria no encontrada.";
				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = NormalizeDbError(e.Message);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<int> NextCorrAsync(int corrEmpresa, long corrPersona)
		{
			try
			{
				var sql = @"
SELECT ISNULL(MAX(CORR_PERSONA_BANCO), 0) + 1
FROM dbo.GEN_PERSONA_BANCO WITH (UPDLOCK, HOLDLOCK)
WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_PERSONA = @CORR_PERSONA;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
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

		public async Task<CResult> CreateAsync(GEN_PERSONA_BANCOTable Data)
		{
			CResult objResultado = new();
			try
			{
				var sql = @"
INSERT INTO dbo.GEN_PERSONA_BANCO
(
	CORR_EMPRESA, CORR_PERSONA, CORR_PERSONA_BANCO,
	CORR_BANCO, CUENTA_BANCARIA,
	USUARIO_CREA, FECHA_CREA, ESTACION_CREA,
	USUARIO_ACTU, FECHA_ACTU, ESTACION_ACTU
)
VALUES
(
	@CORR_EMPRESA, @CORR_PERSONA, @CORR_PERSONA_BANCO,
	@CORR_BANCO, @CUENTA_BANCARIA,
	@USUARIO_CREA, @FECHA_CREA, @ESTACION_CREA,
	@USUARIO_ACTU, @FECHA_ACTU, @ESTACION_ACTU
);";

				var p = BuildWriteParameters(Data);
				await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);

				objResultado.Data = ToView(Data);
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
				return objResultado;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = NormalizeDbError(e.Message);
				return objResultado;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		public async Task<CResult> UpdateAsync(GEN_PERSONA_BANCOTable Data)
		{
			CResult objResultado = new();
			try
			{
				var sql = @"
UPDATE dbo.GEN_PERSONA_BANCO SET
	CORR_BANCO = @CORR_BANCO,
	CUENTA_BANCARIA = @CUENTA_BANCARIA,
	USUARIO_ACTU = @USUARIO_ACTU,
	FECHA_ACTU = @FECHA_ACTU,
	ESTACION_ACTU = @ESTACION_ACTU
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_PERSONA = @CORR_PERSONA
  AND CORR_PERSONA_BANCO = @CORR_PERSONA_BANCO;";

				var p = BuildWriteParameters(Data);
				await objData.ExecCmd(System.Data.CommandType.Text, sql, false, p);

				objResultado.Data = ToView(Data);
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0;
				return objResultado;
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = NormalizeDbError(e.Message);
				return objResultado;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		public async Task<CResult> DeleteAsync(GEN_PERSONA_BANCOTable Data)
		{
			CResult objResultado = new();
			try
			{
				var sql = @"
DELETE FROM dbo.GEN_PERSONA_BANCO
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_PERSONA = @CORR_PERSONA
  AND CORR_PERSONA_BANCO = @CORR_PERSONA_BANCO;";

				var p = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA", Value = Data.CORR_PERSONA, DbType = System.Data.DbType.Int64 },
					new() { ParameterName = "@CORR_PERSONA_BANCO", Value = Data.CORR_PERSONA_BANCO, DbType = System.Data.DbType.Int32 },
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
				objResultado.ErrorMessage = NormalizeDbError(e.Message);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private static GEN_PERSONA_BANCOView ToView(GEN_PERSONA_BANCOTable Data) => new()
		{
			CORR_EMPRESA = Data.CORR_EMPRESA,
			CORR_PERSONA = Data.CORR_PERSONA,
			CORR_PERSONA_BANCO = Data.CORR_PERSONA_BANCO,
			CORR_BANCO = Data.CORR_BANCO,
			NOMBRE_BANCO = string.Empty,
			CUENTA_BANCARIA = Data.CUENTA_BANCARIA ?? string.Empty,
			USUARIO_CREA = Data.USUARIO_CREA,
			FECHA_CREA = Data.FECHA_CREA,
			ESTACION_CREA = Data.ESTACION_CREA,
			USUARIO_ACTU = Data.USUARIO_ACTU,
			FECHA_ACTU = Data.FECHA_ACTU,
			ESTACION_ACTU = Data.ESTACION_ACTU,
		};

		private static List<CParameter> BuildWriteParameters(GEN_PERSONA_BANCOTable Data) =>
			new()
			{
				new() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_PERSONA", Value = Data.CORR_PERSONA, DbType = System.Data.DbType.Int64 },
				new() { ParameterName = "@CORR_PERSONA_BANCO", Value = Data.CORR_PERSONA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CORR_BANCO", Value = Data.CORR_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "@CUENTA_BANCARIA", Value = Data.CUENTA_BANCARIA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@USUARIO_CREA", Value = Data.USUARIO_CREA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "@ESTACION_CREA", Value = Data.ESTACION_CREA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@USUARIO_ACTU", Value = Data.USUARIO_ACTU ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "@FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "@ESTACION_ACTU", Value = Data.ESTACION_ACTU ?? string.Empty, DbType = System.Data.DbType.String },
			};

		private static int GetParamInt(List<CParameter> xWhere, string name)
		{
			var p = xWhere?.FirstOrDefault(x =>
				string.Equals(x.ParameterName?.TrimStart('@'), name, System.StringComparison.OrdinalIgnoreCase));
			return p?.Value == null ? 0 : System.Convert.ToInt32(p.Value);
		}

		private static long GetParamLong(List<CParameter> xWhere, string name)
		{
			var p = xWhere?.FirstOrDefault(x =>
				string.Equals(x.ParameterName?.TrimStart('@'), name, System.StringComparison.OrdinalIgnoreCase));
			return p?.Value == null ? 0L : System.Convert.ToInt64(p.Value);
		}

		private static string NormalizeDbError(string message)
		{
			var msg = message ?? string.Empty;
			if (msg.IndexOf("Invalid object name", System.StringComparison.OrdinalIgnoreCase) >= 0
				|| msg.IndexOf("no existe", System.StringComparison.OrdinalIgnoreCase) >= 0)
			{
				return "La tabla GEN_PERSONA_BANCO no existe en la base de datos. Ejecute DEPLOY_GEN_PERSONA_BANCO_TABLA.sql.";
			}
			if (msg.IndexOf("FOREIGN KEY", System.StringComparison.OrdinalIgnoreCase) >= 0
				|| msg.IndexOf("REFERENCE constraint", System.StringComparison.OrdinalIgnoreCase) >= 0)
			{
				return "No se pudo guardar la cuenta: el banco seleccionado no es válido para la empresa.";
			}
			return msg.Length > 280 ? msg.Substring(0, 280) : msg;
		}
	}
}
