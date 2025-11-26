using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;
using System.Collections;
using System.Text.Json;
using System.IO;

namespace scuees.Services
{
	public class COM_JSONService : ICOM_JSONService
	{
		private readonly ICOM_JSONRepository _repo;
        private readonly ISEG_USUARIOService _repoUser;
		private readonly ICOM_PARAMETRORepository _repoParametro;
		private readonly IGEN_PARAMETRORepository _repoGenParametro;
		private readonly IGEN_DOCUMENTO_FISICORepository _repoGenDocumentoFisico;
		private readonly ICOM_JSON_DOCRepository _repoDoc;
		public COM_JSONService(
			ICOM_JSONRepository repo,
            ISEG_USUARIOService repoUser,
			ICOM_PARAMETRORepository repoParametro,
			IGEN_PARAMETRORepository repoGenParametro,
			IGEN_DOCUMENTO_FISICORepository repoGenDocumentoFisico,
			ICOM_JSON_DOCRepository repoDoc
			)
		{
			_repo = repo;
			_repoUser = repoUser;
			_repoParametro = repoParametro;
			_repoGenParametro = repoGenParametro;
			_repoGenDocumentoFisico = repoGenDocumentoFisico;
			_repoDoc = repoDoc;
		}
		public async Task<CResult> COM_JSON_GENERAR_CCFE(COM_JSON_DTE_CCFE Data,int CORR_EMPRESA)
		{
			var Resultado = new CResult
			{
				Result = false,
				Data = null,
				ErrorSource = "EnviarCorreoAsync()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0
			};

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			var vResultadoParametro= await _repoParametro.GetAsync(p);
			var vDataParametros= (COM_PARAMETROView)vResultadoParametro.Data;

			SEG_USUARIO_LOGINParam DataLogin = new SEG_USUARIO_LOGINParam
			{
				LOGIN_SISTEMA = vDataParametros.USUARIO_FE,
				CLAVE_USUARIO = vDataParametros.CLAVE_FE,
				CODIGO_SUITE = vDataParametros.CODIGO_SUITE_FE
			};
			var vResultLogin = await _repo.Login(DataLogin);
			SEG_USUARIO_LOGINView vDataLogin = vResultLogin.Data;
			if(!vResultLogin.Result)
			{
				Resultado.Result = false;
				Resultado.Data = null;
				Resultado.ErrorSource = "COM_JSON_GENERAR_CCFE()";
				Resultado.ErrorCode = 0;
				Resultado.ErrorMessage = "Error al intentar iniciar sesión en el sistema de facturación electrónica";
				Resultado.CodeHelper = 0;
				Resultado.RowsAffected = 0;
				return Resultado;
			}

			string Token = vDataLogin.TOKEN;
			var vResultado = await _repo.COM_JSON_GENERAR_CCFE(Data, Token);
			Resultado.Result = vResultado.Result;
			Resultado.Data = vResultado.Data;
			Resultado.ErrorSource = vResultado.ErrorSource;
			Resultado.ErrorCode = vResultado.ErrorCode;
			Resultado.ErrorMessage = vResultado.ErrorMessage;
			Resultado.CodeHelper = vResultado.CodeHelper;
			Resultado.RowsAffected = vResultado.RowsAffected;
			return Resultado;
		}
		public async Task<CResult> COM_JSON_GENERAR_FE(COM_JSON_DTE_FE Data,int CORR_EMPRESA)
		{
			var Resultado = new CResult
			{
				Result = false,
				Data = null,
				ErrorSource = "COM_JSON_GENERAR_FE()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0
			};

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			var vResultadoParametro= await _repoParametro.GetAsync(p);
			var vDataParametros= (COM_PARAMETROView)vResultadoParametro.Data;

			SEG_USUARIO_LOGINParam DataLogin = new SEG_USUARIO_LOGINParam
			{
				LOGIN_SISTEMA = vDataParametros.USUARIO_FE,
				CLAVE_USUARIO = vDataParametros.CLAVE_FE,
				CODIGO_SUITE = vDataParametros.CODIGO_SUITE_FE
			};
			var vResultLogin = await _repo.Login(DataLogin);
			SEG_USUARIO_LOGINView vDataLogin = vResultLogin.Data;
			if(!vResultLogin.Result)
			{
				Resultado.Result = false;
				Resultado.Data = null;
				Resultado.ErrorSource = "COM_JSON_GENERAR_CCFE()";
				Resultado.ErrorCode = 0;
				Resultado.ErrorMessage = "Error al intentar iniciar sesión en el sistema de facturación electrónica";
				Resultado.CodeHelper = 0;
				Resultado.RowsAffected = 0;
				return Resultado;
			}

			string Token = vDataLogin.TOKEN;
			var vResultado = await _repo.COM_JSON_GENERAR_FE(Data, Token);
			Resultado.Result = vResultado.Result;
			Resultado.Data = vResultado.Data;
			Resultado.ErrorSource = vResultado.ErrorSource;
			Resultado.ErrorCode = vResultado.ErrorCode;
			Resultado.ErrorMessage = vResultado.ErrorMessage;
			Resultado.CodeHelper = vResultado.CodeHelper;
			Resultado.RowsAffected = vResultado.RowsAffected;
			return Resultado;

		}
		public async Task<CResult> PostPDFAsync(COM_JSON_DOC_PDFTable Data,int CORR_EMPRESA)
		{
			var Resultado = new CResult
			{
				Result = false,
				Data = null,
				ErrorSource = "PostPDF()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0
			};
			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			var vResultadoParametro= await _repoParametro.GetAsync(p);
			var vDataParametros= (COM_PARAMETROView)vResultadoParametro.Data;

			SEG_USUARIO_LOGINParam DataLogin = new()
            {
				LOGIN_SISTEMA = vDataParametros.USUARIO_FE,
				CLAVE_USUARIO = vDataParametros.CLAVE_FE,
				CODIGO_SUITE = vDataParametros.CODIGO_SUITE_FE
			};
			var vResultLogin = await _repo.Login(DataLogin);
			SEG_USUARIO_LOGINView vDataLogin = vResultLogin.Data;
			if(!vResultLogin.Result)
			{
				Resultado.Result = false;
				Resultado.Data = null;
				Resultado.ErrorCode = 0;
				Resultado.ErrorMessage = "Error al intentar iniciar sesión en el sistema de facturación electrónica";
				Resultado.CodeHelper = 0;
				Resultado.RowsAffected = 0;
				return Resultado;
			}

			string Token = vDataLogin.TOKEN;
			var vResultado = await _repo.PostPDFDesktop(Data, Token);
			Resultado.Result = vResultado.Result;
			Resultado.Data = vResultado.Data;
			Resultado.ErrorSource = vResultado.ErrorSource;
			Resultado.ErrorCode = vResultado.ErrorCode;
			Resultado.ErrorMessage = vResultado.ErrorMessage;
			Resultado.CodeHelper = vResultado.CodeHelper;
			Resultado.RowsAffected = vResultado.RowsAffected;
			return Resultado;
		}
		
