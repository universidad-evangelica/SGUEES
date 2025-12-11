using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_COTIZACIONService: ICOM_COTIZACIONService
	{
		private readonly ICOM_COTIZACIONRepository _repo;
		private readonly ICOM_COTIZACION_DETARepository _repoDeta;
		
		public COM_COTIZACIONService(ICOM_COTIZACIONRepository repo
		, ICOM_COTIZACION_DETARepository repoDeta
		)
		{
			_repo = repo;
			_repoDeta = repoDeta;	
		}
		
		public async Task<CResult> GetAllAsync(COM_COTIZACIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="@TIPO_CONSULTA",Value=1,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="@CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="@LOGIN_SISTEMA",Value=xWhere.LOGIN_SISTEMA,DbType=System.Data.DbType.String},
				new CParameter() {ParameterName="@OPCION_CONSULTA",Value=0,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_COTIZACIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_COTIZACION",Value=xWhere.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		#region  "Deta"
			public async Task<CResult> GetAllCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETAParam xWhere)
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "CORR_COTIZACION", Value = xWhere.CORR_COTIZACION, DbType = System.Data.DbType.Int32 });
				return await _repoDeta.GetAllAsync(p);
			}

			public async Task<CResult> GetCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETAParam xWhere)
			{
				var p = new List<CParameter>();
				p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "CORR_COTIZACION", Value = xWhere.CORR_COTIZACION, DbType = System.Data.DbType.Int32 });
				p.Add(new CParameter() { ParameterName = "CORR_COTIZACION_DETA", Value = xWhere.CORR_COTIZACION_DETA, DbType = System.Data.DbType.Int32 });

				return await _repoDeta.GetAsync(p);
			}

			public async Task<CResult> CreateCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			{
				return await _repoDeta.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
			}

			public async Task<CResult> UpdateCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			{
				return await _repoDeta.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
			}

			public async Task<CResult> DeleteCOM_COTIZACION_DETAAsync(COM_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			{
				return await _repoDeta.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
			}
		#endregion

		public async Task<CResult> AplicarAsync(COM_COTIZACIONTable Data)
		{
			var vResultado = new CResult()
			{
				Result = false,
				Data = null,
				ErrorSource = "SolicitarAsync()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0,
			};

			//Aplicar
			var vResultadoAplicar = await _repo.AplicarAsync(Data);
			if (!vResultadoAplicar.Result)
			{
				return vResultadoAplicar;
			}

			var vDataCotiza = new COM_COTIZACIONParam()
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				ANIO_PERIODO = Data.ANIO_PERIODO,
				CORR_COTIZACION = Data.CORR_COTIZACION
			};

			//Enviar por correo
			vResultado = await EnviarCorreoNotificaGestorCotizarAsync(vDataCotiza);

			return vResultadoAplicar;
		}

		public async Task<CResult> EnviarCorreoNotificaGestorCotizarAsync(COM_COTIZACIONParam Data)
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
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
			};
			var vResultadoCorreo = await _repo.GetCorreoCotizaAplicarAsync(p);
			if (!vResultadoCorreo.Result)
			{
				return vResultado;
			}

			var vDataCorreo = (COM_COTIZACION_CORREOView)vResultadoCorreo.Data;

			// Si no hay correo, no se intenta enviar
			if (vDataCorreo.CORREO_ELECTRONICO == "" || vDataCorreo.CORREO_ELECTRONICO == null)
			{
				vResultado.Result = true;
				vResultado.CodeHelper = Data.CORR_COTIZACION;
				vResultado.RowsAffected = 1;

				return vResultado;
			}

			var vMessage = "<p><strong>Estimado Gestor, el proveedor:</strong></p>";
			vMessage += "<p>" + vDataCorreo.NOMBRE_PROVEEDOR + "</p>";
			vMessage += "<p>Completó la cotización <strong>No. " + vDataCorreo.ANIO_PERIODO.ToString() + "-" + vDataCorreo.CORR_COTIZACION.ToString() + "</strong></p>";
			vMessage += "<p>Emitida el <strong>" + vDataCorreo.FECHA_COTIZACION.ToString("dd/MM/yyyy") + "</strong></p>";
			vMessage += "<p>Observaciones: <strong>" + vDataCorreo.OBSERVACIONES + "</strong></p>";

			var vCuerpo = CRoutines.BodyEmailUEES(vMessage);
			var vAsunto = vDataCorreo.NOMBRE_PROVEEDOR + " Cotización No." + vDataCorreo.ANIO_PERIODO.ToString()+"-"+vDataCorreo.CORR_COTIZACION.ToString();
			var vTo = new List<ToEMail>();
			var vToCC = new List<ToEMail>();
			var vToList = vDataCorreo.CORREO_ELECTRONICO.Split(",");
			// var vToListCC = vDataCorreo.CORREO_ELECTRONICO_CCO.Split(",");
			foreach (var item in vToList)
			{
				if (item.Trim() != "") 
				{
					vTo.Add(new() {
					Name = item.Trim(),
					Address = item.Trim()
					});
				}
			}

			// foreach (var item in vToListCC)
			// {
			// 	if (item.Trim() != "") 
			// 	{
			// 		vToCC.Add(new() {
			// 		Name = item.Trim(),
			// 		Address = item.Trim()
			// 		});
			// 	}
			// }

			var vSettig = new MailSetting
			{
				Host = vDataCorreo.SERVIDOR_CORREO,
				Port = vDataCorreo.PUERTO_CORREO,
				UseSSL = vDataCorreo.USA_SSL_CORREO,
				User = vDataCorreo.USUARIO_REMITENTE,
				Password = vDataCorreo.CONTRASENA_REMITENTE,
				FromName = vDataCorreo.USUARIO_REMITENTE,
				FromAddress = vDataCorreo.CORREO_REMITENTE,
				BodyType = "html"
			};

			var vResultadoSend = CRoutines.SendEmail(vAsunto, vCuerpo, vTo, vSettig, null, vToCC);
			if (!vResultadoSend.Result)
			{
				vResultado.ErrorCode = 30000;
				vResultado.ErrorMessage = "Error al enviar correo";

				return vResultado;
			}

			return vResultado;
		}
	}
}
