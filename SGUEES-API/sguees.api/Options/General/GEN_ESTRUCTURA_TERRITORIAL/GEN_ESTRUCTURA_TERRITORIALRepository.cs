using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public partial class GEN_ESTRUCTURA_TERRITORIALRepository : BaseRepository<GEN_ESTRUCTURA_TERRITORIAL_PAISTable>, IGEN_ESTRUCTURA_TERRITORIALRepository
	{
		private const string _PaisTable = "GEN_PAIS";
		private const string _DeptoTable = "GEN_DEPTO";
		private const string _MunicipioTable = "GEN_MUNICIPIO";
		private const string _DistritoTable = "GEN_DISTRITO";

		public GEN_ESTRUCTURA_TERRITORIALRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllPaisesAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var page = xWhere
					.Where(x => x.ParameterName == "PAGE")
					.Select(x => Convert.ToInt32(x.Value ?? 1))
					.FirstOrDefault();
				var pageSize = xWhere
					.Where(x => x.ParameterName == "PAGE_SIZE")
					.Select(x => Convert.ToInt32(x.Value ?? 10))
					.FirstOrDefault();

				page = page < 1 ? 1 : page;
				pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 100);

				var response = await FilterPaisesQueryAsync(xWhere);
				var totalRows = response.Count;
				var pageData = response.Skip((page - 1) * pageSize).Take(pageSize).ToList();

				objResultado.Data = pageData;
				objResultado.Result = true;
				objResultado.RowsAffected = totalRows;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		public async Task<CResult> GetPaisAsync(List<CParameter> xWhere)
		{
			return await ReadOneAsync<GEN_ESTRUCTURA_TERRITORIAL_PAISView>("V_" + _PaisTable, xWhere, x => x.CORR_PAIS);
		}

		public async Task<CResult> CreatePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "NOMBRE_PAIS", Value = data.NOMBRE_PAIS, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CODIGO_PAIS", Value = data.CODIGO_PAIS, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "NACIONALIDAD", Value = data.NACIONALIDAD, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "NOMBRE_CORTO", Value = data.NOMBRE_CORTO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "USUARIO_CREA", Value = data.USUARIO_CREA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_CREA", Value = data.ESTACION_CREA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_CREA", Value = data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
			};

			return await SaveInsertAsync(_PaisTable, p, "CORR_PAIS", new List<CParameter>(), reader =>
				new List<GEN_ESTRUCTURA_TERRITORIAL_PAISView>().FromDataReader(reader).FirstOrDefault(), x => x?.CORR_PAIS ?? 0);
		}

		public async Task<CResult> UpdatePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "NOMBRE_PAIS", Value = data.NOMBRE_PAIS, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CODIGO_PAIS", Value = data.CODIGO_PAIS, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "NACIONALIDAD", Value = data.NACIONALIDAD, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "NOMBRE_CORTO", Value = data.NOMBRE_CORTO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
			};

			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
			};

			return await SaveUpdateAsync(_PaisTable, p, pWhere, reader =>
				new List<GEN_ESTRUCTURA_TERRITORIAL_PAISView>().FromDataReader(reader).FirstOrDefault(), data.CORR_PAIS);
		}

		public async Task<CResult> DeletePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion)
		{
			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
			};

			return await SaveDeleteAsync(_PaisTable, pWhere, data.CORR_PAIS, "No se puede eliminar el país porque tiene registros asociados en otras tablas.");
		}

		public async Task<CResult> GetAllDeptosAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var response = await FilterDeptosQueryAsync(xWhere);
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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

		public async Task<CResult> GetDeptoAsync(List<CParameter> xWhere)
		{
			return await ReadOneAsync<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView>("V_" + _DeptoTable, xWhere, x => x.CORR_DEPTO);
		}

		public async Task<CResult> CreateDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "NOMBRE_DEPTO", Value = data.NOMBRE_DEPTO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CODIGO_DEPTO", Value = data.CODIGO_DEPTO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "USUARIO_CREA", Value = data.USUARIO_CREA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_CREA", Value = data.ESTACION_CREA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_CREA", Value = data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
			};

			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
			};

			return await SaveInsertAsync(_DeptoTable, p, "CORR_DEPTO", pWhere, reader =>
				new List<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView>().FromDataReader(reader).FirstOrDefault(), x => x?.CORR_DEPTO ?? 0);
		}

		public async Task<CResult> UpdateDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "NOMBRE_DEPTO", Value = data.NOMBRE_DEPTO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CODIGO_DEPTO", Value = data.CODIGO_DEPTO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
			};

			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
			};

			return await SaveUpdateAsync(_DeptoTable, p, pWhere, reader =>
				new List<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView>().FromDataReader(reader).FirstOrDefault(), data.CORR_DEPTO);
		}

		public async Task<CResult> DeleteDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
			};

			return await SaveDeleteAsync(_DeptoTable, pWhere, data.CORR_DEPTO, "No se puede eliminar el departamento porque tiene registros asociados en otras tablas.");
		}

		public async Task<CResult> GetAllMunicipiosAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var response = await FilterMunicipiosQueryAsync(xWhere);
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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

		public async Task<CResult> GetMunicipioAsync(List<CParameter> xWhere)
		{
			return await ReadOneAsync<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView>("V_" + _MunicipioTable, xWhere, x => x.CORR_MUNICIPIO);
		}

		public async Task<CResult> CreateMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "NOMBRE_MUNICIPIO", Value = data.NOMBRE_MUNICIPIO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CODIGO_MUNICIPIO", Value = data.CODIGO_MUNICIPIO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "USUARIO_CREA", Value = data.USUARIO_CREA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_CREA", Value = data.ESTACION_CREA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_CREA", Value = data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
			};

			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
			};

			return await SaveInsertAsync(_MunicipioTable, p, "CORR_MUNICIPIO", pWhere, reader =>
				new List<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView>().FromDataReader(reader).FirstOrDefault(), x => x?.CORR_MUNICIPIO ?? 0);
		}

		public async Task<CResult> UpdateMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "NOMBRE_MUNICIPIO", Value = data.NOMBRE_MUNICIPIO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CODIGO_MUNICIPIO", Value = data.CODIGO_MUNICIPIO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
			};

			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
			};

			return await SaveUpdateAsync(_MunicipioTable, p, pWhere, reader =>
				new List<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView>().FromDataReader(reader).FirstOrDefault(), data.CORR_MUNICIPIO);
		}

		public async Task<CResult> DeleteMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
		{
			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
			};

			return await SaveDeleteAsync(_MunicipioTable, pWhere, data.CORR_MUNICIPIO, "No se puede eliminar el municipio porque tiene registros asociados en otras tablas.");
		}

		public async Task<CResult> GetAllDistritosAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var response = await FilterDistritosQueryAsync(xWhere);
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
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

		public async Task<CResult> GetDistritoAsync(List<CParameter> xWhere)
		{
			return await ReadOneAsync<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView>("V_" + _DistritoTable, xWhere, x => x.CORR_DISTRITO);
		}

		public async Task<CResult> CreateDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DISTRITO", Value = data.CORR_DISTRITO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
				new CParameter() { ParameterName = "NOMBRE_DISTRITO", Value = data.NOMBRE_DISTRITO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "USUARIO_CREA", Value = data.USUARIO_CREA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_CREA", Value = data.ESTACION_CREA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_CREA", Value = data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
			};

			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
			};

			return await SaveInsertAsync(_DistritoTable, p, "CORR_DISTRITO", pWhere, reader =>
				new List<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView>().FromDataReader(reader).FirstOrDefault(), x => x?.CORR_DISTRITO ?? 0);
		}

		public async Task<CResult> UpdateDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "NOMBRE_DISTRITO", Value = data.NOMBRE_DISTRITO, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "USUARIO_ACTU", Value = data.USUARIO_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "ESTACION_ACTU", Value = data.ESTACION_ACTU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "FECHA_ACTU", Value = data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
			};

			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DISTRITO", Value = data.CORR_DISTRITO, DbType = System.Data.DbType.Int32 },
			};

			return await SaveUpdateAsync(_DistritoTable, p, pWhere, reader =>
				new List<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView>().FromDataReader(reader).FirstOrDefault(), data.CORR_DISTRITO);
		}

		public async Task<CResult> DeleteDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			var pWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DISTRITO", Value = data.CORR_DISTRITO, DbType = System.Data.DbType.Int32 },
			};

			return await SaveDeleteAsync(_DistritoTable, pWhere, data.CORR_DISTRITO, "No se puede eliminar el distrito porque tiene registros asociados en otras tablas.");
		}

		public Task<bool> ExistsPaisByFieldAsync(string fieldName, string normalizedValue, int excludeCorrPais)
		{
			if (!IsAllowedPaisField(fieldName) || string.IsNullOrWhiteSpace(normalizedValue))
			{
				return Task.FromResult(false);
			}

			var sql = $@"SELECT TOP 1 1 AS FOUND
				FROM V_{_PaisTable}
				WHERE UPPER(LTRIM(RTRIM({fieldName}))) = @NORMALIZED_VALUE
				AND (@EXCLUDE_CORR_PAIS <= 0 OR CORR_PAIS <> @EXCLUDE_CORR_PAIS)";

			return ExistsByQueryAsync(sql, new List<CParameter>
			{
				new CParameter() { ParameterName = "NORMALIZED_VALUE", Value = normalizedValue, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "EXCLUDE_CORR_PAIS", Value = excludeCorrPais, DbType = System.Data.DbType.Int32 },
			});
		}

		public Task<bool> ExistsDeptoByFieldAsync(int corrPais, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto)
		{
			if (!IsAllowedDeptoField(fieldName) || string.IsNullOrWhiteSpace(normalizedValue))
			{
				return Task.FromResult(false);
			}

			var excludeClause = excludeCorrPais > 0 && excludeCorrDepto > 0
				? " AND NOT (CORR_PAIS = @EXCLUDE_CORR_PAIS AND CORR_DEPTO = @EXCLUDE_CORR_DEPTO)"
				: string.Empty;

			var sql = $@"SELECT TOP 1 1 AS FOUND
				FROM V_{_DeptoTable}
				WHERE CORR_PAIS = @CORR_PAIS
				AND UPPER(LTRIM(RTRIM({fieldName}))) = @NORMALIZED_VALUE{excludeClause}";

			var parameters = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = corrPais, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "NORMALIZED_VALUE", Value = normalizedValue, DbType = System.Data.DbType.String },
			};

			if (excludeCorrPais > 0 && excludeCorrDepto > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_PAIS", Value = excludeCorrPais, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_DEPTO", Value = excludeCorrDepto, DbType = System.Data.DbType.Int32 });
			}

			return ExistsByQueryAsync(sql, parameters);
		}

		public Task<bool> ExistsMunicipioByFieldAsync(int corrPais, int corrDepto, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto, int excludeCorrMunicipio)
		{
			if (!IsAllowedMunicipioField(fieldName) || string.IsNullOrWhiteSpace(normalizedValue))
			{
				return Task.FromResult(false);
			}

			var excludeClause = excludeCorrPais > 0 && excludeCorrDepto > 0 && excludeCorrMunicipio > 0
				? " AND NOT (CORR_PAIS = @EXCLUDE_CORR_PAIS AND CORR_DEPTO = @EXCLUDE_CORR_DEPTO AND CORR_MUNICIPIO = @EXCLUDE_CORR_MUNICIPIO)"
				: string.Empty;

			var sql = $@"SELECT TOP 1 1 AS FOUND
				FROM V_{_MunicipioTable}
				WHERE CORR_PAIS = @CORR_PAIS
				AND CORR_DEPTO = @CORR_DEPTO
				AND UPPER(LTRIM(RTRIM({fieldName}))) = @NORMALIZED_VALUE{excludeClause}";

			var parameters = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = corrPais, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = corrDepto, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "NORMALIZED_VALUE", Value = normalizedValue, DbType = System.Data.DbType.String },
			};

			if (excludeCorrPais > 0 && excludeCorrDepto > 0 && excludeCorrMunicipio > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_PAIS", Value = excludeCorrPais, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_DEPTO", Value = excludeCorrDepto, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_MUNICIPIO", Value = excludeCorrMunicipio, DbType = System.Data.DbType.Int32 });
			}

			return ExistsByQueryAsync(sql, parameters);
		}

		public Task<bool> ExistsDistritoByFieldAsync(int corrPais, int corrDepto, int corrMunicipio, string fieldName, string normalizedValue, int excludeCorrPais, int excludeCorrDepto, int excludeCorrMunicipio, int excludeCorrDistrito)
		{
			if (!IsAllowedDistritoField(fieldName) || string.IsNullOrWhiteSpace(normalizedValue))
			{
				return Task.FromResult(false);
			}

			var excludeClause = excludeCorrPais > 0 && excludeCorrDepto > 0 && excludeCorrMunicipio > 0 && excludeCorrDistrito > 0
				? " AND NOT (CORR_PAIS = @EXCLUDE_CORR_PAIS AND CORR_DEPTO = @EXCLUDE_CORR_DEPTO AND CORR_MUNICIPIO = @EXCLUDE_CORR_MUNICIPIO AND CORR_DISTRITO = @EXCLUDE_CORR_DISTRITO)"
				: string.Empty;

			var sql = $@"SELECT TOP 1 1 AS FOUND
				FROM V_{_DistritoTable}
				WHERE CORR_PAIS = @CORR_PAIS
				AND CORR_DEPTO = @CORR_DEPTO
				AND CORR_MUNICIPIO = @CORR_MUNICIPIO
				AND UPPER(LTRIM(RTRIM({fieldName}))) = @NORMALIZED_VALUE{excludeClause}";

			var parameters = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = corrPais, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = corrDepto, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = corrMunicipio, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "NORMALIZED_VALUE", Value = normalizedValue, DbType = System.Data.DbType.String },
			};

			if (excludeCorrPais > 0 && excludeCorrDepto > 0 && excludeCorrMunicipio > 0 && excludeCorrDistrito > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_PAIS", Value = excludeCorrPais, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_DEPTO", Value = excludeCorrDepto, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_MUNICIPIO", Value = excludeCorrMunicipio, DbType = System.Data.DbType.Int32 });
				parameters.Add(new CParameter() { ParameterName = "EXCLUDE_CORR_DISTRITO", Value = excludeCorrDistrito, DbType = System.Data.DbType.Int32 });
			}

			return ExistsByQueryAsync(sql, parameters);
		}

		private async Task<CResult> ReadAllPagedAsync<TView>(
			string viewName,
			List<CParameter> xWhere,
			string[] dbParameterNames,
			Func<IEnumerable<TView>, IOrderedEnumerable<TView>> orderSelector,
			Func<TView, IEnumerable<string>> searchValues,
			Func<TView, string, string> getColumnValue)
		{
			CResult objResultado = new();

			try
			{
				var dbWhere = xWhere
					.Where(x => dbParameterNames.Contains(x.ParameterName))
					.ToList();

				var busqueda = GetFilterValue(xWhere, "BUSQUEDA");
				var page = xWhere
					.Where(x => x.ParameterName == "PAGE")
					.Select(x => Convert.ToInt32(x.Value ?? 1))
					.FirstOrDefault();
				var pageSize = xWhere
					.Where(x => x.ParameterName == "PAGE_SIZE")
					.Select(x => Convert.ToInt32(x.Value ?? 10))
					.FirstOrDefault();

				page = page < 1 ? 1 : page;
				pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 100);

				var columnFilters = xWhere
					.Where(x =>
						x.ParameterName != "BUSQUEDA" &&
						x.ParameterName != "PAGE" &&
						x.ParameterName != "PAGE_SIZE" &&
						!dbParameterNames.Contains(x.ParameterName))
					.Where(x => x.Value != null && !string.IsNullOrWhiteSpace(x.Value.ToString()))
					.ToDictionary(x => x.ParameterName, x => x.Value.ToString());

				var reader = await objData.GetDataReader(viewName, dbWhere);
				var response = new List<TView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				if (!string.IsNullOrWhiteSpace(busqueda))
				{
					var search = busqueda.Trim();
					response = response
						.Where(row => searchValues(row).Any(value => Contains(value, search)))
						.ToList();
				}

				foreach (var columnFilter in columnFilters)
				{
					response = response
						.Where(row => Contains(getColumnValue(row, columnFilter.Key), columnFilter.Value))
						.ToList();
				}

				response = orderSelector(response).ToList();
				var totalRows = response.Count;
				var pageData = response
					.Skip((page - 1) * pageSize)
					.Take(pageSize)
					.ToList();

				objResultado.Data = pageData;
				objResultado.Result = true;
				objResultado.RowsAffected = totalRows;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		private async Task<CResult> ReadAllFilteredAsync<TView>(
			string viewName,
			List<CParameter> xWhere,
			string[] dbParameterNames,
			Func<IEnumerable<TView>, IOrderedEnumerable<TView>> orderSelector,
			Func<TView, IEnumerable<string>> searchValues,
			Func<TView, string, string> getColumnValue)
		{
			CResult objResultado = new();

			try
			{
				var dbWhere = xWhere
					.Where(x => dbParameterNames.Contains(x.ParameterName))
					.ToList();

				var busqueda = GetFilterValue(xWhere, "BUSQUEDA");
				var columnFilters = xWhere
					.Where(x =>
						x.ParameterName != "BUSQUEDA" &&
						x.ParameterName != "PAGE" &&
						x.ParameterName != "PAGE_SIZE" &&
						!dbParameterNames.Contains(x.ParameterName))
					.Where(x => x.Value != null && !string.IsNullOrWhiteSpace(x.Value.ToString()))
					.ToDictionary(x => x.ParameterName, x => x.Value.ToString());

				var reader = await objData.GetDataReader(viewName, dbWhere);
				var response = new List<TView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				if (!string.IsNullOrWhiteSpace(busqueda))
				{
					var search = busqueda.Trim();
					response = response
						.Where(row => searchValues(row).Any(value => Contains(value, search)))
						.ToList();
				}

				foreach (var columnFilter in columnFilters)
				{
					response = response
						.Where(row => Contains(getColumnValue(row, columnFilter.Key), columnFilter.Value))
						.ToList();
				}

				response = orderSelector(response).ToList();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		private static string GetFilterValue(List<CParameter> xWhere, string parameterName)
		{
			return xWhere
				.Where(x => x.ParameterName == parameterName)
				.Select(x => x.Value?.ToString())
				.FirstOrDefault();
		}

		private static IEnumerable<string> GetPaisSearchValues(GEN_ESTRUCTURA_TERRITORIAL_PAISView row)
		{
			yield return row.CORR_PAIS.ToString();
			yield return row.NOMBRE_PAIS;
			yield return row.CODIGO_PAIS;
			yield return row.NACIONALIDAD;
			yield return row.NOMBRE_CORTO;
		}

		private static string GetPaisColumnValue(GEN_ESTRUCTURA_TERRITORIAL_PAISView row, string columnName)
		{
			switch (columnName)
			{
				case "CORR_PAIS":
					return row.CORR_PAIS.ToString();
				case "NOMBRE_PAIS":
					return row.NOMBRE_PAIS;
				case "CODIGO_PAIS":
					return row.CODIGO_PAIS;
				case "NACIONALIDAD":
					return row.NACIONALIDAD;
				case "NOMBRE_CORTO":
					return row.NOMBRE_CORTO;
				case "USUARIO_CREA":
					return row.USUARIO_CREA;
				case "ESTACION_CREA":
					return row.ESTACION_CREA;
				case "FECHA_CREA":
					return row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm");
				case "USUARIO_ACTU":
					return row.USUARIO_ACTU;
				case "ESTACION_ACTU":
					return row.ESTACION_ACTU;
				case "FECHA_ACTU":
					return row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm");
				default:
					return null;
			}
		}

		private static IEnumerable<string> GetDeptoSearchValues(GEN_ESTRUCTURA_TERRITORIAL_DEPTOView row)
		{
			yield return row.CORR_DEPTO.ToString();
			yield return row.NOMBRE_DEPTO;
			yield return row.CODIGO_DEPTO;
		}

		private static string GetDeptoColumnValue(GEN_ESTRUCTURA_TERRITORIAL_DEPTOView row, string columnName)
		{
			switch (columnName)
			{
				case "CORR_DEPTO":
					return row.CORR_DEPTO.ToString();
				case "NOMBRE_DEPTO":
					return row.NOMBRE_DEPTO;
				case "CODIGO_DEPTO":
					return row.CODIGO_DEPTO;
				case "USUARIO_CREA":
					return row.USUARIO_CREA;
				case "ESTACION_CREA":
					return row.ESTACION_CREA;
				case "FECHA_CREA":
					return row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm");
				case "USUARIO_ACTU":
					return row.USUARIO_ACTU;
				case "ESTACION_ACTU":
					return row.ESTACION_ACTU;
				case "FECHA_ACTU":
					return row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm");
				default:
					return null;
			}
		}

		private static IEnumerable<string> GetMunicipioSearchValues(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView row)
		{
			yield return row.CORR_MUNICIPIO.ToString();
			yield return row.NOMBRE_MUNICIPIO;
			yield return row.CODIGO_MUNICIPIO;
		}

		private static string GetMunicipioColumnValue(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView row, string columnName)
		{
			switch (columnName)
			{
				case "CORR_MUNICIPIO":
					return row.CORR_MUNICIPIO.ToString();
				case "NOMBRE_MUNICIPIO":
					return row.NOMBRE_MUNICIPIO;
				case "CODIGO_MUNICIPIO":
					return row.CODIGO_MUNICIPIO;
				case "USUARIO_CREA":
					return row.USUARIO_CREA;
				case "ESTACION_CREA":
					return row.ESTACION_CREA;
				case "FECHA_CREA":
					return row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm");
				case "USUARIO_ACTU":
					return row.USUARIO_ACTU;
				case "ESTACION_ACTU":
					return row.ESTACION_ACTU;
				case "FECHA_ACTU":
					return row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm");
				default:
					return null;
			}
		}

		private static IEnumerable<string> GetDistritoSearchValues(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView row)
		{
			yield return row.CORR_DISTRITO.ToString();
			yield return row.NOMBRE_DISTRITO;
		}

		private static string GetDistritoColumnValue(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView row, string columnName)
		{
			switch (columnName)
			{
				case "CORR_DISTRITO":
					return row.CORR_DISTRITO.ToString();
				case "NOMBRE_DISTRITO":
					return row.NOMBRE_DISTRITO;
				case "USUARIO_CREA":
					return row.USUARIO_CREA;
				case "ESTACION_CREA":
					return row.ESTACION_CREA;
				case "FECHA_CREA":
					return row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm");
				case "USUARIO_ACTU":
					return row.USUARIO_ACTU;
				case "ESTACION_ACTU":
					return row.ESTACION_ACTU;
				case "FECHA_ACTU":
					return row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm");
				default:
					return null;
			}
		}

		private static bool Contains(string value, string search)
		{
			return !string.IsNullOrWhiteSpace(value) &&
				value.Contains(search, StringComparison.OrdinalIgnoreCase);
		}

		private static bool IsAllowedPaisField(string fieldName) =>
			fieldName is "NOMBRE_PAIS" or "CODIGO_PAIS" or "NACIONALIDAD" or "NOMBRE_CORTO";

		private static bool IsAllowedDeptoField(string fieldName) =>
			fieldName is "NOMBRE_DEPTO" or "CODIGO_DEPTO";

		private static bool IsAllowedMunicipioField(string fieldName) =>
			fieldName is "NOMBRE_MUNICIPIO" or "CODIGO_MUNICIPIO";

		private static bool IsAllowedDistritoField(string fieldName) =>
			fieldName is "NOMBRE_DISTRITO";

		private async Task<bool> ExistsByQueryAsync(string sql, List<CParameter> parameters)
		{
			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, parameters);
				var exists = reader.Read();
				reader.Close();
				return exists;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		private async Task<CResult> ReadAllAsync<TView>(string viewName, List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(viewName, xWhere);
				var response = new List<TView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		private async Task<CResult> ReadOneAsync<TView>(string viewName, List<CParameter> xWhere, Func<TView, int> codeSelector)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(viewName, xWhere);
				var response = new List<TView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response == null ? 0 : codeSelector(response);
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
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

		private async Task<CResult> SaveInsertAsync<TView>(string tableName, List<CParameter> p, string corrField, List<CParameter> pWhere, Func<System.Data.Common.DbDataReader, TView> map, Func<TView, int> codeSelector)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.Insert(tableName, p, corrField, pWhere);
				var response = map(reader);

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = codeSelector(response);
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				var duplicateKey = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = duplicateKey ? 2627 : -1;
				objResultado.ErrorMessage = duplicateKey
					? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private async Task<CResult> SaveUpdateAsync<TView>(string tableName, List<CParameter> p, List<CParameter> pWhere, Func<System.Data.Common.DbDataReader, TView> map, int codeHelper)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.Update(tableName, p, pWhere);
				var response = map(reader);

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = codeHelper;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				var duplicateKey = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = duplicateKey ? 2627 : -1;
				objResultado.ErrorMessage = duplicateKey
					? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private async Task<CResult> SaveDeleteAsync(string tableName, List<CParameter> pWhere, int codeHelper, string fkMessage)
		{
			CResult objResultado = new();

			try
			{
				objResultado.RowsAffected = (int)await objData.Delete(tableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = codeHelper;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = fkMessage;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}