		public async Task<CResult> CreateDocAsync(COM_JSON_DOC_PDFTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vResultado = new CResult()
			{
				ErrorCode = 0,
				ErrorMessage = "",
				ErrorSource = "",
				Result = false,
				CodeHelper = 0,
				RowsAffected = 0,
				Data = null
			};

			if (Data.FOTO_DOCUMENTO.Length <= 0)
			{
				vResultado.Result = false;
				vResultado.ErrorCode = 30000;
				vResultado.ErrorMessage = "Error al leer archivo";
				vResultado.ErrorSource = "CreatePDFAsync()";
				return vResultado;
			}

			// Guardar documento
			var Doc = new GEN_DOCUMENTO_FISICOTable
			{
				CORR_SUSCRIPCION = Data.CORR_SUSCRIPCION,
				CORR_CONFI_PAIS = Data.CORR_CONFI_PAIS,
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_DOCUMENTO = Data.CORR_DOCUMENTO,
				NOMBRE_DOCUMENTO = Data.NOMBRE_DOCUMENTO,
				DESCRIPCION_DOCUMENTO = Data.DESCRIPCION_DOCUMENTO,
				CORR_TIPO_DOCUMENTO = Data.CORR_TIPO_DOCUMENTO,
				RUTA_DOCUMENTO = "", //Actualizando posteriormente
				NOMBRE_ARCHIVO = Data.NOMBRE_ARCHIVO,
				USUARIO_CREA = Data.USUARIO_CREA,
				FECHA_CREA = Data.FECHA_CREA,
				ESTACION_CREA = Data.ESTACION_CREA,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU
			};
			vResultado = await _repoGenDocumentoFisico.CreateAsync(Doc, vLOGIN_SISTEMA, vESTACION);

			if (vResultado.Result == false)
			{
				return vResultado;
			}
			Doc.CORR_DOCUMENTO = ((GEN_DOCUMENTO_FISICOView)vResultado.Data).CORR_DOCUMENTO;

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32}
			};

			// Estableciendo ruta del documento
			var vResultadoParam = await _repoGenParametro.GetAsync(p);
			if (vResultado.Result == false)
			{
				vResultado.ErrorCode = 30002;
				vResultado.ErrorMessage = vResultadoParam.ErrorMessage;
				vResultado.ErrorSource = vResultadoParam.ErrorSource;
				return vResultado;
			}

			var vRUTA_DOCUMENTO = "";
			try
			{
				vRUTA_DOCUMENTO = Path.Combine(((GEN_PARAMETROView)vResultadoParam.Data).URL_DOCUMENTO, 
														((GEN_DOCUMENTO_FISICOView)vResultado.Data).CORR_EMPRESA.ToString() + "-" +
														((GEN_DOCUMENTO_FISICOView)vResultado.Data).CORR_DOCUMENTO.ToString() +
														Path.GetExtension(Data.NOMBRE_ARCHIVO));
			}
			catch (Exception e)
			{
				vResultado.Result = false;
				vResultado.ErrorCode = 30003;
				vResultado.ErrorMessage = e.Message;
				vResultado.ErrorSource = e.Source;
				return vResultado;
			}

