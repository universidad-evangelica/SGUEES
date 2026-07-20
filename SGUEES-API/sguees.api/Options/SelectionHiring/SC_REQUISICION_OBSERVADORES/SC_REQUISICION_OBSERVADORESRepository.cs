using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;
using System.Data;

namespace sguees.Repositories
{
	public class SC_REQUISICION_OBSERVADORESRepository: BaseRepository<SC_REQUISICION_OBSERVADORESTable>, ISC_REQUISICION_OBSERVADORESRepository
	{
		private const string _TableName = "SC_REQUISICION_OBSERVADORES";
		private const string _SpExistsLoginSistema = "PRAL_DATA_SC_REQUISICION_OBSERVADORES_EXISTS_LOGIN";
		private const string _VistaObservadoresRequisicion = "SC_REQUISICION_OBSERVADORES_CORR_REQUISICION_PERSONAL";

        public SC_REQUISICION_OBSERVADORESRepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<SC_REQUISICION_OBSERVADORESView>().FromDataReader(reader).ToList();
				
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
				var response = new List<SC_REQUISICION_OBSERVADORESView>().FromDataReader(reader).FirstOrDefault();
				
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
		
		public async Task<CResult> CreateAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			if (string.IsNullOrWhiteSpace(Data.LOGIN_SISTEMA))
			{
				return ValidationResult(1001, "Debe seleccionar un usuario.");
			}

			if (await ExistsLoginSistemaAsync(
				Data.CORR_EMPRESA,
				Data.CORR_REQUISICION_PERSONAL ?? 0,
				Data.LOGIN_SISTEMA,
				0))
			{
				return ValidationResult(1003, $"El usuario {Data.LOGIN_SISTEMA.Trim()} ya ha sido ingresado como observador.");
			}

            //string _tipoObservador = Data.CORR_REQUISICION_PERSONAL.HasValue && Data.CORR_REQUISICION_PERSONAL.Value > 0 ? "REQUISICION" : "DEFECTO";
            const string tipoObservador = "DEFECTO";

            try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_REQUISICION_PERSONAL",Value=Data.CORR_REQUISICION_PERSONAL,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_REQUISICION_OBSERVADORES",Value=Data.CORR_REQUISICION_OBSERVADORES,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
					new CParameter() {ParameterName="LOGIN_SISTEMA",Value=Data.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="TIPO_OBSERVADOR",Value= tipoObservador, DbType=DbType.String},
                    new CParameter() {ParameterName="FECHA_ASIGNACION",Value=Data.FECHA_ASIGNACION,DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="ACTIVO",Value=true},
                    new CParameter() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
					new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                };
				
				var reader = await objData.Insert(_TableName,p,"CORR_REQUISICION_OBSERVADORES",pWhere);
				var response = new List<SC_REQUISICION_OBSERVADORESView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_REQUISICION_OBSERVADORES;
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
		
		public async Task<CResult> UpdateAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			if (string.IsNullOrWhiteSpace(Data.LOGIN_SISTEMA))
			{
				return ValidationResult(1001, "Debe seleccionar un usuario.");
			}

			if (await ExistsLoginSistemaAsync(
				Data.CORR_EMPRESA,
				Data.CORR_REQUISICION_PERSONAL ?? 0,
				Data.LOGIN_SISTEMA,
				Data.CORR_REQUISICION_OBSERVADORES))
			{
				return ValidationResult(1003, $"El usuario {Data.LOGIN_SISTEMA.Trim()} ya ha sido ingresado como observador.");
			}

            //string _tipoObservador = Data.CORR_REQUISICION_PERSONAL.HasValue && Data.CORR_REQUISICION_PERSONAL.Value > 0 ? "REQUISICION" : "DEFECTO";

