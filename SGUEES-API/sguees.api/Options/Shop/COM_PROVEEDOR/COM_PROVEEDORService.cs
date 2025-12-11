using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_PROVEEDORService: ICOM_PROVEEDORService
	{
		private readonly ICOM_PROVEEDORRepository _repo;
		private readonly ICOM_PARAMETRORepository _repoParametro;

		
		public COM_PROVEEDORService(ICOM_PROVEEDORRepository repo, ICOM_PARAMETRORepository repoParametro)
		{
			_repo = repo;
			_repoParametro = repoParametro;
		}
		
		public async Task<CResult> GetAllAsync(COM_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_PROVEEDOR",Value=xWhere.CORR_PROVEEDOR,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> GetProveedorActuAsync(COM_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="@LOGIN_SISTEMA",Value=xWhere.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
			};

			return await _repo.GetProveedorActuAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateConEnvioCorreoAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION,int CORR_EMPRESA,string UserName)
		{
			var vResultado =await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

			if (vResultado.Result)
			{
				vResultado = await EnviarCorreoNotificaProveedorCotizarAsync(Data, vLOGIN_SISTEMA,CORR_EMPRESA,UserName);
			}
			return vResultado;
		}
		
		public async Task<CResult> DeleteAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> EnviarCorreoNotificaProveedorCotizarAsync(COM_PROVEEDORTable Data,string vLOGIN_SISTEMA,int CORR_EMPRESA,string UserName)
		{
			var vResultado = new CResult()
			{
				Result = false,
				Data = null,
				ErrorSource = "EnviarCorreoAsync()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0,
			};

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			var vResultadoCorreo = await _repo.GetCorreoUsuarioOpcionComProveedorAsync(p);
			if (!vResultadoCorreo.Result)
			{
				return vResultado;
			}
			var vDataCorreo=(SEG_USUARIOView)vResultadoCorreo.Data;

			var vResultadoParametros = await _repoParametro.GetAsync(p);
			var vDataParametros = (COM_PARAMETROView)vResultadoParametros.Data;

			// Si no hay correo, no se intenta enviar
			if (vDataCorreo.CORREO_ELECTRONICO == "" || vDataCorreo.CORREO_ELECTRONICO == null)
			{
				vResultado.Result = true;
				vResultado.CodeHelper = Data.CORR_PROVEEDOR;
				vResultado.RowsAffected = 1;

				return vResultado;
			}

			var vMessage = "<p><strong>Validacion de Información</strong></p>";
			vMessage += "<p>El Usuario: <strong>" + UserName+ "</strong>"+" actualizo los datos del proveedor " +"<strong>" + vLOGIN_SISTEMA+ "</strong></p>";
			vMessage += "<p>Por favor validar esta información</p>";

			var vCuerpo = CRoutines.BodyEmailUEES(vMessage);
			var vAsunto = " Actualizacion de informacion del proveedor" + Data.NOMBRE_PROVEEDOR;
			var vTo = new List<ToEMail>();
			var vToList = vDataCorreo.CORREO_ELECTRONICO.Split(",");
			foreach (var item in vToList)
			{
				vTo.Add(new() {
					Name = item.Trim(),
					Address = item.Trim()
				});
			}

			var vSettig = new MailSetting
			{
				Host = vDataParametros.SERVIDOR_CORREO,
				Port = vDataParametros.PUERTO_CORREO,
				UseSSL = vDataParametros.USA_SSL_CORREO,
				User = vDataParametros.USUARIO_REMITENTE,
				Password = vDataParametros.CONTRASENA_REMITENTE,
				FromName = vDataParametros.USUARIO_REMITENTE,
				FromAddress = vDataParametros.CORREO_REMITENTE,
				BodyType = "html"
			};

			var vResultadoSend = CRoutines.SendEmail(vAsunto, vCuerpo, vTo, vSettig);
			if (!vResultadoSend.Result)
			{
				vResultado.ErrorCode = 30000;
				vResultado.ErrorMessage = "Error al enviar correo";

				return vResultado;
			}

			return vResultado;
		}
		public async Task<CResult> GetProveedoresAsync(COM_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>();
			// p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
		
			return await _repo.GetAllLookUpAsync(p);
		}
		public async Task<CResult> GetProveedoresComprasAsync(COM_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>();
			// p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
		
			return await _repo.GetAllLookUpProvComAsync(p);
		}
	}
}
