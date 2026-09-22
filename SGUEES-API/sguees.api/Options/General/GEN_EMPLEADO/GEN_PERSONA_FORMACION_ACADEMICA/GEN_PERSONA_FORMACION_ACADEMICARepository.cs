// Qué hace: acceso a datos de formación académica anidada en GEN_EMPLEADO.
// Cómo lo hace: GetAll desde vista; SaveAll sincroniza lista (insert/update/delete) y relee Data.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PERSONA_FORMACION_ACADEMICARepository
		: BaseRepository<GEN_PERSONA_FORMACION_ACADEMICATable>,
			IGEN_PERSONA_FORMACION_ACADEMICARepository
	{
		private const string _TableName = "GEN_PERSONA_FORMACION_ACADEMICA";
		private const string _ViewName = "V_GEN_PERSONA_FORMACION_ACADEMICA";

		public GEN_PERSONA_FORMACION_ACADEMICARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		// Qué hace: lista formación académica de la persona.
		public async Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				var rows = new List<GEN_PERSONA_FORMACION_ACADEMICAView>();
				if (corrPersona > 0 && corrEmpresa > 0)
				{
					var where = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					};
					var reader = await objData.GetDataReader(_ViewName, where, "CORR_FORMACION_ACADEMICA");
					rows = new List<GEN_PERSONA_FORMACION_ACADEMICAView>().FromDataReader(reader).ToList();
					reader.Close();
				}

				objResultado.Data = rows;
				objResultado.Result = true;
				objResultado.RowsAffected = rows.Count;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
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

		// Qué hace: sincroniza formación (alta/baja/cambio) y devuelve la lista releída.
		// Cómo: borra los que no vienen; actualiza CORR>0; inserta CORR<=0 con correlativo auto;
		//       calcula PERIODO_INICIAL/FINAL y PERIODO a partir de DESDE/HASTA.
		public async Task<CResult> SaveAllAsync(
			long corrPersona,
			List<GEN_PERSONA_FORMACION_ACADEMICATable> Data,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				if (corrEmpresa <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "CORR_EMPRESA es requerido.";
					return objResultado;
				}

				if (corrPersona <= 0)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 4000;
					objResultado.ErrorMessage = "CORR_PERSONA es requerido.";
					return objResultado;
				}

				var fecha = DateTime.Now;
				var items = Data ?? new List<GEN_PERSONA_FORMACION_ACADEMICATable>();
				var rowsAffected = 0;

				var existentesWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};
				var readerExist = await objData.GetDataReader(_ViewName, existentesWhere);
				var existentes = new List<GEN_PERSONA_FORMACION_ACADEMICAView>().FromDataReader(readerExist).ToList();
				readerExist.Close();

				var keepKeys = new HashSet<int>(
					items.Where(x => x != null && x.CORR_FORMACION_ACADEMICA > 0).Select(x => x.CORR_FORMACION_ACADEMICA));

				foreach (var actual in existentes)
				{
					if (keepKeys.Contains(actual.CORR_FORMACION_ACADEMICA))
					{
						continue;
					}

					var pDel = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
						new CParameter() { ParameterName = "CORR_FORMACION_ACADEMICA", Value = actual.CORR_FORMACION_ACADEMICA, DbType = System.Data.DbType.Int32 },
					};
					rowsAffected += (int)await objData.Delete(_TableName, pDel);
				}

				foreach (var item in items)
				{
					if (item == null)
					{
						continue;
					}

					// Qué hace: deriva periodos y texto PERIODO desde DESDE/HASTA.
					// Cómo: año de cada fecha si existe; PERIODO = "YYYY" o "YYYY-YYYY".
					var periodoInicial = item.DESDE.HasValue ? (int?)item.DESDE.Value.Year : item.PERIODO_INICIAL;
					var periodoFinal = item.HASTA.HasValue ? (int?)item.HASTA.Value.Year : item.PERIODO_FINAL;
					var periodo = ConstruirPeriodo(periodoInicial, periodoFinal);

					if (item.CORR_FORMACION_ACADEMICA > 0)
					{
						var pUpdate = new List<CParameter>
						{
							new CParameter() { ParameterName = "TITULO", Value = (item.TITULO ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "CENTRO_EDUCATIVO", Value = (item.CENTRO_EDUCATIVO ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "NIVEL", Value = (item.NIVEL ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "DESDE", Value = (object)item.DESDE ?? DBNull.Value, DbType = System.Data.DbType.DateTime },
							new CParameter() { ParameterName = "HASTA", Value = (object)item.HASTA ?? DBNull.Value, DbType = System.Data.DbType.DateTime },
							new CParameter() { ParameterName = "PERIODO_INICIAL", Value = (object)periodoInicial ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "PERIODO_FINAL", Value = (object)periodoFinal ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "PERIODO", Value = periodo, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
						};
						var pWhere = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
							new CParameter() { ParameterName = "CORR_FORMACION_ACADEMICA", Value = item.CORR_FORMACION_ACADEMICA, DbType = System.Data.DbType.Int32 },
						};
						var readerUpd = await objData.Update(_TableName, pUpdate, pWhere);
						readerUpd?.Close();
						rowsAffected++;
					}
					else
					{
						var pInsert = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
							new CParameter() { ParameterName = "CORR_FORMACION_ACADEMICA", Value = 0, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "TITULO", Value = (item.TITULO ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "CENTRO_EDUCATIVO", Value = (item.CENTRO_EDUCATIVO ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "NIVEL", Value = (item.NIVEL ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "DESDE", Value = (object)item.DESDE ?? DBNull.Value, DbType = System.Data.DbType.DateTime },
							new CParameter() { ParameterName = "HASTA", Value = (object)item.HASTA ?? DBNull.Value, DbType = System.Data.DbType.DateTime },
							new CParameter() { ParameterName = "PERIODO_INICIAL", Value = (object)periodoInicial ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "PERIODO_FINAL", Value = (object)periodoFinal ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "PERIODO", Value = periodo, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_CREA", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_CREA", Value = fecha, DbType = System.Data.DbType.DateTime },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
						};
						var pWhereIns = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
						};
						var readerIns = await objData.Insert(_TableName, pInsert, "CORR_FORMACION_ACADEMICA", pWhereIns);
						readerIns?.Close();
						rowsAffected++;
					}
				}

				var reload = await GetAllAsync(corrPersona, corrEmpresa);
				if (!reload.Result)
				{
					return reload;
				}

				objResultado.Data = reload.Data;
				objResultado.Result = true;
				objResultado.RowsAffected = rowsAffected;
				objResultado.CodeHelper = (int)corrPersona;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
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

		// Qué hace: arma el texto PERIODO a partir de años inicial/final.
		// Cómo: un solo año si falta uno o son iguales; "YYYY-YYYY" si difieren.
		private static string ConstruirPeriodo(int? periodoInicial, int? periodoFinal)
		{
			if (periodoInicial.HasValue && periodoFinal.HasValue)
			{
				return periodoInicial.Value == periodoFinal.Value
					? periodoInicial.Value.ToString()
					: $"{periodoInicial.Value}-{periodoFinal.Value}";
			}

			if (periodoInicial.HasValue)
			{
				return periodoInicial.Value.ToString();
			}

			if (periodoFinal.HasValue)
			{
				return periodoFinal.Value.ToString();
			}

			return string.Empty;
		}
	}
}
