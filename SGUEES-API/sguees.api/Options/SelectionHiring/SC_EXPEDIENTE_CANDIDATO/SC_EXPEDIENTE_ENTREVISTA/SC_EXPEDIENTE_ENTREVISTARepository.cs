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
	public class SC_EXPEDIENTE_ENTREVISTARepository : BaseRepository<SC_EXPEDIENTE_ENTREVISTATable>, ISC_EXPEDIENTE_ENTREVISTARepository
	{
		private const string _TableName = "SC_EXPEDIENTE_ENTREVISTA";
		private const string _ViewName = "V_SC_EXPEDIENTE_ENTREVISTA";

		public SC_EXPEDIENTE_ENTREVISTARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<SC_EXPEDIENTE_ENTREVISTAView>().FromDataReader(reader)
					.OrderByDescending(x => x.FECHA_ENTREVISTA)
					.ThenByDescending(x => x.CORR_EXPEDIENTE_ENTREVISTA)
					.ToList();

				reader.Close();

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

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<SC_EXPEDIENTE_ENTREVISTAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_EXPEDIENTE_ENTREVISTA ?? 0;
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

		public async Task<CResult> CreateAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_ENTREVISTA", Value = Data.CORR_EXPEDIENTE_ENTREVISTA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = Data.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "TIPO_ENTREVISTA", Value = Data.TIPO_ENTREVISTA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ENTREVISTA", Value = Data.FECHA_ENTREVISTA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "ENTREVISTADOR", Value = Data.ENTREVISTADOR, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTADO_ENTREVISTA", Value = Data.ESTADO_ENTREVISTA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "RESULTADO_ENTREVISTA", Value = Data.RESULTADO_ENTREVISTA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "RESUMEN_ENTREVISTA", Value = Data.RESUMEN_ENTREVISTA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_EXPEDIENTE_ENTREVISTA", pWhere);
				var response = new List<SC_EXPEDIENTE_ENTREVISTAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_EXPEDIENTE_ENTREVISTA ?? 0;
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

		public async Task<CResult> UpdateAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = Data.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "TIPO_ENTREVISTA", Value = Data.TIPO_ENTREVISTA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ENTREVISTA", Value = Data.FECHA_ENTREVISTA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "ENTREVISTADOR", Value = Data.ENTREVISTADOR, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTADO_ENTREVISTA", Value = Data.ESTADO_ENTREVISTA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "RESULTADO_ENTREVISTA", Value = Data.RESULTADO_ENTREVISTA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "RESUMEN_ENTREVISTA", Value = Data.RESUMEN_ENTREVISTA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_ENTREVISTA", Value = Data.CORR_EXPEDIENTE_ENTREVISTA, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<SC_EXPEDIENTE_ENTREVISTAView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_EXPEDIENTE_ENTREVISTA ?? Data.CORR_EXPEDIENTE_ENTREVISTA;
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

		public async Task<CResult> DeleteAsync(SC_EXPEDIENTE_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = Data.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_EXPEDIENTE_ENTREVISTA", Value = Data.CORR_EXPEDIENTE_ENTREVISTA, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_EXPEDIENTE_ENTREVISTA;
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
	}
}
