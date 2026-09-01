using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.api.Shared;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_EXPEDIENTE_DOCUMENTOService : ISC_EXPEDIENTE_DOCUMENTOService
	{
		private readonly ISC_EXPEDIENTE_DOCUMENTORepository _repo;
		private readonly ExpedienteDocumentoStorage _storage;

		public SC_EXPEDIENTE_DOCUMENTOService(
			ISC_EXPEDIENTE_DOCUMENTORepository repo,
			ExpedienteDocumentoStorage storage)
		{
			_repo = repo;
			_storage = storage;
		}

		public async Task<CResult> GetAllAsync(SC_EXPEDIENTE_DOCUMENTOParam xWhere)
		{
			if (xWhere.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationError("Debe indicar el expediente.");
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SC_EXPEDIENTE_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_DOCUMENTO", Value = xWhere.CORR_EXPEDIENTE_DOCUMENTO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_EXPEDIENTE_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validacion = ValidarNegocio(Data, requiereArchivoMeta: false);
			if (validacion != null)
			{
				return validacion;
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SC_EXPEDIENTE_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_EXPEDIENTE_DOCUMENTO <= 0)
			{
				return ValidationError("No se pudo identificar el documento a actualizar.");
			}

			var validacion = ValidarNegocio(Data, requiereArchivoMeta: false);
			if (validacion != null)
			{
				return validacion;
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SC_EXPEDIENTE_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_EXPEDIENTE_DOCUMENTO <= 0)
			{
				return ValidationError("No se pudo identificar el documento a eliminar.");
			}

			var actual = await GetAsync(new SC_EXPEDIENTE_DOCUMENTOParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO = Data.CORR_EXPEDIENTE_CANDIDATO,
				CORR_EXPEDIENTE_DOCUMENTO = Data.CORR_EXPEDIENTE_DOCUMENTO,
			});

			if (!actual.Result || actual.Data == null)
			{
				return ValidationError("El documento no existe o ya fue eliminado.");
			}

			var vista = (SC_EXPEDIENTE_DOCUMENTOView)actual.Data;
			_storage.DeleteByRelativeUrl(vista.RUTA_ARCHIVO);

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> CreateDocAsync(SC_EXPEDIENTE_DOCUMENTOUploadTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data?.ARCHIVO_DOCUMENTO == null || Data.ARCHIVO_DOCUMENTO.Length <= 0)
			{
				return ValidationError("Debe seleccionar un archivo.");
			}

			var tabla = MapUploadToTable(Data);
			var validacion = ValidarNegocio(tabla, requiereArchivoMeta: false);
			if (validacion != null)
			{
				return validacion;
			}

			tabla.NOMBRE_ARCHIVO = Path.GetFileName(Data.ARCHIVO_DOCUMENTO.FileName);
			tabla.RUTA_ARCHIVO = "-";

			var insertado = await _repo.CreateAsync(tabla, vLOGIN_SISTEMA, vESTACION);
			if (!insertado.Result || insertado.Data == null)
			{
				return insertado;
			}

			var creado = (SC_EXPEDIENTE_DOCUMENTOView)insertado.Data;
			var guardado = await _storage.SaveAsync(
				creado.CORR_EMPRESA,
				creado.CORR_EXPEDIENTE_CANDIDATO,
				creado.CORR_EXPEDIENTE_DOCUMENTO,
				Data.ARCHIVO_DOCUMENTO);

			if (!guardado.Ok)
			{
				await _repo.DeleteAsync(new SC_EXPEDIENTE_DOCUMENTOTable
				{
					CORR_EMPRESA = creado.CORR_EMPRESA,
					CORR_EXPEDIENTE_CANDIDATO = creado.CORR_EXPEDIENTE_CANDIDATO,
					CORR_EXPEDIENTE_DOCUMENTO = creado.CORR_EXPEDIENTE_DOCUMENTO,
				}, vLOGIN_SISTEMA, vESTACION);

				return ValidationError(guardado.Error);
			}

			creado.NOMBRE_ARCHIVO = guardado.FileName;
			creado.RUTA_ARCHIVO = guardado.RelativeUrl;

			return await _repo.UpdateAsync(new SC_EXPEDIENTE_DOCUMENTOTable
			{
				CORR_EMPRESA = creado.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO = creado.CORR_EXPEDIENTE_CANDIDATO,
				CORR_EXPEDIENTE_DOCUMENTO = creado.CORR_EXPEDIENTE_DOCUMENTO,
				FECHA_CARGA = creado.FECHA_CARGA,
				TIPO_DOCUMENTO = creado.TIPO_DOCUMENTO,
				NOMBRE_ARCHIVO = guardado.FileName,
				RUTA_ARCHIVO = guardado.RelativeUrl,
				NOTAS = creado.NOTAS,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
			}, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateDocAsync(SC_EXPEDIENTE_DOCUMENTOUploadTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_EXPEDIENTE_DOCUMENTO <= 0)
			{
				return ValidationError("No se pudo identificar el documento a actualizar.");
			}

			var actual = await GetAsync(new SC_EXPEDIENTE_DOCUMENTOParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO = Data.CORR_EXPEDIENTE_CANDIDATO,
				CORR_EXPEDIENTE_DOCUMENTO = Data.CORR_EXPEDIENTE_DOCUMENTO,
			});

			if (!actual.Result || actual.Data == null)
			{
				return ValidationError("El documento no existe.");
			}

			var vista = (SC_EXPEDIENTE_DOCUMENTOView)actual.Data;
			var nombreArchivo = vista.NOMBRE_ARCHIVO;
			var rutaArchivo = vista.RUTA_ARCHIVO;

			if (Data.ARCHIVO_DOCUMENTO != null && Data.ARCHIVO_DOCUMENTO.Length > 0)
			{
				_storage.DeleteByRelativeUrl(vista.RUTA_ARCHIVO);

				var guardado = await _storage.SaveAsync(
					vista.CORR_EMPRESA,
					vista.CORR_EXPEDIENTE_CANDIDATO,
					vista.CORR_EXPEDIENTE_DOCUMENTO,
					Data.ARCHIVO_DOCUMENTO);

				if (!guardado.Ok)
				{
					return ValidationError(guardado.Error);
				}

				nombreArchivo = guardado.FileName;
				rutaArchivo = guardado.RelativeUrl;
			}

			var tabla = MapUploadToTable(Data);
			tabla.NOMBRE_ARCHIVO = nombreArchivo;
			tabla.RUTA_ARCHIVO = rutaArchivo;

			var validacion = ValidarNegocio(tabla, requiereArchivoMeta: true);
			if (validacion != null)
			{
				return validacion;
			}

			return await _repo.UpdateAsync(tabla, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<Stream> GetDocAsync(SC_EXPEDIENTE_DOCUMENTOParam xWhere)
		{
			var resultado = await GetAsync(xWhere);
			if (!resultado.Result || resultado.Data == null)
			{
				return null;
			}

			var vista = (SC_EXPEDIENTE_DOCUMENTOView)resultado.Data;
			if (!_storage.TryResolvePhysicalPath(vista.RUTA_ARCHIVO, out var physicalPath))
			{
				return null;
			}

			try
			{
				var ms = new MemoryStream();
				await using var file = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read);
				await file.CopyToAsync(ms);
				ms.Seek(0, SeekOrigin.Begin);
				return ms;
			}
			catch
			{
				return null;
			}
		}

		private static SC_EXPEDIENTE_DOCUMENTOTable MapUploadToTable(SC_EXPEDIENTE_DOCUMENTOUploadTable Data)
		{
			return new SC_EXPEDIENTE_DOCUMENTOTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO = Data.CORR_EXPEDIENTE_CANDIDATO,
				CORR_EXPEDIENTE_DOCUMENTO = Data.CORR_EXPEDIENTE_DOCUMENTO,
				FECHA_CARGA = Data.FECHA_CARGA,
				TIPO_DOCUMENTO = Data.TIPO_DOCUMENTO,
				NOTAS = Data.NOTAS,
				USUARIO_CREA = Data.USUARIO_CREA,
				ESTACION_CREA = Data.ESTACION_CREA,
				FECHA_CREA = Data.FECHA_CREA,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
			};
		}

		private static CResult ValidarNegocio(SC_EXPEDIENTE_DOCUMENTOTable Data, bool requiereArchivoMeta)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationError("Debe indicar el expediente de candidato.");
			}

			if (string.IsNullOrWhiteSpace(Data.TIPO_DOCUMENTO))
			{
				return ValidationError("Debe indicar el tipo de documento.");
			}

			if (Data.FECHA_CARGA == default)
			{
				return ValidationError("Debe indicar la fecha de carga.");
			}

			if (requiereArchivoMeta)
			{
				if (string.IsNullOrWhiteSpace(Data.NOMBRE_ARCHIVO) || string.IsNullOrWhiteSpace(Data.RUTA_ARCHIVO))
				{
					return ValidationError("No se encontró la ruta del archivo del documento.");
				}
			}

			return null;
		}

		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = -1,
				ErrorMessage = message,
				ErrorSource = "[SC_EXPEDIENTE_DOCUMENTOService]",
				RowsAffected = 0
			};
		}
	}
}
