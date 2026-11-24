using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;
using eadmindevprojectmanagement.Repositories;
using sguees.Repositories;
using sguees.Models;
using sguees.Services;

namespace eadmindevprojectmanagement.Services
{
	public class COM_DOCUMENTOService : ICOM_DOCUMENTOService
	{
		private readonly ICOM_DOCUMENTORepository _repo;
		private readonly ICOM_DOCUMENTO_TOTALRepository _repoTotal;
		private readonly IGEN_TIPO_DOCUMENTO_RUBRORepository _repoRubro;
		private readonly ICOM_PROVISIONService _provision;
		private readonly ICOM_PROVISION_DETAService _provisionDeta;
		private readonly ICOM_PROVISION_CONTAService _provisionConta;

		public COM_DOCUMENTOService(
			ICOM_DOCUMENTORepository repo,
			ICOM_DOCUMENTO_TOTALRepository repoTotal,
			IGEN_TIPO_DOCUMENTO_RUBRORepository repoRubro,
			ICOM_PROVISIONService provision,
			ICOM_PROVISION_DETAService provisionDeta,
			ICOM_PROVISION_CONTAService provisionConta)
		{
			_repo = repo;
			_repoTotal = repoTotal;
			_repoRubro = repoRubro;
			_provision = provision;
			_provisionDeta = provisionDeta;
			_provisionConta = provisionConta;
		}
		public async Task<CResult> GetAllAsync(COM_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
				new CParameter() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.DateTime},

			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(COM_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vResultado = await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
			if (vResultado.Result && Data.CREADO_DESDE_JSON)
			{
				Data.CORR_DOCUMENTO = (int)vResultado.CodeHelper;
				var xWhere = new List<CParameter>();
				if (Data.MONTO_TOTAL_GRAVADO > 0)
				{
					//obtenemos el rubro gravado y lo actualizamos
					xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_TIPO_DOC", Value = Data.CORR_TIPO_DOC, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CLASE_RUBRO", Value = "GRA", DbType = System.Data.DbType.String }
					};

					var vResultRubro = await _repoRubro.GetAsync(xWhere);
					var vRubro = (GEN_TIPO_DOCUMENTO_RUBROView)vResultRubro.Data;

					var vTotal = new COM_DOCUMENTO_TOTALTable
					{
						CORR_EMPRESA = Data.CORR_EMPRESA,
						ANIO_PERIODO = Data.ANIO_PERIODO,
						MES_PERIODO = Data.MES_PERIODO,
						CORR_DOCUMENTO = Data.CORR_DOCUMENTO,
						CORR_RUBRO = vRubro.CORR_RUBRO,
						MONTO_RUBRO = Data.MONTO_TOTAL_GRAVADO,
					};
					await _repoTotal.UpdateAsync(vTotal, vLOGIN_SISTEMA, vESTACION);
				}

				if (Data.MONTO_TOTAL_EXENTO > 0)
				{
					//obtenemos el rubro exento y lo actualizamos
					xWhere.Clear();
					xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_TIPO_DOC", Value = Data.CORR_TIPO_DOC, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CLASE_RUBRO", Value = "EXE", DbType = System.Data.DbType.String }
					};


					var vResultExento = await _repoRubro.GetAsync(xWhere);
					var vRubroExento = (GEN_TIPO_DOCUMENTO_RUBROView)vResultExento.Data;

