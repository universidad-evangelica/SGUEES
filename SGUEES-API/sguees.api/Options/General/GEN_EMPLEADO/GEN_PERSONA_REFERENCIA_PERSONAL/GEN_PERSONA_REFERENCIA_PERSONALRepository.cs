// Qué hace: acceso a datos de referencias personales anidadas en GEN_EMPLEADO.
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
	public class GEN_PERSONA_REFERENCIA_PERSONALRepository
		: BaseRepository<GEN_PERSONA_REFERENCIA_PERSONALTable>,
			IGEN_PERSONA_REFERENCIA_PERSONALRepository
	{
		private const string _TableName = "GEN_PERSONA_REFERENCIA_PERSONAL";
		private const string _ViewName = "V_GEN_PERSONA_REFERENCIA_PERSONAL";

		public GEN_PERSONA_REFERENCIA_PERSONALRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		// Qué hace: lista referencias personales de la persona.
		public async Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				var rows = new List<GEN_PERSONA_REFERENCIA_PERSONALView>();
				if (corrPersona > 0 && corrEmpresa > 0)
				{
					var where = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					};
					var reader = await objData.GetDataReader(_ViewName, where, "CORR_REFERENCIA_PERSONAL");
					rows = new List<GEN_PERSONA_REFERENCIA_PERSONALView>().FromDataReader(reader).ToList();
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

		// Qué hace: sincroniza referencias personales (alta/baja/cambio) y devuelve la lista releída.
		// Cómo: borra los que no vienen; actualiza CORR>0; inserta CORR<=0. Sin computed ni CHECK.
		public async Task<CResult> SaveAllAsync(
			long corrPersona,
			List<GEN_PERSONA_REFERENCIA_PERSONALTable> Data,
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
				var items = Data ?? new List<GEN_PERSONA_REFERENCIA_PERSONALTable>();
				var rowsAffected = 0;

				var existentesWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};
				var readerExist = await objData.GetDataReader(_ViewName, existentesWhere);
				var existentes = new List<GEN_PERSONA_REFERENCIA_PERSONALView>().FromDataReader(readerExist).ToList();
				readerExist.Close();

				var keepKeys = new HashSet<int>(
					items.Where(x => x != null && x.CORR_REFERENCIA_PERSONAL > 0).Select(x => x.CORR_REFERENCIA_PERSONAL));

				foreach (var actual in existentes)
				{
					if (keepKeys.Contains(actual.CORR_REFERENCIA_PERSONAL))
					{
						continue;
					}

					var pDel = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
						new CParameter() { ParameterName = "CORR_REFERENCIA_PERSONAL", Value = actual.CORR_REFERENCIA_PERSONAL, DbType = System.Data.DbType.Int32 },
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

					if (item.CORR_REFERENCIA_PERSONAL > 0)
					{
						var pUpdate = new List<CParameter>
						{
							new CParameter() { ParameterName = "NOMBRE_COMPLETO", Value = nombre, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "DIRECCION", Value = (item.DIRECCION ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "TELEFONO", Value = (item.TELEFONO ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
						};
						var pWhere = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
							new CParameter() { ParameterName = "CORR_REFERENCIA_PERSONAL", Value = item.CORR_REFERENCIA_PERSONAL, DbType = System.Data.DbType.Int32 },
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
							new CParameter() { ParameterName = "CORR_REFERENCIA_PERSONAL", Value = 0, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "NOMBRE_COMPLETO", Value = nombre, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "DIRECCION", Value = (item.DIRECCION ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "TELEFONO", Value = (item.TELEFONO ?? string.Empty).Trim(), DbType = System.Data.DbType.String },
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
						var readerIns = await objData.Insert(_TableName, pInsert, "CORR_REFERENCIA_PERSONAL", pWhereIns);
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
