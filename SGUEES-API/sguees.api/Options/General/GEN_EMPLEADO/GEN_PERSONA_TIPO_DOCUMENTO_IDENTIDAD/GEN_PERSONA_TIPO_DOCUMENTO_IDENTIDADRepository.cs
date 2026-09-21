// Qué hace: acceso a datos de documentos de identidad anidados en GEN_EMPLEADO.
// Cómo lo hace: merge catálogo activo + valores; SaveAll con List<Table> (estándar Param/Table/View).
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
	public class GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADRepository
		: BaseRepository<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADTable>,
			IGEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADRepository
	{
		private const string _TableName = "GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD";
		private const string _ViewName = "V_GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD";
		private const string _ViewTipoDocumento = "V_GEN_TIPO_DOCUMENTO_IDENTIDAD";

		public GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value) { }

		// Qué hace: arma la lista del tab Documentos (catálogo activo + valor de la persona).
		// Cómo: lee V_GEN_TIPO_DOCUMENTO_IDENTIDAD y V_GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDAD y hace merge.
		public async Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa)
		{
			CResult objResultado = new();

			try
			{
				var catalogoWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "ACTIVO_TIPO_DOCUMENTO_IDENTIDAD", Value = true, DbType = System.Data.DbType.Boolean },
				};
				var readerCat = await objData.GetDataReader(_ViewTipoDocumento, catalogoWhere, "CORR_TIPO_DOCUMENTO_IDENTIDAD");
				var catalogo = new List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADView>().FromDataReader(readerCat).ToList();
				readerCat.Close();

				var valores = new List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADView>();
				if (corrPersona > 0 && corrEmpresa > 0)
				{
					var valoresWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
					};
					var readerVal = await objData.GetDataReader(_ViewName, valoresWhere, "CORR_TIPO_DOCUMENTO_IDENTIDAD");
					valores = new List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADView>().FromDataReader(readerVal).ToList();
					readerVal.Close();
				}

				var merged = catalogo.Select(t =>
				{
					var actual = valores.FirstOrDefault(v => v.CORR_TIPO_DOCUMENTO_IDENTIDAD == t.CORR_TIPO_DOCUMENTO_IDENTIDAD);
					return new GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADView
					{
						CORR_EMPRESA = corrEmpresa,
						CORR_PERSONA = corrPersona,
						CORR_TIPO_DOCUMENTO_IDENTIDAD = t.CORR_TIPO_DOCUMENTO_IDENTIDAD,
						NOMBRE_TIPO_DOCUMENTO_IDENTIDAD = t.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD,
						NOMBRE_CORTO = t.NOMBRE_CORTO,
						NUMERO_CARACTERES = t.NUMERO_CARACTERES,
						ACTIVO_CARACTERES = t.ACTIVO_CARACTERES,
						ACTIVO_TIPO_DOCUMENTO_IDENTIDAD = t.ACTIVO_TIPO_DOCUMENTO_IDENTIDAD,
						VALOR_DOCUMENTO = actual?.VALOR_DOCUMENTO ?? string.Empty,
						EXISTE = actual != null,
						USUARIO_CREA = actual?.USUARIO_CREA,
						ESTACION_CREA = actual?.ESTACION_CREA,
						FECHA_CREA = actual?.FECHA_CREA,
						USUARIO_ACTU = actual?.USUARIO_ACTU,
						ESTACION_ACTU = actual?.ESTACION_ACTU,
						FECHA_ACTU = actual?.FECHA_ACTU,
					};
				}).ToList();

				objResultado.Data = merged;
				objResultado.Result = true;
				objResultado.RowsAffected = merged.Count;
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

		// Qué hace: guarda documentos de identidad (insert/update; borra si valor vacío).
		// Cómo: recibe List<Table>; al final relee el merge en Data (View).
		public async Task<CResult> SaveAllAsync(
			long corrPersona,
			List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADTable> Data,
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
				var docs = Data ?? new List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADTable>();
				var rowsAffected = 0;

				var existentesWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
				};
				var readerExist = await objData.GetDataReader(_ViewName, existentesWhere);
				var existentes = new List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADView>().FromDataReader(readerExist).ToList();
				readerExist.Close();
				var tiposExistentes = new HashSet<int>(existentes.Select(x => x.CORR_TIPO_DOCUMENTO_IDENTIDAD));

				foreach (var item in docs)
				{
					if (item == null || item.CORR_TIPO_DOCUMENTO_IDENTIDAD <= 0)
					{
						continue;
					}

					var valor = (item.VALOR_DOCUMENTO ?? string.Empty).Trim();
					var existe = tiposExistentes.Contains(item.CORR_TIPO_DOCUMENTO_IDENTIDAD);
					var pWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_PERSONA", Value = corrPersona, DbType = System.Data.DbType.Int64 },
						new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO_IDENTIDAD", Value = item.CORR_TIPO_DOCUMENTO_IDENTIDAD, DbType = System.Data.DbType.Int32 },
					};

					if (string.IsNullOrWhiteSpace(valor))
					{
						if (existe)
						{
							rowsAffected += (int)await objData.Delete(_TableName, pWhere);
							tiposExistentes.Remove(item.CORR_TIPO_DOCUMENTO_IDENTIDAD);
						}
						continue;
					}

					if (existe)
					{
						var pUpdate = new List<CParameter>
						{
							new CParameter() { ParameterName = "VALOR_DOCUMENTO", Value = valor, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
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
							new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO_IDENTIDAD", Value = item.CORR_TIPO_DOCUMENTO_IDENTIDAD, DbType = System.Data.DbType.Int32 },
							new CParameter() { ParameterName = "VALOR_DOCUMENTO", Value = valor, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_CREA", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_CREA", Value = fecha, DbType = System.Data.DbType.DateTime },
							new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
							new CParameter() { ParameterName = "FECHA_ACTU", Value = fecha, DbType = System.Data.DbType.DateTime },
						};
						var readerIns = await objData.Insert(_TableName, pInsert, string.Empty, pWhere);
						readerIns?.Close();
						tiposExistentes.Add(item.CORR_TIPO_DOCUMENTO_IDENTIDAD);
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