					var vTotalExento = new COM_DOCUMENTO_TOTALTable
					{
						CORR_EMPRESA = Data.CORR_EMPRESA,
						ANIO_PERIODO = Data.ANIO_PERIODO,
						MES_PERIODO = Data.MES_PERIODO,
						CORR_DOCUMENTO = Data.CORR_DOCUMENTO,
						CORR_RUBRO = vRubroExento.CORR_RUBRO,
						MONTO_RUBRO = Data.MONTO_TOTAL_EXENTO,
					};
					await _repoTotal.UpdateAsync(vTotalExento, vLOGIN_SISTEMA, vESTACION);
				}

				if (Data.MONTO_TOTAL_NO_SUJETO > 0)
				{
					//obtenemos el rubro No sujeto y lo actualizamos
					xWhere.Clear();
					xWhere = new List<CParameter>
					{
						new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CORR_TIPO_DOC", Value = Data.CORR_TIPO_DOC, DbType = System.Data.DbType.Int32 },
						new() { ParameterName = "CLASE_RUBRO", Value = "NSU", DbType = System.Data.DbType.String }
					};

					var vResultNSU = await _repoRubro.GetAsync(xWhere);
					var vRubroNSU = (GEN_TIPO_DOCUMENTO_RUBROView)vResultNSU.Data;

					var vTotalNSU = new COM_DOCUMENTO_TOTALTable
					{
						CORR_EMPRESA = Data.CORR_EMPRESA,
						ANIO_PERIODO = Data.ANIO_PERIODO,
						MES_PERIODO = Data.MES_PERIODO,
						CORR_DOCUMENTO = Data.CORR_DOCUMENTO,
						CORR_RUBRO = vRubroNSU.CORR_RUBRO,
						MONTO_RUBRO = Data.MONTO_TOTAL_NO_SUJETO,
					};
					await _repoTotal.UpdateAsync(vTotalNSU, vLOGIN_SISTEMA, vESTACION);
				}

				//Relacionamos el documento electrónico
				vResultado = await _repo.RelacionarDocumentoElctronico(Data, vLOGIN_SISTEMA, vESTACION);
			}
			return vResultado;
		}

		public async Task<CResult> UpdateAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> AplicarAsync(COM_DOCUMENTOTable Data)
		{
			return await _repo.AplicarAsync(Data);
		}

		public async Task<CResult> GenerarCRAsync(COM_DOCUMENTO_CRTable Data)
		{
			return await _repo.GenerarCRAsync(Data);
		}

		public async Task<CResult> DesAplicarAsync(COM_DOCUMENTOTable Data)
		{
			return await _repo.DesAplicarAsync(Data);
		}
		public async Task<CResult> GetAllDesAplicarAsync(COM_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.Date });
			p.Add(new CParameter() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.Date });


			return await _repo.GetAllAplicadosAsync(p);
		}
		

		public async Task<CResult> GetAllJsonAsync(COM_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "OPCION_CONSULTA", Value = xWhere.OPCION_CONSULTA, DbType = System.Data.DbType.Int32 });
			return await _repo.GetAllJsonAsync(p);
		}
		public async Task<CResult> GetAllDocumentosDisponiblesAsync(COM_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.Date });
			p.Add(new CParameter() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.Date });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 });
			return await _repo.GetAllDocumentosDisponiblesAsync(p);
		}
		public async Task<CResult> AnularCRAsync(COM_DOCUMENTO_ANULAR_CRTable Data)
		{
			return await _repo.AnularCRAsync(Data);
		}

		public async Task<CResult> GetAllDocumentosCRAsync(COM_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 });
			return await _repo.GetAllDocumentosCRAsync(p);
		}

		public async Task<CResult> GetAllAnularAsync(COM_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			//p.Add(new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
			p.Add(new CParameter() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.Date });
			p.Add(new CParameter() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.Date });
			return await _repo.GetAllAnularAsync(p);
		}

		public Task<CResult> GetProvisionAsync(COM_DOCUMENTOParam xWhere)
		{
			return CargarProvisionAsync(xWhere.CORR_EMPRESA, xWhere.ANIO_PERIODO, xWhere.MES_PERIODO, xWhere.CORR_DOCUMENTO);
		}

		public async Task<CResult> ProvisionarAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var documento = await ObtenerDocumentoAsync(Data);
			if (documento == null)
			{
				return ErrorProvision("El documento de compra no existe.");
			}
			if (documento.ESTADO_DOCUMENTO != "AP")
			{
				return ErrorProvision("El documento debe estar aplicado antes de generar la provisión.");
			}

			var enlace = await BuscarEnlaceAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
			if (enlace != null)
			{
				var actual = await CargarProvisionAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
				if (actual.Data is COM_DOCUMENTO_PROVISIONView vista
					&& vista.PuedeEditarConta
					&& (vista.Conta == null || vista.Conta.Count == 0))
				{
					var regenerada = await _provision.GenerarContaAsync(new COM_PROVISIONTable
					{
						CORR_EMPRESA = Data.CORR_EMPRESA,
						ANIO_PERIODO = enlace.ANIO_PERIODO,
						MES_PERIODO = enlace.MES_PERIODO,
						CORR_PROVISION = enlace.CORR_PROVISION,
					}, vLOGIN_SISTEMA, vESTACION);
					if (!regenerada.Result || regenerada.ErrorCode != 0)
					{
						return regenerada;
					}
					return await CargarProvisionAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
				}
				return actual;
			}

			var descripcion = string.IsNullOrWhiteSpace(documento.DESCRIPCION_PARTIDA)
				? "Provisión " + (documento.NUMERO_DOCUMENTO ?? documento.CORR_DOCUMENTO.ToString())
				: documento.DESCRIPCION_PARTIDA;

			var alta = await _provision.CreateAsync(new COM_PROVISIONTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				ANIO_PERIODO = documento.ANIO_PERIODO,
				MES_PERIODO = documento.MES_PERIODO,
				FECHA_PROVISION = documento.FECHA_DOCUMENTO,
				CORR_PROVEEDOR = documento.CORR_PROVEEDOR,
				NOMBRE_PARTIDA = descripcion,
				NOMBRE_BENEFICIARIO = documento.NOMBRE_PROVEEDOR ?? "",
				MONTO_PAGO = 0,
				ESTADO_PROVISION = "DI",
			}, vLOGIN_SISTEMA, vESTACION);

			if (!alta.Result || alta.ErrorCode != 0)
			{
				return alta;
			}

			var creada = (COM_PROVISIONView)alta.Data;
			var deta = await _provisionDeta.CreateAsync(new COM_PROVISION_DETATable
			{
				CORR_EMPRESA = creada.CORR_EMPRESA,
				ANIO_PERIODO = creada.ANIO_PERIODO,
				MES_PERIODO = creada.MES_PERIODO,
				CORR_PROVISION = creada.CORR_PROVISION,
				ANIO_PERIODO_COM = documento.ANIO_PERIODO,
				MES_PERIODO_COM = documento.MES_PERIODO,
				CORR_DOCUMENTO_COM = documento.CORR_DOCUMENTO,
				MONTO_DOCUMENTO = documento.TOTAL_DOCUMENTO,
				MONTO_INICIAL = documento.TOTAL_DOCUMENTO,
				MONTO_PAGO = documento.TOTAL_DOCUMENTO,
				MONTO_FINAL = 0,
				NO_CONTABILIZAR = false,
			}, vLOGIN_SISTEMA, vESTACION);

			if (deta.ErrorCode != 0)
			{
				await _provision.DeleteAsync(new COM_PROVISIONTable
				{
					CORR_EMPRESA = creada.CORR_EMPRESA,
					ANIO_PERIODO = creada.ANIO_PERIODO,
					MES_PERIODO = creada.MES_PERIODO,
					CORR_PROVISION = creada.CORR_PROVISION,
				}, vLOGIN_SISTEMA, vESTACION);
				return deta;
			}

			return await CargarProvisionAsync(Data.CORR_EMPRESA, documento.ANIO_PERIODO, documento.MES_PERIODO, documento.CORR_DOCUMENTO);
		}

		public async Task<CResult> ContabilizarProvisionAsync(COM_DOCUMENTOTable Data)
		{
			var enlace = await BuscarEnlaceAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
			if (enlace == null)
			{
				return ErrorProvision("Esta factura todavía no tiene provisión.");
			}
			if (enlace.CANTIDAD_DOCUMENTOS != 1)
			{
				return ErrorProvision("Esta factura está en una provisión con otros documentos. Contabilícela desde Provisión.");
			}

			var provision = await ObtenerProvisionAsync(Data.CORR_EMPRESA, enlace);
			if (provision == null)
			{
				return ErrorProvision("No se encontró la provisión de esta factura.");
			}
			if (provision.ESTADO_PROVISION != "DI")
			{
				return ErrorProvision("La provisión ya está aplicada o anulada.");
			}

			var aplicado = await _provision.AplicarAsync(new COM_PROVISIONTable
			{
				CORR_EMPRESA = provision.CORR_EMPRESA,
				ANIO_PERIODO = provision.ANIO_PERIODO,
				MES_PERIODO = provision.MES_PERIODO,
				CORR_PROVISION = provision.CORR_PROVISION,
				USUARIO_ACTU = Data.USUARIO_ACTU,
			});
			if (aplicado.ErrorCode != 0)
			{
				return aplicado;
			}

			return await CargarProvisionAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
		}

		public async Task<CResult> RegenerarProvisionContaAsync(COM_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var enlace = await BuscarEnlaceAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
			if (enlace == null)
			{
				return ErrorProvision("Esta factura todavía no tiene provisión.");
			}
			if (enlace.CANTIDAD_DOCUMENTOS != 1)
			{
				return ErrorProvision("Esta factura comparte la provisión con otros documentos. Regenérela desde Provisión.");
			}

			var provision = await ObtenerProvisionAsync(Data.CORR_EMPRESA, enlace);
			if (provision == null || provision.ESTADO_PROVISION != "DI")
			{
				return ErrorProvision("Solo se puede regenerar la contabilidad de una provisión digitada.");
			}

			var regenerada = await _provision.GenerarContaAsync(new COM_PROVISIONTable
			{
				CORR_EMPRESA = provision.CORR_EMPRESA,
				ANIO_PERIODO = provision.ANIO_PERIODO,
				MES_PERIODO = provision.MES_PERIODO,
				CORR_PROVISION = provision.CORR_PROVISION,
			}, vLOGIN_SISTEMA, vESTACION);
			if (!regenerada.Result || regenerada.ErrorCode != 0)
			{
				return regenerada;
			}

			return await CargarProvisionAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
		}

		public async Task<CResult> ActualizarPartidaProvisionAsync(COM_DOCUMENTO_PROVISION_PARTIDA Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var enlace = await BuscarEnlaceAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
			if (enlace == null || enlace.CANTIDAD_DOCUMENTOS != 1)
			{
				return ErrorProvision("La descripción de la partida solo se edita cuando la provisión contiene esta factura.");
			}

			var provision = await ObtenerProvisionAsync(Data.CORR_EMPRESA, enlace);
			if (provision == null || provision.ESTADO_PROVISION != "DI")
			{
				return ErrorProvision("La provisión ya no se puede modificar.");
			}

			var actualizada = await _provision.UpdateAsync(new COM_PROVISIONTable
			{
				CORR_EMPRESA = provision.CORR_EMPRESA,
				ANIO_PERIODO = provision.ANIO_PERIODO,
				MES_PERIODO = provision.MES_PERIODO,
				CORR_PROVISION = provision.CORR_PROVISION,
				FECHA_PROVISION = provision.FECHA_PROVISION,
				CORR_PROVEEDOR = provision.CORR_PROVEEDOR,
				NOMBRE_PARTIDA = Data.NOMBRE_PARTIDA ?? "",
				MONTO_PAGO = provision.MONTO_PAGO,
				ESTADO_PROVISION = provision.ESTADO_PROVISION,
				NOMBRE_BENEFICIARIO = provision.NOMBRE_BENEFICIARIO ?? "",
			}, vLOGIN_SISTEMA, vESTACION);
			if (!actualizada.Result || actualizada.ErrorCode != 0)
			{
				return actualizada;
			}

			return await CargarProvisionAsync(Data.CORR_EMPRESA, Data.ANIO_PERIODO, Data.MES_PERIODO, Data.CORR_DOCUMENTO);
		}

		public async Task<CResult> ActualizarProvisionContaAsync(COM_DOCUMENTOParam documento, COM_PROVISION_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var enlace = await BuscarEnlaceAsync(documento.CORR_EMPRESA, documento.ANIO_PERIODO, documento.MES_PERIODO, documento.CORR_DOCUMENTO);
			if (enlace == null || enlace.CANTIDAD_DOCUMENTOS != 1
				|| enlace.ANIO_PERIODO != Data.ANIO_PERIODO
				|| enlace.MES_PERIODO != Data.MES_PERIODO
				|| enlace.CORR_PROVISION != Data.CORR_PROVISION)
			{
				return ErrorProvision("Esta línea contable no se puede modificar desde el documento.");
			}

			var provision = await ObtenerProvisionAsync(documento.CORR_EMPRESA, enlace);
			if (provision == null || provision.ESTADO_PROVISION != "DI")
			{
				return ErrorProvision("La provisión ya no se puede modificar.");
			}

			Data.CORR_EMPRESA = documento.CORR_EMPRESA;
			return await _provisionConta.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private async Task<COM_DOCUMENTO_PROVISION_LINK> BuscarEnlaceAsync(int empresa, int anio, int mes, int documento)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = empresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = anio, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = mes, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = documento, DbType = System.Data.DbType.Int32 },
			};
			var encontrado = await _repo.GetProvisionPorDocumentoAsync(p);
			return encontrado.Result ? encontrado.Data as COM_DOCUMENTO_PROVISION_LINK : null;
		}

		private async Task<COM_DOCUMENTOView> ObtenerDocumentoAsync(COM_DOCUMENTOTable Data)
		{
			var documento = await _repo.GetAsync(new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = Data.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = Data.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DOCUMENTO", Value = Data.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
			});
			return documento.Result ? documento.Data as COM_DOCUMENTOView : null;
		}

		private async Task<COM_PROVISIONView> ObtenerProvisionAsync(int empresa, COM_DOCUMENTO_PROVISION_LINK enlace)
		{
			var provision = await _provision.GetAsync(new COM_PROVISIONParam
			{
				CORR_EMPRESA = empresa,
				ANIO_PERIODO = enlace.ANIO_PERIODO,
				MES_PERIODO = enlace.MES_PERIODO,
				CORR_PROVISION = enlace.CORR_PROVISION,
			});
			return provision.Result ? provision.Data as COM_PROVISIONView : null;
		}

		private async Task<CResult> CargarProvisionAsync(int empresa, int anio, int mes, int documento)
		{
			var enlace = await BuscarEnlaceAsync(empresa, anio, mes, documento);
			if (enlace == null)
			{
				return new CResult
				{
					Result = true,
					ErrorCode = 0,
					Data = new COM_DOCUMENTO_PROVISIONView
					{
						Conta = new List<COM_PROVISION_CONTAView>(),
						Mensaje = "Esta factura todavía no tiene provisión.",
					},
				};
			}

			var provision = await ObtenerProvisionAsync(empresa, enlace);
			var conta = await _provisionConta.GetAllAsync(new COM_PROVISION_CONTAParam
			{
				CORR_EMPRESA = empresa,
				ANIO_PERIODO = enlace.ANIO_PERIODO,
				MES_PERIODO = enlace.MES_PERIODO,
				CORR_PROVISION = enlace.CORR_PROVISION,
			});
			var lineas = conta.Result && conta.Data is IEnumerable<COM_PROVISION_CONTAView> lista
				? lista.ToList()
				: new List<COM_PROVISION_CONTAView>();
			var cargo = lineas.Sum(x => x.MONTO_CARGO);
			var abono = lineas.Sum(x => x.MONTO_ABONO);
			var digitada = provision?.ESTADO_PROVISION == "DI";
			var unica = enlace.CANTIDAD_DOCUMENTOS == 1;
			var mensaje = unica
				? ""
				: "Esta factura está en una provisión con otros documentos. La contabilización se termina en Provisión.";

			return new CResult
			{
				Result = true,
				ErrorCode = 0,
				Data = new COM_DOCUMENTO_PROVISIONView
				{
					Provision = provision,
					Conta = lineas,
					CantidadDocumentos = enlace.CANTIDAD_DOCUMENTOS,
					PuedeEditarConta = digitada && unica,
					PuedeContabilizar = digitada && unica && lineas.Count > 0 && cargo == abono && cargo != 0,
					Mensaje = mensaje,
				},
			};
		}

		private static CResult ErrorProvision(string mensaje)
		{
			return new CResult
			{
				Result = false,
				ErrorCode = 30000,
				ErrorMessage = mensaje,
			};
		}

	}
}
