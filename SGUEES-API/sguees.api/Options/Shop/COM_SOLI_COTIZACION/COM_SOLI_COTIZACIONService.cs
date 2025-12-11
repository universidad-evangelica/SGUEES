using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_SOLI_COTIZACIONService : ICOM_SOLI_COTIZACIONService
	{
		private readonly ICOM_SOLI_COTIZACIONRepository _repo;
		private readonly ICOM_SOLI_COTIZACION_DETARepository _repoDeta;
		private readonly ICOM_SOLI_COTIZACION_PROVEEDORRepository _repoProveedor;
		private readonly ICOM_REPORepository _repoRepo;
		private readonly ISEG_USUARIOService _repoUser;

		public COM_SOLI_COTIZACIONService(
			ICOM_SOLI_COTIZACIONRepository repo,
			ICOM_SOLI_COTIZACION_DETARepository repoDeta,
			ICOM_SOLI_COTIZACION_PROVEEDORRepository repoProveedor,
			ICOM_REPORepository repoRepo,
			ISEG_USUARIOService repoUser
			)
		{
			_repo = repo;
			_repoDeta = repoDeta;
			_repoProveedor = repoProveedor;
			_repoRepo = repoRepo;
			_repoUser = repoUser;
		}

		public async Task<CResult> GetAllAsync(COM_SOLI_COTIZACIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="@CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="@FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
				new() {ParameterName="@FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(COM_SOLI_COTIZACIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_SOLI_COTIZACION",Value=xWhere.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> CreateEncaDetaAsync(COM_SOLI_COTIZACION_ENCA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vResultado = new CResult()
			{
				Result = false,
				Data = null,
				ErrorSource = "CreateEncaDetaAsync()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0,
			};

			// Crear encabezado
			var vDataEnca = new COM_SOLI_COTIZACIONTable 
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				ANIO_PERIODO = Data.ANIO_PERIODO,
				CORR_SOLI_COTIZACION = Data.CORR_SOLI_COTIZACION,
				FECHA_SOLI_COTIZACION = Data.FECHA_SOLI_COTIZACION,
				FECHA_LIMITE_COTIZACION = Data.FECHA_LIMITE_COTIZACION,
				CODIGO_DEPTO = Data.CODIGO_DEPTO,
				USUARIO_SOLI = Data.USUARIO_SOLI,
				OBSERVACIONES = Data.OBSERVACIONES,
				ESTADO_SOLI_COTIZACION = Data.ESTADO_SOLI_COTIZACION,
				USUARIO_CREA = Data.USUARIO_CREA,
				FECHA_CREA = Data.FECHA_CREA,
				ESTACION_CREA = Data.ESTACION_CREA,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU,
				CORR_TIPO_SOLI_COTIZA = Data.CORR_TIPO_SOLI_COTIZA

			};
			vResultado = await _repo.CreateAsync(vDataEnca, vLOGIN_SISTEMA, vESTACION);

			if (!vResultado.Result) 
			{
				return vResultado;
			}
			Data.CORR_SOLI_COTIZACION = (int)vResultado.CodeHelper;

			// Agregar detalles
			foreach (var item in Data.DETA)
			{
				var vDataDeta = new COM_SOLI_COTIZACION_DETATable
				{
					CORR_EMPRESA = Data.CORR_EMPRESA,
					ANIO_PERIODO = Data.ANIO_PERIODO,
					CORR_SOLI_COTIZACION = Data.CORR_SOLI_COTIZACION,
					CORR_SOLI_COTIZACION_DETA = item.CORR_SOLI_COTIZACION_DETA,
					ANIO_PERIODO_SOLI_COMPRA = Data.ANIO_PERIODO_SOLI_COMPRA,
					CORR_SOLI_COMPRA = Data.CORR_SOLI_COMPRA,
					CODIGO_ITEM = item.CODIGO_ITEM,
					CANTIDAD = item.CANTIDAD,
					CORR_UNIDAD_MEDIDA = item.CORR_UNIDAD_MEDIDA,
					OBSERVACIONES = item.OBSERVACIONES,
					ESTADO_SOLI_COTIZACION = Data.ESTADO_SOLI_COTIZACION,
					USUARIO_CREA = Data.USUARIO_CREA,
					FECHA_CREA = Data.FECHA_CREA,
					ESTACION_CREA = Data.ESTACION_CREA,
					USUARIO_ACTU = Data.USUARIO_ACTU,
					FECHA_ACTU = Data.FECHA_ACTU,
					ESTACION_ACTU = Data.ESTACION_ACTU,
					PRECIO_UNITARIO = 0,
					MONTO_SUBTOTAL = 0
				};

				await _repoDeta.CreateAsync(vDataDeta, vLOGIN_SISTEMA, vESTACION);
			}

			return vResultado;
		}

		public async Task<CResult> UpdateEncaDetaAsync(COM_SOLI_COTIZACION_ENCA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vResultado = new CResult()
			{
				Result = false,
				Data = null,
				ErrorSource = "CreateEncaDetaAsync()",
				ErrorCode = 0,
				ErrorMessage = "",
				CodeHelper = 0,
				RowsAffected = 0,
			};

			// Actualizando encabezado
			var vDataEnca = new COM_SOLI_COTIZACIONTable 
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				ANIO_PERIODO = Data.ANIO_PERIODO,
				CORR_SOLI_COTIZACION = Data.CORR_SOLI_COTIZACION,
				FECHA_SOLI_COTIZACION = Data.FECHA_SOLI_COTIZACION,
				FECHA_LIMITE_COTIZACION = Data.FECHA_LIMITE_COTIZACION,
				CODIGO_DEPTO = Data.CODIGO_DEPTO,
				USUARIO_SOLI = Data.USUARIO_SOLI,
				OBSERVACIONES = Data.OBSERVACIONES,
				ESTADO_SOLI_COTIZACION = Data.ESTADO_SOLI_COTIZACION,
				USUARIO_CREA = Data.USUARIO_CREA,
				FECHA_CREA = Data.FECHA_CREA,
				ESTACION_CREA = Data.ESTACION_CREA,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU
			};
			vResultado = await _repo.UpdateAsync(vDataEnca, vLOGIN_SISTEMA, vESTACION);

			if (!vResultado.Result) 
			{
				return vResultado;
			}
			Data.CORR_SOLI_COTIZACION = (int)vResultado.CodeHelper;

			// Agregar detalles
			foreach (var item in Data.DETA)
			{
				var vDataDeta = new COM_SOLI_COTIZACION_DETATable
				{
					CORR_EMPRESA = Data.CORR_EMPRESA,
					ANIO_PERIODO = Data.ANIO_PERIODO,
					CORR_SOLI_COTIZACION = Data.CORR_SOLI_COTIZACION,
					CORR_SOLI_COTIZACION_DETA = item.CORR_SOLI_COTIZACION_DETA,
					ANIO_PERIODO_SOLI_COMPRA = Data.ANIO_PERIODO_SOLI_COMPRA,
					CORR_SOLI_COMPRA = Data.CORR_SOLI_COMPRA,
					CODIGO_ITEM = item.CODIGO_ITEM,
					CANTIDAD = item.CANTIDAD,
					CORR_UNIDAD_MEDIDA = item.CORR_UNIDAD_MEDIDA,
					OBSERVACIONES = item.OBSERVACIONES,
					ESTADO_SOLI_COTIZACION = Data.ESTADO_SOLI_COTIZACION,
					USUARIO_CREA = Data.USUARIO_CREA,
					FECHA_CREA = Data.FECHA_CREA,
					ESTACION_CREA = Data.ESTACION_CREA,
					USUARIO_ACTU = Data.USUARIO_ACTU,
					FECHA_ACTU = Data.FECHA_ACTU,
					ESTACION_ACTU = Data.ESTACION_ACTU,
					PRECIO_UNITARIO = 0,
					MONTO_SUBTOTAL = 0
				};
				await _repoDeta.CreateAsync(vDataDeta, vLOGIN_SISTEMA, vESTACION);
			}

			return vResultado;
		}

		public async Task<CResult> DeleteAsync(COM_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		#region  "Deta"
		public async Task<CResult> GetAllCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETAParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = xWhere.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
			return await _repoDeta.GetAllAsync(p);
		}

		public async Task<CResult> GetCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETAParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = xWhere.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION_DETA", Value = xWhere.CORR_SOLI_COTIZACION_DETA, DbType = System.Data.DbType.Int32 });

			return await _repoDeta.GetAsync(p);
		}

		public async Task<CResult> CreateCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoDeta.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoDeta.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteCOM_SOLI_COTIZACION_DETAAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoDeta.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		public async Task<CResult> AnularDetaAsync(COM_SOLI_COTIZACION_DETATable Data)
		{
			return await _repoDeta.AnularAsync(Data);
		}
		#endregion

		#region  "PROVEEDOR"
		public async Task<CResult> GetAllCOM_SOLI_COTIZACION_PROVEEDOR(COM_SOLI_COTIZACION_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = xWhere.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
			
			return await _repoProveedor.GetAllAsync(p);
		}

		public async Task<CResult> GetCOM_SOLI_COTIZACION_PROVEEDOR(COM_SOLI_COTIZACION_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = xWhere.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });

			return await _repoProveedor.GetAsync(p);
		}

		public async Task<CResult> CreateCOM_SOLI_COTIZACION_PROVEEDORAsync(List<COM_SOLI_COTIZACION_PROVEEDORView> Data, string vLOGIN_SISTEMA, string vESTACION, int CORR_EMPRESA)
		{
			var resultado = new CResult();

			foreach (var detalle in Data.ToList())
			{
				try
				{
					var detalleTable = new COM_SOLI_COTIZACION_PROVEEDORTable
					{
						CORR_EMPRESA = CORR_EMPRESA,
						ANIO_PERIODO = detalle.ANIO_PERIODO,
						CORR_SOLI_COTIZACION = detalle.CORR_SOLI_COTIZACION,
						CORR_PROVEEDOR = detalle.CORR_PROVEEDOR,
						CORR_CONDICION_PAGO = detalle.CORR_CONDICION_PAGO,
						CORR_FORMA_PAGO = detalle.CORR_FORMA_PAGO,
						DETALLE_FORMA_PAGO = detalle.DETALLE_FORMA_PAGO,
						USUARIO_CREA = vLOGIN_SISTEMA,
						ESTACION_CREA = detalle.ESTACION_CREA,
						FECHA_CREA = detalle.FECHA_CREA
					};

					var p = new List<CParameter>();
					p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = detalleTable.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = detalleTable.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_SOLI_COTIZACION", Value = detalleTable.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 });
					p.Add(new CParameter() { ParameterName = "CORR_PROVEEDOR", Value = detalleTable.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 });

					resultado = await _repoProveedor.ExisteProveedor(p);

					if(resultado.Result)
					{
						resultado.Result = false;
						return resultado;
					}
					resultado = await _repoProveedor.CreateAsync(detalleTable, vLOGIN_SISTEMA, vESTACION);
					if (resultado.Result == true && detalle.GENERAR_COTIZACION)
					{
						var vResultadoGeneracion = await _repoProveedor.GenerarCotizacionAsync(detalleTable, vLOGIN_SISTEMA, vESTACION);
						if (!vResultadoGeneracion.Result)
						{
							resultado = vResultadoGeneracion;
						}
					}
					Data.Remove(detalle);
				}
				catch (System.Exception)
				{
					Data.Remove(detalle);
				}
			}

			return resultado;
			//return await _repoProveedor.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateCOM_SOLI_COTIZACION_PROVEEDORAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoProveedor.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteCOM_SOLI_COTIZACION_PROVEEDORAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoProveedor.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> GetAllPROVEEDOR_DISPONIBLE(COM_SOLI_COTIZACION_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA, DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO, DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=xWhere.CORR_SOLI_COTIZACION, DbType=System.Data.DbType.Int32},
				};
			return await _repoProveedor.GetAllPROVEEDOR_DISPONIBLE(p);
		}

		public async Task<CResult> AnularCOM_SOLI_COTIZACION_PROVEEDORAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoProveedor.AnularAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> HabilitarCOM_SOLI_COTIZACION_PROVEEDORAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repoProveedor.HabilitarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		#endregion

		#region  "SOLICITUDES DE COMPRAS DISPONIBLE"

		public async Task<CResult> GetAllSOLICITUD_COMPRAS_DISPONIBLE(COM_SOLI_COTIZACIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="TIPO_CONSULTA",Value=1, DbType=System.Data.DbType.Int32},
				new() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
				new() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
				new() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO, DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_SOLI_COTIZACION",Value=xWhere.CORR_SOLI_COTIZACION, DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO_SOLI_COMPRA",Value=xWhere.ANIO_PERIODO_SOLI_COMPRA, DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_SOLI_COMPRA",Value=xWhere.CORR_SOLI_COMPRA, DbType=System.Data.DbType.Int32},
				new() {ParameterName="OPCION_CONSULTA",Value=0, DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllSOLICITUD_COMPRAS_DISPONIBLE(p);
		}

		public async Task<CResult> GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE(COM_SOLI_COTIZACIONParam xWhere)
		{
			var p = new List<CParameter>
      {
          new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
          new() { ParameterName = "ANIO_PERIODO_SOLI_COMPRA", Value = xWhere.ANIO_PERIODO_SOLI_COMPRA, DbType = System.Data.DbType.Int32 },
          new() { ParameterName = "CORR_SOLI_COMPRA", Value = xWhere.CORR_SOLI_COMPRA, DbType = System.Data.DbType.Int32 },
          new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
          new() { ParameterName = "CORR_SOLI_COTIZACION", Value = xWhere.CORR_SOLI_COTIZACION, DbType = System.Data.DbType.Int32 },
          new() { ParameterName = "OPCION_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 }
      };
			
			return await _repo.GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE(p);
		}
		#endregion

		public async Task<CResult> SolicitarAsync(COM_SOLI_COTIZACIONTable Data)
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

			//Solicitar
			var vResultadoSoli = await _repo.SolicitarAsync(Data);
			if (!vResultadoSoli.Result)
			{
				return vResultadoSoli;
			}

			if (((COM_SOLI_COTIZACIONView)vResultadoSoli.Data).CLASE_SOLI_COTIZA == "EX" )
			{
				return vResultadoSoli;
			}

			//Obteniendo Cotizaciones asociadas a la solicitud
			var p = new List<CParameter>
			{
				new() {ParameterName="@CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="@ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="@CORR_SOLI_COTIZACION",Value=Data.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
			};
			vResultado = await _repo.GetAllCotizacionesAsync(p);
			if (!vResultado.Result)
			{
				return vResultado;
			}

			foreach (var item in (List<COM_COTIZACIONView>)vResultado.Data)
			{
				var vDataCotiza = new COM_COTIZACIONParam()
				{
					CORR_EMPRESA = item.CORR_EMPRESA,
					ANIO_PERIODO = item.ANIO_PERIODO,
					CORR_COTIZACION = item.CORR_COTIZACION
				};

				//Enviar por correo
				vResultado = await EnviarCorreoNotificaProveedorCotizarAsync(vDataCotiza);
				if (!vResultado.Result)
				{
					return vResultado;
				}
			}
			return vResultadoSoli;
		}

		public async Task<CResult> EnviarCorreoNotificaProveedorCotizarAsync(COM_COTIZACIONParam Data)
		{
			var vResultado = new CResult()
			{
				Result = true,
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
			var vResultadoCorreo = await _repoProveedor.GetCorreoProveedorCotizaAsync(p);
			if (!vResultadoCorreo.Result)
			{
				vResultado.Result = false;
				vResultado.ErrorCode = 30000;
				vResultado.ErrorMessage = "Error al enviar correo";
				return vResultado;
			}

			var vDataCorreo = (COM_COTIZACION_CORREOView)vResultadoCorreo.Data;

			// Si no hay correo, no se intenta enviar
			if (vDataCorreo.CORREO_ELECTRONICO == "" || vDataCorreo.CORREO_ELECTRONICO == null)
			{
				vResultado.CodeHelper = Data.CORR_COTIZACION;
				vResultado.RowsAffected = 1;

				return vResultado;
			}

			var vMessage = "<p><strong>Estimado Proveedor:</strong></p>";
          	vMessage += "<p>" + vDataCorreo.NOMBRE_PROVEEDOR + "</p>";
          	vMessage += "<p>Por este medio solicitados complete la cotización <strong>No. " + vDataCorreo.ANIO_PERIODO.ToString() + "-" + vDataCorreo.CORR_COTIZACION.ToString() + "</strong></p>";
          	vMessage += "<p>Emitida el <strong>" + vDataCorreo.FECHA_COTIZACION.ToString("dd/MM/yyyy") + "</strong></p>";
          	vMessage += "<p>Observaciones: <strong>" + vDataCorreo.OBSERVACIONES + "</strong></p>";

			var vCuerpo = CRoutines.BodyEmailUEES(vMessage);
			var vAsunto = vDataCorreo.NOMBRE_EMPRESA + " Solicita Cotización No." + vDataCorreo.ANIO_PERIODO.ToString()+"-"+vDataCorreo.CORR_COTIZACION.ToString();
			var vTo = new List<ToEMail>();
			var vToCCO = new List<ToEMail>();
			var vToList = vDataCorreo.CORREO_ELECTRONICO.Split(",");
			var vToListCCO = vDataCorreo.CORREO_ELECTRONICO_CCO.Split(",");
			foreach (var item in vToList.Where(x => x.Trim() != ""))
			{
				vTo.Add(new() {
					Name = item.Trim(),
					Address = item.Trim()
					});
			}

			foreach (var item in vToListCCO)
			{
				vToCCO.Add(new() {
					Name = item.Trim(),
					Address = item.Trim()
					});
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

			var vResultadoSend = CRoutines.SendEmail(vAsunto, vCuerpo, vTo, vSettig, null, vToCCO);
			if (!vResultadoSend.Result)
			{
				vResultado.Result = false;
				vResultado.ErrorCode = 30000;
				vResultado.ErrorMessage = "Error al enviar correo";

				return vResultado;
			}

			return vResultado;
		}

		public async Task<Stream> GetPDFAsync(COM_SOLI_COTIZACIONParam xWhere)
		{

			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=xWhere.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
			};

			var vRespuestaSoliCotizacionData = await _repo.GetComSoliCotizacionImpr(p);

			if (vRespuestaSoliCotizacionData.Result)
			{
				return await _repoRepo.GetComSoliCotizacionImprAsync((List<COM_SOLI_COTIZACION_IMPRView>)vRespuestaSoliCotizacionData.Data, _repoUser.GenerateRptToken("Admin"));
			}

			return null;
		}

		public async Task<CResult> AnularAsync(COM_SOLI_COTIZACIONTable Data)
		{
			return await _repo.AnularAsync(Data);
		}

		public async Task<CResult> AplicarAsync(COM_SOLI_COTIZACIONTable Data)
		{
			return await _repo.AplicarAsync(Data);
		}
	}
}
