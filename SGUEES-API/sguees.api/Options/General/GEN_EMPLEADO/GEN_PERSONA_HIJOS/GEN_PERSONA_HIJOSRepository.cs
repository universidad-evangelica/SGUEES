// Qué hace: acceso a datos de hijos anidados en GEN_EMPLEADO.
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
	public class GEN_PERSONA_HIJOSRepository
		: BaseRepository<GEN_PERSONA_HIJOSTable>,
			IGEN_PERSONA_HIJOSRepository
	{
		private const string _TableName = "GEN_PERSONA_HIJOS";
		private const string _ViewName = "V_GEN_PERSONA_HIJOS";

		public GEN_PERSONA_HIJOSRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		// Qué hace: lista hijos de la persona.
		public async Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				var rows = new List<GEN_PERSONA_HIJOSView>();
				if (corrPersona > 0 && corrEmpresa > 0)
				{
					var where = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					};
					var reader = await objData.GetDataReader(_ViewName, where, "CORR_HIJO");
					rows = new List<GEN_PERSONA_HIJOSView>().FromDataReader(reader).ToList();
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

		// Qué hace: sincroniza hijos (alta/baja/cambio) y devuelve la lista releída.
		// Cómo: borra los que no vienen; actualiza CORR>0; inserta CORR<=0 con correlativo auto.
		public async Task<CResult> SaveAllAsync(
			long corrPersona,
			List<GEN_PERSONA_HIJOSTable> Data,
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
				var items = Data ?? new List<GEN_PERSONA_HIJOSTable>();
				var rowsAffected = 0;

				var existentesWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};
				var readerExist = await objData.GetDataReader(_ViewName, existentesWhere);
				var existentes = new List<GEN_PERSONA_HIJOSView>().FromDataReader(readerExist).ToList();
				readerExist.Close();

				var keepKeys = new HashSet<int>(
					items.Where(x => x != null && x.CORR_HIJO > 0).Select(x => x.CORR_HIJO));

				foreach (var actual in existentes)
				{
					if (keepKeys.Contains(actual.CORR_HIJO))
					{
						continue;
					}

					var pDel = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
						new CParameter() { ParameterName = "CORR_HIJO", Value = actual.CORR_HIJO, DbType = System.Data.DbType.Int32 },
					};
					rowsAffected += (int)await objData.Delete(_TableName, pDel);
				}

				foreach (var item in items)
				{
					if (item == null)
					{
						continue;
					}

					var nombre = (item.NOMBRE_COMPLETO ?? string.Empty).Trim();
					if (string.IsNullOrWhiteSpace(nombre))
					{
						continue;
					}

					// CHECK: MASCULINO|FEMENINO; vacío → NULL (columna nullable).
					var sexo = (item.SEXO ?? string.Empty).Trim();
					object sexoValor = string.IsNullOrWhiteSpace(sexo) ? DBNull.Value : sexo;

					if (item.CORR_HIJO > 0)
					{
						var pUpdate = new List<CParameter>
						{
							new CParameter() { ParameterName = "NOMBRE_COMPLETO", Value = nombre, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "EDAD", Value = (object)item.EDAD ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "SEXO", Value = sexoValor, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_NACIMIENTO", Value = (object)item.FECHA_NACIMIENTO ?? DBNull.Value, DbType = System.Data.DbType.Date },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
						};
						var pWhere = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
							new CParameter() { ParameterName = "CORR_HIJO", Value = item.CORR_HIJO, DbType = System.Data.DbType.Int32 },
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
							new CParameter() { ParameterName = "CORR_HIJO", Value = 0, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "NOMBRE_COMPLETO", Value = nombre, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "EDAD", Value = (object)item.EDAD ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "SEXO", Value = sexoValor, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_NACIMIENTO", Value = (object)item.FECHA_NACIMIENTO ?? DBNull.Value, DbType = System.Data.DbType.Date },
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
						var readerIns = await objData.Insert(_TableName, pInsert, "CORR_HIJO", pWhereIns);
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
	}
}
