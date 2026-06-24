using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_CATALOGO_CUENTARepository : BaseRepository<CON_CATALOGO_CUENTATable>, ICON_CATALOGO_CUENTARepository
	{
		private const string _TableName = "CON_CATALOGO_CUENTA";

		public CON_CATALOGO_CUENTARepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<CON_CATALOGO_CUENTAView>().FromDataReader(reader).ToList();
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
				var response = new List<CON_CATALOGO_CUENTAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_CUENTA",Value=Data.NOMBRE_CUENTA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ES_DEBE",Value=Data.ES_DEBE,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ES_HABER",Value=Data.ES_HABER,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ES_DETALLE",Value=Data.ES_DETALLE,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NIVEL",Value=Data.NIVEL,DbType=System.Data.DbType.Int16},
					new CParameter() {ParameterName="CUENTA_MAYOR",Value=Data.CUENTA_MAYOR,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_RUBRO",Value=Data.CODIGO_RUBRO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NO_HABILITADA",Value=Data.NO_HABILITADA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="CLASE_RUBRO",Value=Data.CLASE_RUBRO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ES_LIQUIDADORA",Value=Data.ES_LIQUIDADORA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="CLASE_VALUACION",Value=Data.CLASE_VALUACION,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "", pWhere);
				var response = new List<CON_CATALOGO_CUENTAView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_CUENTA",Value=Data.NOMBRE_CUENTA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ES_DEBE",Value=Data.ES_DEBE,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ES_HABER",Value=Data.ES_HABER,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ES_DETALLE",Value=Data.ES_DETALLE,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NO_HABILITADA",Value=Data.NO_HABILITADA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="CLASE_RUBRO",Value=Data.CLASE_RUBRO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ES_LIQUIDADORA",Value=Data.ES_LIQUIDADORA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="CLASE_VALUACION",Value=Data.CLASE_VALUACION,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<CON_CATALOGO_CUENTAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = 0; objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.CodeHelper = 0; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; objResultado.ErrorSource += $"[{e.Source}]"; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> ImportarExcelAsync(CON_CATALOGO_CUENTA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				if (Data.Rows == null || Data.Rows.Count == 0)
				{
					objResultado.Data = 0;
					objResultado.Result = true;
					objResultado.RowsAffected = 0;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = "";
					return objResultado;
				}

				int importadas = 0;
				var errores = new System.Collections.Generic.List<string>();
				var rows = Data.Rows
					.Where(r => !string.IsNullOrWhiteSpace(r.CUENTA_CONTABLE))
					.OrderBy(r => r.NIVEL <= 0 ? 999 : r.NIVEL)
					.ThenBy(r => r.CUENTA_CONTABLE)
					.ToList();

				foreach (var row in rows)
				{
					var cuenta = (row.CUENTA_CONTABLE ?? "").Trim().TrimEnd('0');
					if (string.IsNullOrWhiteSpace(cuenta)) cuenta = "0";
					var rubro = string.IsNullOrWhiteSpace(row.CODIGO_RUBRO)
						? cuenta.Substring(0, 1)
						: row.CODIGO_RUBRO.Trim();

					var entity = new CON_CATALOGO_CUENTATable
					{
						CORR_EMPRESA = Data.CORR_EMPRESA,
						CUENTA_CONTABLE = cuenta,
						NOMBRE_CUENTA = (row.NOMBRE_CUENTA ?? "").Trim(),
						ES_DEBE = row.ES_DEBE,
						ES_HABER = row.ES_HABER,
						ES_DETALLE = row.ES_DETALLE,
						NIVEL = row.NIVEL > 0 ? row.NIVEL : 1,
						CUENTA_MAYOR = (row.CUENTA_MAYOR ?? "").Trim(),
						CODIGO_RUBRO = rubro,
						NO_HABILITADA = row.NO_HABILITADA,
						CLASE_RUBRO = string.IsNullOrWhiteSpace(row.CLASE_RUBRO) ? "AC" : row.CLASE_RUBRO.Trim(),
						ES_LIQUIDADORA = row.ES_LIQUIDADORA,
						CLASE_VALUACION = (row.CLASE_VALUACION ?? "").Trim(),
					};

					var pExists = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CUENTA_CONTABLE", Value = cuenta, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "CODIGO_RUBRO", Value = "", DbType = System.Data.DbType.String },
					};
					var existing = await GetAsync(pExists);
					var result = existing.Result && existing.Data != null
						? await UpdateAsync(entity, vLOGIN_SISTEMA, vESTACION)
						: await CreateAsync(entity, vLOGIN_SISTEMA, vESTACION);

					if (result.Result)
					{
						importadas++;
					}
					else if (errores.Count < 10)
					{
						errores.Add($"{cuenta}: {result.ErrorMessage}");
					}
				}

				objResultado.Data = importadas;
				objResultado.Result = errores.Count == 0;
				objResultado.RowsAffected = importadas;
				objResultado.ErrorCode = errores.Count == 0 ? 0 : -1;
				objResultado.ErrorMessage = errores.Count == 0
					? ""
					: $"Importadas {importadas}. Errores: {string.Join(" | ", errores)}";
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
