using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class CON_CENTRO_COSTORepository: BaseRepository<CON_CENTRO_COSTOTable>, ICON_CENTRO_COSTORepository
	{
		private const string _TableName = "CON_CENTRO_COSTO";
		
		public CON_CENTRO_COSTORepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		// Qué hace: lista centros de costo de la empresa en orden jerárquico.
		// Cómo lo hace: lee V_CON_CENTRO_COSTO y ordena padre→hijas (nivel 1 + hijas, etc.).
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = OrdenarJerarquia(new List<CON_CENTRO_COSTOView>().FromDataReader(reader).ToList());
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
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
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<CON_CENTRO_COSTOView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> CreateAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="NOMBRE_CENTRO",Value=Data.NOMBRE_CENTRO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_CENTRO_COSTO",Value=Data.CODIGO_CENTRO_COSTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_MAYOR",Value=ToNullableFk(Data.CORR_CENTRO_COSTO_MAYOR),DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_NIVEL",Value=ToNullableFk(Data.CORR_CENTRO_COSTO_NIVEL),DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_TIPO_CENTRO_COSTO",Value=Data.CORR_TIPO_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ESTADO_CENTRO_COSTO",Value=Data.ESTADO_CENTRO_COSTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_UNIDAD_NEGOCIO",Value=Data.CORR_UNIDAD_NEGOCIO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_AREA_FUNCIONAL",Value=Data.CORR_AREA_FUNCIONAL,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CODIGO_TERMINACION",Value=Data.CODIGO_TERMINACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_EMPLEADO_JEFE",Value=Data.CORR_EMPLEADO_JEFE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLIENTE",Value=Data.CORR_CLIENTE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FECHA_INICIAL",Value=Data.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_FINAL",Value=Data.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Insert(_TableName,p,"CORR_CENTRO_COSTO",pWhere);
				var response = new List<CON_CENTRO_COSTOView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_CENTRO_COSTO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> UpdateAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NOMBRE_CENTRO",Value=Data.NOMBRE_CENTRO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_CENTRO_COSTO",Value=Data.CODIGO_CENTRO_COSTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_MAYOR",Value=ToNullableFk(Data.CORR_CENTRO_COSTO_MAYOR),DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO_NIVEL",Value=ToNullableFk(Data.CORR_CENTRO_COSTO_NIVEL),DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_TIPO_CENTRO_COSTO",Value=Data.CORR_TIPO_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ESTADO_CENTRO_COSTO",Value=Data.ESTADO_CENTRO_COSTO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_UNIDAD_NEGOCIO",Value=Data.CORR_UNIDAD_NEGOCIO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_AREA_FUNCIONAL",Value=Data.CORR_AREA_FUNCIONAL,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CODIGO_TERMINACION",Value=Data.CODIGO_TERMINACION,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_EMPLEADO_JEFE",Value=Data.CORR_EMPLEADO_JEFE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CLIENTE",Value=Data.CORR_CLIENTE,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="FECHA_INICIAL",Value=Data.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="FECHA_FINAL",Value=Data.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<CON_CENTRO_COSTOView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_CENTRO_COSTO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> DeleteAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_CENTRO_COSTO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}

		public async Task<CResult> ImportarExcelAsync(CON_CENTRO_COSTO_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION)
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

				int importados = 0;
				var errores = new System.Collections.Generic.List<string>();

				foreach (var row in Data.Rows.Where(r => !string.IsNullOrWhiteSpace(r.NOMBRE_CENTRO) || !string.IsNullOrWhiteSpace(r.CODIGO_CENTRO_COSTO)))
				{
					var entity = new CON_CENTRO_COSTOTable
					{
						CORR_EMPRESA = Data.CORR_EMPRESA,
						CORR_CENTRO_COSTO = row.CORR_CENTRO_COSTO,
						NOMBRE_CENTRO = (row.NOMBRE_CENTRO ?? "").Trim(),
						CUENTA_CONTABLE = (row.CUENTA_CONTABLE ?? "").Trim(),
						CODIGO_CENTRO_COSTO = (row.CODIGO_CENTRO_COSTO ?? "").Trim(),
						CORR_TIPO_CENTRO_COSTO = row.CORR_TIPO_CENTRO_COSTO > 0 ? row.CORR_TIPO_CENTRO_COSTO : 1,
						ESTADO_CENTRO_COSTO = string.IsNullOrWhiteSpace(row.ESTADO_CENTRO_COSTO) ? "AC" : row.ESTADO_CENTRO_COSTO.Trim(),
						CORR_UNIDAD_NEGOCIO = row.CORR_UNIDAD_NEGOCIO,
						CORR_AREA_FUNCIONAL = row.CORR_AREA_FUNCIONAL,
						CODIGO_TERMINACION = (row.CODIGO_TERMINACION ?? "").Trim(),
						CORR_EMPLEADO_JEFE = row.CORR_EMPLEADO_JEFE,
						CORR_CLIENTE = row.CORR_CLIENTE,
						FECHA_INICIAL = row.FECHA_INICIAL ?? System.DateTime.Today,
						FECHA_FINAL = row.FECHA_FINAL ?? new System.DateTime(9999, 12, 31),
					};

					CResult result;
					if (row.CORR_CENTRO_COSTO > 0)
					{
						var pExists = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_CENTRO_COSTO", Value = row.CORR_CENTRO_COSTO, DbType = System.Data.DbType.Int32 },
						};
						var existing = await GetAsync(pExists);
						result = existing.Result && existing.Data != null
							? await UpdateAsync(entity, vLOGIN_SISTEMA, vESTACION)
							: await CreateAsync(entity, vLOGIN_SISTEMA, vESTACION);
					}
					else
					{
						result = await CreateAsync(entity, vLOGIN_SISTEMA, vESTACION);
					}

					if (result.Result)
					{
						importados++;
					}
					else if (errores.Count < 10)
					{
						var key = string.IsNullOrWhiteSpace(entity.CODIGO_CENTRO_COSTO)
							? entity.NOMBRE_CENTRO
							: entity.CODIGO_CENTRO_COSTO;
						errores.Add($"{key}: {result.ErrorMessage}");
					}
				}

				objResultado.Data = importados;
				objResultado.Result = errores.Count == 0;
				objResultado.RowsAffected = importados;
				objResultado.ErrorCode = errores.Count == 0 ? 0 : -1;
				objResultado.ErrorMessage = errores.Count == 0
					? ""
					: $"Importados {importados}. Errores: {string.Join(" | ", errores)}";
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

		// Qué hace: convierte 0 a NULL para FKs opcionales (nivel / centro mayor).
		// Cómo lo hace: si el correlativo es <= 0 retorna DBNull; si no, el valor.
		private static object ToNullableFk(int value)
		{
			return value > 0 ? value : (object)System.DBNull.Value;
		}

		// Qué hace: ordena centros como en con-catalogo-cuenta-centro-costo (asignados/no asignados).
		// Cómo lo hace: ordena por CODIGO_CENTRO_COSTO (01 → 0101 → 010101…); si hay MAYOR, DFS padre→hijas.
		private static List<CON_CENTRO_COSTOView> OrdenarJerarquia(List<CON_CENTRO_COSTOView> items)
		{
			if (items == null || items.Count == 0)
			{
				return items ?? new List<CON_CENTRO_COSTOView>();
			}

			static string Codigo(CON_CENTRO_COSTOView x) => x.CODIGO_CENTRO_COSTO ?? string.Empty;

			var byCorr = items.ToDictionary(x => x.CORR_CENTRO_COSTO);
			var children = items
				.Where(x => x.CORR_CENTRO_COSTO_MAYOR > 0 && byCorr.ContainsKey(x.CORR_CENTRO_COSTO_MAYOR))
				.GroupBy(x => x.CORR_CENTRO_COSTO_MAYOR)
				.ToDictionary(
					g => g.Key,
					g => g.OrderBy(Codigo, System.StringComparer.OrdinalIgnoreCase).ThenBy(x => x.CORR_CENTRO_COSTO).ToList());

			var hasParents = children.Count > 0;
			if (!hasParents)
			{
				return items
					.OrderBy(Codigo, System.StringComparer.OrdinalIgnoreCase)
					.ThenBy(x => x.CORR_CENTRO_COSTO)
					.ToList();
			}

			var roots = items
				.Where(x => x.CORR_CENTRO_COSTO_MAYOR <= 0 || !byCorr.ContainsKey(x.CORR_CENTRO_COSTO_MAYOR))
				.OrderBy(Codigo, System.StringComparer.OrdinalIgnoreCase)
				.ThenBy(x => x.CORR_CENTRO_COSTO)
				.ToList();

			var ordered = new List<CON_CENTRO_COSTOView>(items.Count);
			var visited = new HashSet<int>();

			void Walk(CON_CENTRO_COSTOView node)
			{
				if (!visited.Add(node.CORR_CENTRO_COSTO))
				{
					return;
				}

				ordered.Add(node);
				if (!children.TryGetValue(node.CORR_CENTRO_COSTO, out var kids))
				{
					return;
				}

				foreach (var child in kids)
				{
					Walk(child);
				}
			}

			foreach (var root in roots)
			{
				Walk(root);
			}

			foreach (var item in items.OrderBy(Codigo, System.StringComparer.OrdinalIgnoreCase).ThenBy(x => x.CORR_CENTRO_COSTO))
			{
				if (!visited.Contains(item.CORR_CENTRO_COSTO))
				{
					Walk(item);
				}
			}

			return ordered;
		}
	}
}
