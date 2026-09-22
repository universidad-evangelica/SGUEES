// Qué hace: acceso a datos de domicilios anidados en GEN_EMPLEADO.
// Cómo lo hace: GetAll desde vista; SaveAll sincroniza lista y relee Data.
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
	public class GEN_PERSONA_DOMICILIORepository
		: BaseRepository<GEN_PERSONA_DOMICILIOTable>,
			IGEN_PERSONA_DOMICILIORepository
	{
		private const string _TableName = "GEN_PERSONA_DOMICILIO";
		private const string _ViewName = "V_GEN_PERSONA_DOMICILIO";

		public GEN_PERSONA_DOMICILIORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				var rows = new List<GEN_PERSONA_DOMICILIOView>();
				if (corrPersona > 0 && corrEmpresa > 0)
				{
					var where = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					};
					var reader = await objData.GetDataReader(_ViewName, where, "CORR_DOMICILIO");
					rows = new List<GEN_PERSONA_DOMICILIOView>().FromDataReader(reader).ToList();
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

		// Qué hace: sincroniza domicilios (alta/baja/cambio) y relee la lista.
		// Cómo: omitir filas sin dirección; territorio nullable (no domiciliado = solo país).
		public async Task<CResult> SaveAllAsync(
			long corrPersona,
			List<GEN_PERSONA_DOMICILIOTable> Data,
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
				var items = Data ?? new List<GEN_PERSONA_DOMICILIOTable>();
				var rowsAffected = 0;

				var existentesWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};
				var readerExist = await objData.GetDataReader(_ViewName, existentesWhere);
				var existentes = new List<GEN_PERSONA_DOMICILIOView>().FromDataReader(readerExist).ToList();
				readerExist.Close();

				var keepKeys = new HashSet<int>(
					items.Where(x => x != null && x.CORR_DOMICILIO > 0).Select(x => x.CORR_DOMICILIO));

				foreach (var actual in existentes)
				{
					if (keepKeys.Contains(actual.CORR_DOMICILIO))
					{
						continue;
					}

					var pDel = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
						new CParameter() { ParameterName = "CORR_DOMICILIO", Value = actual.CORR_DOMICILIO, DbType = System.Data.DbType.Int32 },
					};
					rowsAffected += (int)await objData.Delete(_TableName, pDel);
				}

				foreach (var item in items)
				{
					if (item == null)
					{
						continue;
					}

					var direccion = (item.DIRECCION ?? string.Empty).Trim();
					if (string.IsNullOrWhiteSpace(direccion))
					{
						continue;
					}

					object pais = item.CORR_PAIS.HasValue && item.CORR_PAIS.Value > 0 ? item.CORR_PAIS.Value : DBNull.Value;
					object depto = item.CORR_DEPTO.HasValue && item.CORR_DEPTO.Value > 0 ? item.CORR_DEPTO.Value : DBNull.Value;
					object municipio = item.CORR_MUNICIPIO.HasValue && item.CORR_MUNICIPIO.Value > 0 ? item.CORR_MUNICIPIO.Value : DBNull.Value;
					object distrito = item.CORR_DISTRITO.HasValue && item.CORR_DISTRITO.Value > 0 ? item.CORR_DISTRITO.Value : DBNull.Value;
					var activo = item.ACTIVO_DOMICILIO ?? true;

					if (item.CORR_DOMICILIO > 0)
					{
						var pUpdate = new List<CParameter>
						{
							new CParameter() { ParameterName = "DIRECCION", Value = direccion, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "CORR_PAIS", Value = pais, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_DEPTO", Value = depto, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = municipio, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_DISTRITO", Value = distrito, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "ACTIVO_DOMICILIO", Value = activo, DbType = System.Data.DbType.Boolean },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
						};
						var pWhere = new List<CParameter>
						{
							new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
							new CParameter() { ParameterName = "CORR_DOMICILIO", Value = item.CORR_DOMICILIO, DbType = System.Data.DbType.Int32 },
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
							new CParameter() { ParameterName = "CORR_DOMICILIO", Value = 0, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "DIRECCION", Value = direccion, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "CORR_PAIS", Value = pais, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_DEPTO", Value = depto, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = municipio, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "CORR_DISTRITO", Value = distrito, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "ACTIVO_DOMICILIO", Value = activo, DbType = System.Data.DbType.Boolean },
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
						var readerIns = await objData.Insert(_TableName, pInsert, "CORR_DOMICILIO", pWhereIns);
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