			// Guardar Archivo
			try
			{
				using var ms = new MemoryStream();
				Data.FOTO_DOCUMENTO.CopyTo(ms);
				using FileStream file = new(vRUTA_DOCUMENTO, FileMode.Create, FileAccess.Write);
				ms.WriteTo(file);

				file.Close();
				ms.Close();
				ms.Dispose();
				file.Dispose();
			}
			catch (Exception e)
			{
				vResultado.Result = false;
				vResultado.ErrorCode = 30001;
				vResultado.ErrorMessage = e.Message;
				vResultado.ErrorSource = e.Source;
				return vResultado;
			}

			// Actualizando la ruta del documento
			Doc.RUTA_DOCUMENTO = vRUTA_DOCUMENTO;
			vResultado = await _repoGenDocumentoFisico.UpdateRutaAsync(Doc, vLOGIN_SISTEMA, vESTACION);
			if (vResultado.Result == false)
			{
				return vResultado;
			}

			// Guardar relación documento fisico con documento de compras
			if (vResultado.Result)
			{
				var Solidoc = new COM_JSON_DOCTable
				{
					CORR_EMPRESA = Data.CORR_EMPRESA,
					CORR_DOCUMENTO = Data.CORR_DOCUMENTO,
					CORR_DOCUMENTO_DOC = ((GEN_DOCUMENTO_FISICOView)vResultado.Data).CORR_DOCUMENTO
				};

				vResultado = await _repoDoc.DeleteAsync(Solidoc, vLOGIN_SISTEMA, vESTACION);
				if (vResultado.Result)
				{
					vResultado = await _repoDoc.CreateAsync(Solidoc, vLOGIN_SISTEMA, vESTACION);
				}
				else
				{
					vResultado.ErrorCode = 30002;
					vResultado.ErrorMessage = "Error al eliminar la vinculación con el documento";
					vResultado.ErrorSource = "CreatePDFAsync()";
					return vResultado;
				}
			}

			return vResultado;
		}

		public async Task<Stream> GetDocAsync(COM_JSON_DOCParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_DOCUMENTO_FE",Value=xWhere.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32},
			};

			var vResultado = await _repoGenDocumentoFisico.GetAsync(p);

			if (!vResultado.Result)
			{
				return null;
			}

			try
			{
				MemoryStream ms = new();
				using FileStream file = new(((GEN_DOCUMENTO_FISICOView)vResultado.Data).RUTA_DOCUMENTO, FileMode.Open, FileAccess.Read);
				byte[] bytes = new byte[file.Length];
				file.Read(bytes, 0, (int)file.Length);
				ms.Write(bytes, 0, (int)file.Length);
				ms.Seek(0, SeekOrigin.Begin);
				return ms;
			}
			catch (Exception)
			{
				return null;
			}
		}

		public async Task<CResult> COM_JSON_GENERAR_DCLE(COM_JSON_DTE_DCLE Data,int CORR_EMPRESA)
		{
			var Resultado = new CResult
			{
				Result = false,
				Data = null,
				ErrorSource = "COM_JSON_GENERAR_DCLE()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0
			};

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			var vResultadoParametro= await _repoParametro.GetAsync(p);
			var vDataParametros= (COM_PARAMETROView)vResultadoParametro.Data;

			SEG_USUARIO_LOGINParam DataLogin = new SEG_USUARIO_LOGINParam
			{
				LOGIN_SISTEMA = vDataParametros.USUARIO_FE,
				CLAVE_USUARIO = vDataParametros.CLAVE_FE,
				CODIGO_SUITE = vDataParametros.CODIGO_SUITE_FE
			};
			var vResultLogin = await _repo.Login(DataLogin);
			SEG_USUARIO_LOGINView vDataLogin = vResultLogin.Data;
			if(!vResultLogin.Result)
			{
				Resultado.Result = false;
				Resultado.Data = null;
				Resultado.ErrorSource = "COM_JSON_GENERAR_DCLE()";
				Resultado.ErrorCode = 0;
				Resultado.ErrorMessage = "Error al intentar iniciar sesión en el sistema de facturación electrónica";
				Resultado.CodeHelper = 0;
				Resultado.RowsAffected = 0;
				return Resultado;
			}

			string Token = vDataLogin.TOKEN;
			var vResultado = await _repo.COM_JSON_GENERAR_DCLE(Data, Token);
			Resultado.Result = vResultado.Result;
			Resultado.Data = vResultado.Data;
			Resultado.ErrorSource = vResultado.ErrorSource;
			Resultado.ErrorCode = vResultado.ErrorCode;
			Resultado.ErrorMessage = vResultado.ErrorMessage;
			Resultado.CodeHelper = vResultado.CodeHelper;
			Resultado.RowsAffected = vResultado.RowsAffected;
			return Resultado;
		}
	}

}
