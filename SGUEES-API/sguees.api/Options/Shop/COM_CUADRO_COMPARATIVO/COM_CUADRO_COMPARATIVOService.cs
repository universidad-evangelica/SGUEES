using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_CUADRO_COMPARATIVOService: ICOM_CUADRO_COMPARATIVOService
	{
		private readonly ICOM_CUADRO_COMPARATIVORepository _repo;
		private readonly ICOM_CUADRO_COMPARATIVO_DETARepository _repoDeta;
		private readonly ICOM_REPORepository _repoRepo;
		private readonly ISEG_USUARIOService _repoUser;
		private readonly ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository _repoDetaOrdenCompra;
		private readonly ICOM_PARAMETRORepository _repoParametro;
		
		public COM_CUADRO_COMPARATIVOService(ICOM_CUADRO_COMPARATIVORepository repo,
			ICOM_CUADRO_COMPARATIVO_DETARepository repoDeta,
			ICOM_REPORepository repoRepo,
			ISEG_USUARIOService repoUser,
			ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRARepository repoDetaOrdenCompra,
			ICOM_PARAMETRORepository repoParametro
		)
		{
			_repo = repo;
			_repoDeta = repoDeta;
			_repoRepo = repoRepo;
			_repoUser = repoUser;
			_repoDetaOrdenCompra = repoDetaOrdenCompra;
			_repoParametro = repoParametro;
		}
		
		public async Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
				new CParameter() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
				
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateCOM_CUADRO_COMPARATIVO_DETAAsync(COM_CUADRO_COMPARATIVO_DETA_UPDATEDTable Data, string vLOGIN_SISTEMA, string vESTACION)
			{
				return await _repoDeta.UpdateCOM_CUADRO_COMPARATIVO_DETAAsync(Data, vLOGIN_SISTEMA, vESTACION);
			}

		#region  "SOLICITUDES DE COTIZACION DISPONIBLE"

		public async Task<CResult> GetAllSOLICITUD_COTIZACION_DISPONIBLE(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="TIPO_CONSULTA",Value=1, DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
				new() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
				new() {ParameterName="OPCION_CONSULTA",Value=0, DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllSOLICITUD_COTIZACION_DISPONIBLE(p);
		}

		public async Task<CResult> GetAllSOLICITUD_COTIZACION_DETA_DISPONIBLE(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = xWhere.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "OPCION_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 });
			return await _repo.GetAllSOLICITUD_COTIZACION_DETA_DISPONIBLE(p);
		}
		#endregion
		public async Task<CResult> COM_CUADRO_COMPARATIVO_GENERAR(COM_CUADRO_COMPARATIVO_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.COM_CUADRO_COMPARATIVO_GENERAR(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> SolicitarAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			var vResultado= await _repo.SolicitarAsync(Data);
			if (vResultado.Result)
			{
				await EnviarCorreoAutorizadorAsync(Data);
			}
			return vResultado;
		}

		public async Task<CResult> getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = xWhere.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });
			return await _repo.getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(p);
		}
		public async Task<CResult> getAllCOM_CUADRO_COMPARATIVO_DETA(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = xWhere.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });
			return await _repoDeta.GetAllAsync(p);
		}

		public async Task<Stream> GetPDFAsync(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
			};

				var vRespuestaCuadroComparativoData = await _repo.GetComCuadroComparativoImpr(p);

				if (vRespuestaCuadroComparativoData.Result)
				{
					return await _repoRepo.GetComCuadroComparativoImprAsync((List<COM_CUADRO_COMPARATIVO_IMPRView>)vRespuestaCuadroComparativoData.Data, _repoUser.GenerateRptToken("Admin"));
				}

			return null;
		}

		public async Task<CResult> AplicarAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			return await _repo.AplicarAsync(Data);
		}

		public async Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_CUADRO_COMPARATIVO", Value = xWhere.CORR_CUADRO_COMPARATIVO, DbType = System.Data.DbType.Int32 });
			return await _repo.GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETAAsync(p);
		}

		public async Task<CResult> UPDATE_COM_CUADRO_COMPARATIVO_DETAAsync(List<COM_CUADRO_COMPARATIVO_COTIZACION_DETAView>  Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var resultado = new CResult();
			foreach(var Detalle in Data.ToList())
			{
				try
				{	
					var p = new COM_CUADRO_COMPARATIVO_DETATable();

					p.CORR_EMPRESA = Detalle.CORR_EMPRESA;
					p.ANIO_PERIODO = Detalle.ANIO_PERIODO;
					p.CORR_CUADRO_COMPARATIVO = Detalle.CORR_CUADRO_COMPARATIVO;
					p.ANIO_PERIODO_COTIZACION = Detalle.ANIO_PERIODO_COTIZACION;
					p.CORR_COTIZACION = Detalle.CORR_COTIZACION;
					p.CORR_COTIZACION_DETA = Detalle.CORR_COTIZACION_DETA;
					p.SELECCION = Detalle.SELECCION;
					p.OBSERVACIONES = Detalle.OBSERVACIONES;	

					resultado = await _repoDeta.UpdateAsync(p,vLOGIN_SISTEMA,vESTACION);

					Data.Remove(Detalle);
				}
				catch (System.Exception )
				{
					Data.Remove(Detalle);
				}
			}
			//resultado.ErrorMessage = "enviado con exito las ventas";
			//resultado.Result = true;
			//resultado.Data= null;


			return resultado;
		}
		public async Task<CResult> GetAllSolicitadosAsync(COM_CUADRO_COMPARATIVOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="SYS_LOGIN_USUARIO",Value=xWhere.USUARIO_CREA,DbType=System.Data.DbType.String},
				
			};
			
			return await _repo.GetAllSolicitadosAsync(p);
		}
		public async Task<CResult> AutorizarAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			var vResultado= await _repo.AutorizarAsync(Data);
			var vData = new COM_CUADRO_COMPARATIVOParam{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				ANIO_PERIODO = Data.ANIO_PERIODO,
				CORR_CUADRO_COMPARATIVO = Data.CORR_CUADRO_COMPARATIVO
			};
			var vRespuestaEnviarCorreo = await _repo.ValidarEnviarCorreo(Data);
			if(vResultado.Result)
			{
				var p = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				};
				var vResultadoSoliNornales =await _repo.GetCotizacionesNormales(p);
				var vDataSoliNormales=(List<COM_CUADRO_COMPARATIVO_SOLI_COTIZAView>)vResultadoSoliNornales.Data;
				
				if (vRespuestaEnviarCorreo && vDataSoliNormales != null && vDataSoliNormales.Count > 0 && vDataSoliNormales[0].CLASE_SOLI_COTIZA == "NO")
				{
					await EnviarCorreoAsync(vData, "Admin", "Admin");
				}
				else if (vRespuestaEnviarCorreo && vDataSoliNormales != null && vDataSoliNormales.Count > 0 && vDataSoliNormales[0].CLASE_SOLI_COTIZA == "EX")
				{
					await EnviarCorreoExpressAsync(vData, "Admin", "Admin");
				}
				
				await EnviarCorreoAutorizadorAsync(Data);
			}
			return vResultado;
		}
		public async Task<CResult> UpdateAutorizarAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAutorizarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		public async Task<CResult> EnviarCorreoAsync(COM_CUADRO_COMPARATIVOParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vResultado = new CResult
			{
				Result = false,
				Data = null,
				ErrorSource = "EnviarCorreoAsync()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0
			};

			//Enviar Correo
			var q = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				
			};

			var vResultadoCorreo = await _repoParametro.GetAsync(q);
			if (!vResultadoCorreo.Result) 
			{
				vResultado.ErrorCode = 3;
				vResultado.ErrorMessage = "Error obteniendo la configuración del correo";

				return vResultado;
			}
			var vDataCorreo = (COM_PARAMETROView)vResultadoCorreo.Data;

			// Si no hay correo, no se intenta enviar
			if (vDataCorreo.CORREO_REMITENTE == "" || vDataCorreo.CORREO_REMITENTE == null) 
			{
				vResultado.Result = true;
				vResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
				vResultado.RowsAffected = 1;

				return vResultado;	
			}

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
			};
			//Obtener datos de las ordenes de compra
			var vRespuestaOrdenesCompra = await _repoDetaOrdenCompra.GetAllAsync(p);
			if (vRespuestaOrdenesCompra.Data==null)
			{
				vResultado.ErrorCode = -1;
				vResultado.ErrorMessage = "Error obteniendo datos de la orden de compra";
				return vResultado;
			}

			//Obtener datos de los proveedores
			var vRespuestaProveedores = await _repo.GetComCuadroComparativoProeveedorCorreo(p);
			if (vRespuestaProveedores.Data==null)
			{
				vResultado.ErrorCode = -1;
				vResultado.ErrorMessage = "Error obteniendo datos de los proveedores";
				return vResultado;
			}

			var CorreosProveedores= (List<COM_CUADRO_COMPARATIVO_PROVEEDOR_CORREOView>)vRespuestaProveedores.Data;

			//Obtener datos del gestor de compras por proveedor
			var vRespuestaProveedorGestos = await _repo.GetComCuadroComparativoProeveedorCorreoUsuarioSoliCotizacion(p);
			if (vRespuestaProveedorGestos.Data==null)
			{
				vResultado.ErrorCode = -1;
				vResultado.ErrorMessage = "Error obteniendo datos del gestor de compras";
				return vResultado;
			}

			var CorreosProveedorGestorCompras= (List<COM_CUADRO_COMPARATIVO_PROVEEDOR_CORREOView>)vRespuestaProveedorGestos.Data;

			
			List<CParameter> o= new List<CParameter>{};
			var vMessage = "";
			foreach (var Orden in (List<COM_CUADRO_COMPARATIVO_ORDEN_COMPRAView>)vRespuestaOrdenesCompra.Data)
			{
				o.Clear();
				vMessage="";
				o = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="NUMERO_ORDEN",Value=Orden.NUMERO_ORDEN,DbType=System.Data.DbType.Int32},
				};
				//Obtener datos PDF
				var vRespuestaCuadroComparativoData = await _repoDetaOrdenCompra.GetComCuadroComparativoOrdenImpr(o);
				Stream vPDF = null;
				if (vRespuestaCuadroComparativoData.Result)
				{
					vPDF= await _repoRepo.GetComCuadroComparativoOrdenCompraImprAsync((List<COM_ORDEN_COMPRA_IMPRView>)vRespuestaCuadroComparativoData.Data, _repoUser.GenerateRptToken("Admin"));
				}
				if (vPDF == null) 
				{
					vResultado.ErrorCode = 1;
					vResultado.ErrorMessage = "Error al obtener PDF";

					return vResultado;
				}

				vMessage = "<p><strong>Estimado Proveedor: </strong>"+Orden.NOMBRE_PROVEEDOR+"</p>";
				vMessage += "<p><strong>Atención: </strong>" + Orden.NOMBRE_CONTACTO + "</p>";
				vMessage += "<p>Por este medio adjuntamos la orden de compra <strong>No. " + Orden.NUMERO_ORDEN.ToString() + "</strong></p>";
				vMessage += "<p>Horario de recepción de productos:</p>";
				vMessage += "<p>Lunes a Viernes de 08:00 a 11:30 A.M. y de 01:00 a 04:30 P.M.</p>";
				vMessage += "<p>Sabado de: 08:30 a 11:30 A.M.</p>";
				
				var vCuerpo = CRoutines.BodyEmailUEES(vMessage);
				var vAsunto = " UEES- Orden de Compra No." + Orden.NUMERO_ORDEN.ToString()  ;

				//Asignar correo proveedor

				var CorreoProveedor = CorreosProveedores.Where(x => x.CORR_PROVEEDOR == Orden.CORR_PROVEEDOR).FirstOrDefault();
				var vTo = new List<ToEMail>
				{
					new() {
					Name = CorreoProveedor.NOMBRE_USUARIO,
					Address = CorreoProveedor.CORREO_ELECTRONICO
					}
				};

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

				var vAdjunto = new List<CFile> 
				{
					new() {
					FileName = "OrdenCompra"+Orden.NUMERO_ORDEN.ToString()+".pdf",
					FileStream = vPDF
					},
				};
				
				var vToCC = new List<ToEMail>();
				var vToListCC = vDataCorreo.CORREO_ELECTRONICO_COPIAR.Split(",");

				//Agregamos el correo del gestor de compras
				var CorreoGestor = CorreosProveedorGestorCompras.Where(x => x.CORR_PROVEEDOR == Orden.CORR_PROVEEDOR).FirstOrDefault();
				if (CorreoGestor != null)
				{
					vToCC.Add(new() {
						Name = CorreoGestor.NOMBRE_USUARIO,
						Address = CorreoGestor.CORREO_ELECTRONICO
					});
				}

				foreach (var item in vToListCC)
				{
					if (item.Trim() != "") 
					{
						vToCC.Add(new() {
						Name = item.Trim(),
						Address = item.Trim()
						});
					}
				}
				var vResultadoSend = CRoutines.SendEmail(vAsunto, vCuerpo, vTo, vSettig, vAdjunto, vToCC);
				if (!vResultadoSend.Result) 
				{
					vResultado.ErrorCode = 5;
					vResultado.ErrorMessage = "Error Enviando correo ["+vResultadoSend.ErrorMessage+"]";

					return vResultado;
				}

				vPDF.Dispose();

				vResultado.Result = true;
				vResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
				vResultado.RowsAffected = 1;
			}

			return vResultado;
		}
		public async Task<CResult> EnviarCorreoExpressAsync(COM_CUADRO_COMPARATIVOParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vResultado = new CResult
			{
				Result = false,
				Data = null,
				ErrorSource = "EnviarCorreoAsync()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0
			};

			//Enviar Correo
			var q = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				
			};

			var vResultadoCorreo = await _repoParametro.GetAsync(q);
			if (!vResultadoCorreo.Result) 
			{
				vResultado.ErrorCode = 3;
				vResultado.ErrorMessage = "Error obteniendo la configuración del correo";

				return vResultado;
			}
			var vDataCorreo = (COM_PARAMETROView)vResultadoCorreo.Data;

			// Si no hay correo, no se intenta enviar
			if (vDataCorreo.CORREO_REMITENTE == "" || vDataCorreo.CORREO_REMITENTE == null) 
			{
				vResultado.Result = true;
				vResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
				vResultado.RowsAffected = 1;

				return vResultado;	
			}

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
			};
			//Obtener datos de las ordenes de compra
			var vRespuestaOrdenesCompra = await _repoDetaOrdenCompra.GetAllAsync(p);
			if (vRespuestaOrdenesCompra.Data==null)
			{
				vResultado.ErrorCode = -1;
				vResultado.ErrorMessage = "Error obteniendo datos de la orden de compra";
				return vResultado;
			}
			
			//Obtener datos del gestor de compras por proveedor
			var vRespuestaProveedorGestos = await _repo.GetComCuadroComparativoProeveedorCorreoUsuarioSoliCotizacion(p);
			if (vRespuestaProveedorGestos.Data==null)
			{
				vResultado.ErrorCode = -1;
				vResultado.ErrorMessage = "Error obteniendo datos del gestor de compras";
				return vResultado;
			}

			var CorreosProveedorGestorCompras= (List<COM_CUADRO_COMPARATIVO_PROVEEDOR_CORREOView>)vRespuestaProveedorGestos.Data;

			
			List<CParameter> o= new List<CParameter>{};
			var vMessage = "";
			foreach (var Orden in (List<COM_CUADRO_COMPARATIVO_ORDEN_COMPRAView>)vRespuestaOrdenesCompra.Data)
			{
				o.Clear();
				vMessage="";
				o = new List<CParameter>
				{
					new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
					new() {ParameterName="NUMERO_ORDEN",Value=Orden.NUMERO_ORDEN,DbType=System.Data.DbType.Int32},
				};
				//Obtener datos PDF
				var vRespuestaCuadroComparativoData = await _repoDetaOrdenCompra.GetComCuadroComparativoOrdenImpr(o);
				Stream vPDF = null;
				if (vRespuestaCuadroComparativoData.Result)
				{
					vPDF= await _repoRepo.GetComCuadroComparativoOrdenCompraImprAsync((List<COM_ORDEN_COMPRA_IMPRView>)vRespuestaCuadroComparativoData.Data, _repoUser.GenerateRptToken("Admin"));
				}
				if (vPDF == null) 
				{
					vResultado.ErrorCode = 1;
					vResultado.ErrorMessage = "Error al obtener PDF";

					return vResultado;
				}

				vMessage = "<p><strong>Estimado Proveedor: </strong>"+Orden.NOMBRE_PROVEEDOR+"</p>";
				vMessage += "<p><strong>Atención: </strong>" + Orden.NOMBRE_CONTACTO + "</p>";
				vMessage += "<p>Por este medio adjuntamos la orden de compra express<strong>No. " + Orden.NUMERO_ORDEN.ToString() + "</strong></p>";
				vMessage += "<p>Horario de recepción de productos:</p>";
				vMessage += "<p>Lunes a Viernes de 08:00 a 11:30 A.M. y de 01:00 a 04:30 P.M.</p>";
				vMessage += "<p>Sabado de: 08:30 a 11:30 A.M.</p>";
				
				var vCuerpo = CRoutines.BodyEmailUEES(vMessage);
				var vAsunto = " UEES- Orden de Compra No." + Orden.NUMERO_ORDEN.ToString()  ;

				//Agregamos el correo del gestor de compras

				var CorreoGestor = CorreosProveedorGestorCompras.Where(x => x.CORR_PROVEEDOR == Orden.CORR_PROVEEDOR).FirstOrDefault();
				var vTo = new List<ToEMail>
				{
					new() {
					Name = CorreoGestor.NOMBRE_USUARIO,
					Address = CorreoGestor.CORREO_ELECTRONICO
					}
				};

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

				var vAdjunto = new List<CFile> 
				{
					new() {
					FileName = "OrdenCompra"+Orden.NUMERO_ORDEN.ToString()+".pdf",
					FileStream = vPDF
					},
				};
				
				var vResultadoSend = CRoutines.SendEmail(vAsunto, vCuerpo, vTo, vSettig, vAdjunto);
				if (!vResultadoSend.Result) 
				{
					vResultado.ErrorCode = 5;
					vResultado.ErrorMessage = "Error Enviando correo ["+vResultadoSend.ErrorMessage+"]";

					return vResultado;
				}

				vPDF.Dispose();

				vResultado.Result = true;
				vResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
				vResultado.RowsAffected = 1;
			}

			return vResultado;
		}

		public async Task<CResult> RechazarAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			return await _repo.RechazarAsync(Data);
		}
	
		public async Task<CResult> EnviarCorreoAutorizadorAsync(COM_CUADRO_COMPARATIVOTable Data)
		{
			var vResultado = new CResult
			{
				Result = false,
				Data = null,
				ErrorSource = "EnviarCorreoAsync()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0
			};

			//Enviar Correo
			var q = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				
			};

			var vResultadoCorreo = await _repoParametro.GetAsync(q);
			if (!vResultadoCorreo.Result) 
			{
				vResultado.ErrorCode = 3;
				vResultado.ErrorMessage = "Error obteniendo la configuración del correo";

				return vResultado;
			}
			var vDataCorreo = (COM_PARAMETROView)vResultadoCorreo.Data;

			// Si no hay correo, no se intenta enviar
			if (vDataCorreo.CORREO_REMITENTE == "" || vDataCorreo.CORREO_REMITENTE == null) 
			{
				vResultado.Result = true;
				vResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
				vResultado.RowsAffected = 1;

				return vResultado;	
			}

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=Data.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
			};

			//Obtener datos de los proveedores
			var vRespuestaProveedores = await _repo.GetCorreoAutorizadores(p);
			if (vRespuestaProveedores.Data==null)
			{
				vResultado.ErrorCode = -1;
				vResultado.ErrorMessage = "Error obteniendo datos de los proveedores";
				return vResultado;
			}

			var CorreosAutorizadores= (SEG_USUARIOView)vRespuestaProveedores.Data;
            string vMessage = "<p><strong>Estimado:</strong></p>";
            vMessage += "<p>Se se le solicita autorizar</p>";
			vMessage += "<p>El cuadro comparativo <strong>No. " + Data.ANIO_PERIODO.ToString() + "-" + Data.CORR_CUADRO_COMPARATIVO.ToString() + "</strong></p>";
			vMessage += "<p>Emitido el <strong>" + Data.FECHA_CUADRO_COMPARATIVO.ToString("dd/MM/yyyy") + "</strong></p>";
			vMessage += "<p>Observaciones: <strong>" + Data.OBSERVACIONES + "</strong></p>";

			var vCuerpo = CRoutines.BodyEmailUEES(vMessage);
			var vAsunto = " UEES- Cuadro Compativo No." + Data.ANIO_PERIODO.ToString() + "-" + Data.CORR_CUADRO_COMPARATIVO.ToString();

			var vTo = new List<ToEMail>();
			var vToCC = new List<ToEMail>();
			var vToCCO = new List<ToEMail>();
			var vToList = CorreosAutorizadores.CORREO_ELECTRONICO.Split(",");

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

			var vResultadoSend = CRoutines.SendEmail(vAsunto, vCuerpo, vTo, vSettig, null, vToCC, vToCCO);
			if (!vResultadoSend.Result) 
			{
				vResultado.ErrorCode = 5;
				vResultado.ErrorMessage = "Error Enviando correo ["+vResultadoSend.ErrorMessage+"]";

				return vResultado;
			}

			vResultado.Result = true;
			vResultado.CodeHelper = Data.CORR_CUADRO_COMPARATIVO;
			vResultado.RowsAffected = 1;
			

			return vResultado;
		}
	}
}
