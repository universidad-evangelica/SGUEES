using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_CUENTA_BANCARIARepository : BaseRepository<BAN_CUENTA_BANCARIATable>, IBAN_CUENTA_BANCARIARepository
	{
		private const string _TableName = "BAN_CUENTA_BANCARIA";
		private const string _ViewName = "V_BAN_CUENTA_BANCARIA";
		private const string _CampoPk = "CORR_CUENTA_BANCO";
		private const string _CampoEstado = "ESTADO_CUENTA_BANCARIA";
		private const bool _UsaEmpresa = true;

		public BAN_CUENTA_BANCARIARepository(IConfiguration config) :
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value) { }

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<BAN_CUENTA_BANCARIAView>().FromDataReader(reader).ToList();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true;
				objResultado.RowsAffected = response.Count; objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = ""; objResultado.ErrorSource = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<BAN_CUENTA_BANCARIAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.ErrorCode = 0; objResultado.ErrorMessage = "";
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUENTA_BANCO",Value=Data.CORR_CUENTA_BANCO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="NUMERO_CUENTA_BANCO",Value=Data.NUMERO_CUENTA_BANCO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_BANCO",Value=Data.CORR_BANCO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_REPORTE",Value=Data.NOMBRE_REPORTE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TIPO_CUENTA_BANCO",Value=Data.TIPO_CUENTA_BANCO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_MONEDA",Value=Data.CORR_MONEDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CODIGO_EMPRESARIAL",Value=Data.CODIGO_EMPRESARIAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_EMPRESARIAL_PROV",Value=Data.CODIGO_EMPRESARIAL_PROV,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NO_PERMITE_MODIFICAR",Value=Data.NO_PERMITE_MODIFICAR,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="VALIDAR_SALDO",Value=Data.VALIDAR_SALDO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PAGA_PLANILLA",Value=Data.PAGA_PLANILLA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="VALIDA_FECHA",Value=Data.VALIDA_FECHA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NOMBRE_CUENTA",Value=Data.NOMBRE_CUENTA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NO_PERMITE_CHEQUES",Value=Data.NO_PERMITE_CHEQUES,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="ESTADO_CUENTA_BANCARIA",Value=Data.ESTADO_CUENTA_BANCARIA ?? true,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="USA_TRANSACIONES_UNI",Value=Data.USA_TRANSACIONES_UNI,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="CLASE_CHEQUE",Value=Data.CLASE_CHEQUE,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Insert(_TableName, p, "CORR_CUENTA_BANCO", pWhere);
				var response = new List<BAN_CUENTA_BANCARIAView>().FromDataReader(reader).FirstOrDefault();
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_CUENTA_BANCO ?? 0;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="NUMERO_CUENTA_BANCO",Value=Data.NUMERO_CUENTA_BANCO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_BANCO",Value=Data.CORR_BANCO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CUENTA_CONTABLE",Value=Data.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NOMBRE_REPORTE",Value=Data.NOMBRE_REPORTE,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TIPO_CUENTA_BANCO",Value=Data.TIPO_CUENTA_BANCO,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=Data.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_MONEDA",Value=Data.CORR_MONEDA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CODIGO_EMPRESARIAL",Value=Data.CODIGO_EMPRESARIAL,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="CODIGO_EMPRESARIAL_PROV",Value=Data.CODIGO_EMPRESARIAL_PROV,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NO_PERMITE_MODIFICAR",Value=Data.NO_PERMITE_MODIFICAR,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="VALIDAR_SALDO",Value=Data.VALIDAR_SALDO,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="PAGA_PLANILLA",Value=Data.PAGA_PLANILLA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="VALIDA_FECHA",Value=Data.VALIDA_FECHA,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="NOMBRE_CUENTA",Value=Data.NOMBRE_CUENTA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="NO_PERMITE_CHEQUES",Value=Data.NO_PERMITE_CHEQUES,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="USA_TRANSACIONES_UNI",Value=Data.USA_TRANSACIONES_UNI,DbType=System.Data.DbType.Boolean},
					new CParameter() {ParameterName="CLASE_CHEQUE",Value=Data.CLASE_CHEQUE,DbType=System.Data.DbType.String},
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUENTA_BANCO",Value=Data.CORR_CUENTA_BANCO,DbType=System.Data.DbType.Int32},
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				var response = new List<BAN_CUENTA_BANCARIAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close(); reader = null;
				objResultado.Data = response; objResultado.Result = true; objResultado.RowsAffected = 1;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_CUENTA_BANCO",Value=Data.CORR_CUENTA_BANCO,DbType=System.Data.DbType.Int32},
				};
				await objData.Delete(_TableName, pWhere);
				objResultado.Data = null; objResultado.Result = true; objResultado.RowsAffected = 1;
			}
			catch (System.Exception e) { objResultado.Data = null; objResultado.Result = false; objResultado.ErrorCode = -1; objResultado.ErrorMessage = e.Message; }
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> ActivarInactivarAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};

				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var xWhere = new List<CParameter>
					{
						new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new CParameter() { ParameterName = "CORR_CUENTA_BANCO", Value = Data.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
					};

					var readerGet = await objData.GetDataReader(_ViewName, xWhere);
					var response = new List<BAN_CUENTA_BANCARIAView>().FromDataReader(readerGet).FirstOrDefault();

					readerGet.Close();

					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_CUENTA_BANCO ?? Data.CORR_CUENTA_BANCO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_CUENTA_BANCO;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
				}
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = Data.CORR_CUENTA_BANCO;
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
