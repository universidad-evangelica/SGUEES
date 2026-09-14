using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	// Qué hace: acceso a datos del catálogo CON_CENTRO_COSTO_NIVEL.
	// Cómo lo hace: Get/GetAll sobre la vista; Insert/Update/Delete sobre la tabla (corr. auto).
	public class CON_CENTRO_COSTO_NIVELRepository : BaseRepository<CON_CENTRO_COSTO_NIVELTable>, ICON_CENTRO_COSTO_NIVELRepository
	{
		private const string _TableName = "CON_CENTRO_COSTO_NIVEL";

		public CON_CENTRO_COSTO_NIVELRepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_CENTRO_COSTO_NIVELView>().FromDataReader(reader)
					.OrderBy(x => x.NIVEL ?? short.MaxValue)
					.ThenBy(x => x.CORR_CENTRO_COSTO_NIVEL)
					.ToList();
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
				var response = new List<CON_CENTRO_COSTO_NIVELView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_NIVEL",Value=Data.CORR_CENTRO_COSTO_NIVEL,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NOMBRE_NIVEL",Value=Data.NOMBRE_NIVEL ?? "",DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NIVEL",Value=Data.NIVEL,DbType=System.Data.DbType.Int16},
					new CParameter() {ParameterName="USUARIO_CREA",Value=vLOGIN_SISTEMA ?? "",DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA",Value=vESTACION ?? "",DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA",Value=System.DateTime.Now,DbType=System.Data.DbType.DateTime},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "CORR_CENTRO_COSTO_NIVEL", pWhere);
				var response = new List<CON_CENTRO_COSTO_NIVELView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				// Qué hace: actualiza solo el nombre; NIVEL no se modifica (autoincremental).
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_NIVEL",Value=Data.NOMBRE_NIVEL ?? "",DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=vLOGIN_SISTEMA ?? "",DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=vESTACION ?? "",DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=System.DateTime.Now,DbType=System.Data.DbType.DateTime},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_NIVEL",Value=Data.CORR_CENTRO_COSTO_NIVEL,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_CENTRO_COSTO_NIVELView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_NIVEL",Value=Data.CORR_CENTRO_COSTO_NIVEL,DbType=System.Data.DbType.Int32},
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		// Qué hace: calcula el siguiente número de nivel para la empresa (1, 2, 3...).
		// Cómo lo hace: MAX(NIVEL)+1; si no hay registros retorna 1.
		public async Task<short> GetNextNivelAsync(int corrEmpresa)
		{
			if (corrEmpresa <= 0)
			{
				return 1;
			}

			const string sql = @"SELECT CAST(ISNULL(MAX(NIVEL), 0) + 1 AS SMALLINT) AS NEXT_NIVEL
				FROM CON_CENTRO_COSTO_NIVEL
				WHERE CORR_EMPRESA = @CORR_EMPRESA";

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				});

				short next = 1;
				if (reader.Read() && reader["NEXT_NIVEL"] != System.DBNull.Value)
				{
					next = System.Convert.ToInt16(reader["NEXT_NIVEL"]);
				}
				reader.Close();
				return next;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		// Qué hace: indica si ya existe otro nivel con el mismo número en la empresa.
		// Cómo lo hace: consulta V_CON_CENTRO_COSTO_NIVEL excluyendo el correlativo indicado.
		public async Task<bool> ExistsNivelAsync(int corrEmpresa, short nivel, int excludeCorr)
		{
			if (corrEmpresa <= 0)
			{
				return false;
			}

			const string sql = @"SELECT TOP 1 1 AS FOUND
				FROM V_CON_CENTRO_COSTO_NIVEL
				WHERE CORR_EMPRESA = @CORR_EMPRESA
				AND NIVEL = @NIVEL
				AND (@EXCLUDE_CORR <= 0 OR CORR_CENTRO_COSTO_NIVEL <> @EXCLUDE_CORR)";

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "NIVEL", Value = nivel, DbType = System.Data.DbType.Int16 },
					new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorr, DbType = System.Data.DbType.Int32 },
				});

				var exists = reader.Read();
				reader.Close();
				return exists;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		// Qué hace: indica si ya existe otro nivel con el mismo nombre en la empresa.
		// Cómo lo hace: compara NOMBRE_NIVEL trim/upper y excluye el correlativo indicado.
		public async Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr)
		{
			if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(nombre))
			{
				return false;
			}

			const string sql = @"SELECT TOP 1 1 AS FOUND
				FROM V_CON_CENTRO_COSTO_NIVEL
				WHERE CORR_EMPRESA = @CORR_EMPRESA
				AND UPPER(LTRIM(RTRIM(NOMBRE_NIVEL))) = UPPER(LTRIM(RTRIM(@NOMBRE)))
				AND (@EXCLUDE_CORR <= 0 OR CORR_CENTRO_COSTO_NIVEL <> @EXCLUDE_CORR)";

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "NOMBRE", Value = nombre.Trim(), DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorr, DbType = System.Data.DbType.Int32 },
				});

				var exists = reader.Read();
				reader.Close();
				return exists;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}
	}
}
