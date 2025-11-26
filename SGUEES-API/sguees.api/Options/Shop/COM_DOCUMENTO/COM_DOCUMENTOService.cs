using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;
using eadmindevprojectmanagement.Repositories;
using scuees.Repositories;
using scuees.Models;

namespace eadmindevprojectmanagement.Services
{
	public class COM_DOCUMENTOService : ICOM_DOCUMENTOService
	{
		private readonly ICOM_DOCUMENTORepository _repo;
		private readonly ICOM_DOCUMENTO_TOTALRepository _repoTotal;
		private readonly IGEN_TIPO_DOCUMENTO_RUBRORepository _repoRubro;

		public COM_DOCUMENTOService(ICOM_DOCUMENTORepository repo, ICOM_DOCUMENTO_TOTALRepository repoTotal, IGEN_TIPO_DOCUMENTO_RUBRORepository repoRubro)
		{
			_repo = repo;
			_repoTotal = repoTotal;
			_repoRubro = repoRubro;
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

	}
}
