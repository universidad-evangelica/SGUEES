using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class COM_COTIZACION_DETA_DOCService: ICOM_COTIZACION_DETA_DOCService
	{
		private readonly ICOM_COTIZACION_DETA_DOCRepository _repo;
		private readonly ICOM_DOCUMENTO_FISICORepository _repoDoc;
		private readonly ICOM_PARAMETRORepository _repoParametro;
		public COM_COTIZACION_DETA_DOCService(
			ICOM_COTIZACION_DETA_DOCRepository repo,
			ICOM_DOCUMENTO_FISICORepository repoDoc,
			ICOM_PARAMETRORepository repoParametro)
		{
			_repo = repo;
			_repoDoc = repoDoc;
			_repoParametro = repoParametro;
		}
		
		public async Task<CResult> GetAllAsync(COM_COTIZACION_DETA_DOCParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_COTIZACION",Value=xWhere.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_COTIZACION_DETA",Value=xWhere.CORR_COTIZACION_DETA,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_COTIZACION_DETA_DOCParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_COTIZACION",Value=xWhere.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_COTIZACION_DETA",Value=xWhere.CORR_COTIZACION_DETA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_DOCUMENTO",Value=xWhere.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_COTIZACION_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=Data.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COTIZACION",Value=Data.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COTIZACION_DETA",Value=Data.CORR_COTIZACION_DETA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_DOCUMENTO",Value=Data.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32},
			};

			vResultado = await _repo.GetAsync(p);

			if (vResultado.Result == false)
			{
				return vResultado;
			}

			try
			{
				File.Delete(((COM_COTIZACION_DETA_DOCView)vResultado.Data).RUTA_DOCUMENTO);
			}
			catch (Exception e)
			{
				vResultado.ErrorCode = 30001;
				vResultado.ErrorMessage = e.Message;
				vResultado.ErrorSource = e.Source;
				return vResultado;
			}

			vResultado = await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
			if (vResultado.Result == false)
			{
				return vResultado;
			}

			var Doc = new COM_DOCUMENTO_FISICOTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_DOCUMENTO = Data.CORR_DOCUMENTO,
				NOMBRE_DOCUMENTO = "",
				DESCRIPCION_DOCUMENTO = "",
				CORR_TIPO_DOCUMENTO = 0,
				RUTA_DOCUMENTO = "", //Actualizando posteriormente
				NOMBRE_ARCHIVO = "",
				USUARIO_CREA = "",
				FECHA_CREA = DateTime.Now,
				ESTACION_CREA = "",
				USUARIO_ACTU = "",
				FECHA_ACTU = DateTime.Now,
				ESTACION_ACTU = ""
			};
			vResultado = await _repoDoc.DeleteAsync(Doc, vLOGIN_SISTEMA, vESTACION);
			
			return vResultado;
		}
		
		public async Task<CResult> CreateDocAsync(COM_COTIZACION_DETA_DOC_PDFTable Data, string pathRoot, string vLOGIN_SISTEMA, string vESTACION)
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
			var Doc = new COM_DOCUMENTO_FISICOTable
			{
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
			vResultado = await _repoDoc.CreateAsync(Doc, vLOGIN_SISTEMA, vESTACION);

			if (vResultado.Result == false)
			{
				return vResultado;
			}
			Doc.CORR_DOCUMENTO = ((COM_DOCUMENTO_FISICOView)vResultado.Data).CORR_DOCUMENTO;

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32}
			};

			// Estableciendo ruta del documento
			var vResultadoParam = await _repoParametro.GetAsync(p);
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
				vRUTA_DOCUMENTO = Path.Combine(((COM_PARAMETROView)vResultadoParam.Data).URL_DOCUMENTO, 
														((COM_DOCUMENTO_FISICOView)vResultado.Data).CORR_EMPRESA.ToString() + "-" +
														((COM_DOCUMENTO_FISICOView)vResultado.Data).CORR_DOCUMENTO.ToString() +
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
			vResultado = await _repoDoc.UpdateRutaAsync(Doc, vLOGIN_SISTEMA, vESTACION);
			if (vResultado.Result == false)
			{
				return vResultado;
			}

			// Guardar relación documento con cotizacion
			if (vResultado.Result)
			{
				var Solidoc = new COM_COTIZACION_DETA_DOCTable
				{
					CORR_EMPRESA = Data.CORR_EMPRESA,
					ANIO_PERIODO = Data.ANIO_PERIODO,
					CORR_COTIZACION = Data.CORR_COTIZACION,
					CORR_COTIZACION_DETA = Data.CORR_COTIZACION_DETA,
					CORR_DOCUMENTO = ((COM_DOCUMENTO_FISICOView)vResultado.Data).CORR_DOCUMENTO
				};

				vResultado = await _repo.DeleteAsync(Solidoc, vLOGIN_SISTEMA, vESTACION);
				if (vResultado.Result)
				{
					vResultado = await _repo.CreateAsync(Solidoc, vLOGIN_SISTEMA, vESTACION);
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

		public async Task<Stream> GetDocAsync(COM_COTIZACION_DETA_DOCParam xWhere)
		{

			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COTIZACION",Value=xWhere.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COTIZACION_DETA",Value=xWhere.CORR_COTIZACION_DETA,DbType=System.Data.DbType.Int32}
			};

			var vResultado = await _repo.GetAsync(p);

			if (vResultado.Result)
			{
				try
				{
					MemoryStream ms = new();
					using FileStream file = new(((COM_COTIZACION_DETA_DOCView)vResultado.Data).RUTA_DOCUMENTO, FileMode.Open, FileAccess.Read);
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

			return null;
		}
	
	}
}