            try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="LOGIN_SISTEMA",Value=Data.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
                    //new CParameter() {ParameterName="TIPO_OBSERVADOR", Value="DEFECTO", DbType=DbType.String},
                    new CParameter() {ParameterName="FECHA_ASIGNACION",Value=Data.FECHA_ASIGNACION,DbType=System.Data.DbType.DateTime},
                    //new CParameter() {ParameterName="ACTIVO",Value=true},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
				};
				
				var pWhere = new List<CParameter>
				{
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_REQUISICION_OBSERVADORES",Value=Data.CORR_REQUISICION_OBSERVADORES,DbType=System.Data.DbType.Int32},
                };
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<SC_REQUISICION_OBSERVADORESView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_REQUISICION_OBSERVADORES;
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
		
		public async Task<CResult> DeleteAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_REQUISICION_OBSERVADORES",Value=Data.CORR_REQUISICION_OBSERVADORES,DbType=System.Data.DbType.Int32},
                };
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_REQUISICION_OBSERVADORES;
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

		private async Task<bool> ExistsLoginSistemaAsync(int corrEmpresa, int corrRequisicionPersonal, string loginSistema, int excludeCorr)
		{
			if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(loginSistema))
			{
				return false;
			}

			try
			{
				var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, _SpExistsLoginSistema, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = corrRequisicionPersonal, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = loginSistema.Trim(), DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorr, DbType = System.Data.DbType.Int32 },
				});

				var exists = reader.Read();
				reader.Close();
				return exists;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

        /// <summary>
        /// Lectura de SC_REQUISICION_OBSERVADORES por CORR_REQUISICION_PERSONAL. 
		/// Devuelve los observadores activos por defecto y los de la requisición.
        /// </summary>
        public async Task<CResult> GetAllBy_CORR_REQUISICION_PERSONAL(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
				var reader = await objData.GetDataReader(System.Data.CommandType.Text, @"
				SELECT RO.*, U.NOMBRE_USUARIO
				FROM SC_REQUISICION_OBSERVADORES RO	
				LEFT JOIN SEG_USUARIO U ON LTRIM(RTRIM(U.LOGIN_SISTEMA)) = LTRIM(RTRIM(RO.LOGIN_SISTEMA))
				WHERE RO.CORR_EMPRESA = @CORR_EMPRESA AND RO.ACTIVO = 1 AND 
				((RO.TIPO_OBSERVADOR = 'DEFECTO' AND ISNULL(RO.CORR_REQUISICION_PERSONAL, 0) = 0)
				OR (RO.CORR_REQUISICION_PERSONAL = @CORR_REQUISICION_PERSONAL))", xWhere);

				var response = new List<SC_REQUISICION_OBSERVADORESView>().FromDataReader(reader).ToList();

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
            catch (System.Exception e)
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

		/// <summary>
		/// Alta de observador ligado a una requisición (sc-requisicion-personal).
		/// No usa la relectura de V_ del Insert; después del INSERT consulta con GetAllBy_CORR_REQUISICION_PERSONAL.
		/// </summary>
		public async Task<CResult> CreateBy_CORR_REQUISICION_PERSONAL(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			if (string.IsNullOrWhiteSpace(Data.LOGIN_SISTEMA))
			{
				return ValidationResult(1001, "Debe seleccionar un usuario.");
			}

			if (!Data.CORR_REQUISICION_PERSONAL.HasValue || Data.CORR_REQUISICION_PERSONAL.Value <= 0)
			{
				return ValidationResult(1002, "Debe indicar la requisición de personal.");
			}

			if (await ExistsLoginSistemaAsync(
				Data.CORR_EMPRESA,
				Data.CORR_REQUISICION_PERSONAL.Value,
				Data.LOGIN_SISTEMA,
				0))
			{
				return ValidationResult(1003, $"El usuario {Data.LOGIN_SISTEMA.Trim()} ya ha sido ingresado como observador.");
			}

			const string tipoObservador = "REQUISICION";

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = Data.CORR_REQUISICION_PERSONAL, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "CORR_REQUISICION_OBSERVADORES", Value = Data.CORR_REQUISICION_OBSERVADORES, DbType = DbType.Int32, Direction = ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = DbType.String },
					new CParameter() { ParameterName = "TIPO_OBSERVADOR", Value = tipoObservador, DbType = DbType.String },
					new CParameter() { ParameterName = "FECHA_ASIGNACION", Value = Data.FECHA_ASIGNACION, DbType = DbType.DateTime },
					new CParameter() { ParameterName = "ACTIVO", Value = true },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_REQUISICION_OBSERVADORES", pWhere);
				if (reader != null)
				{
					reader.Close();
					reader = null;
				}

				objData.objConnection.Close();

				var identityParam = p.FirstOrDefault(x => x.ParameterName == "CORR_REQUISICION_OBSERVADORES");
				var newCorr = identityParam?.Value != null && identityParam.Value != DBNull.Value
					? Convert.ToInt32(identityParam.Value)
					: 0;

				var listado = await GetAllBy_CORR_REQUISICION_PERSONAL(new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = Data.CORR_REQUISICION_PERSONAL, DbType = DbType.Int32 },
				});

				if (!listado.Result)
				{
					return listado;
				}

				objResultado.Data = listado.Data;
				objResultado.Result = true;
				objResultado.RowsAffected = listado.RowsAffected;
				objResultado.CodeHelper = newCorr;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = 5000;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				if (objData.objConnection != null && objData.objConnection.State != ConnectionState.Closed)
				{
					objData.objConnection.Close();
				}
			}

			return objResultado;
		}

        private static CResult ValidationResult(int errorCode, string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = errorCode,
				ErrorMessage = message,
				ErrorSource = "[SC_REQUISICION_OBSERVADORESRepository]",
				RowsAffected = 0
			};
		}
	}
}
