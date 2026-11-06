using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.api.Shared;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PROVEEDOR_DOCService : IGEN_PROVEEDOR_DOCService
	{
		private readonly IGEN_PROVEEDOR_DOCRepository _repo;
		private readonly ProveedorDocumentoStorage _storage;

		public GEN_PROVEEDOR_DOCService(IGEN_PROVEEDOR_DOCRepository repo, ProveedorDocumentoStorage storage)
		{
			_repo = repo;
			_storage = storage;
		}

		public async Task<CResult> GetAllAsync(GEN_PROVEEDOR_DOCParam xWhere)
		{
			if (xWhere.CORR_PROVEEDOR <= 0)
			{
				return ValidationError("Debe indicar el proveedor.");
			}

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_PROVEEDOR_DOCParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> UploadAsync(GEN_PROVEEDOR_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_PROVEEDOR <= 0)
			{
				return ValidationError("Debe guardar el proveedor antes de adjuntar documentos.");
			}

			if (Data.ARCHIVO == null || Data.ARCHIVO.Length <= 0)
			{
				return ValidationError("Debe seleccionar un archivo.");
			}

			Data.CORR_DOCUMENTO = await _repo.NextCorrDocumentoAsync(Data.CORR_EMPRESA, Data.CORR_PROVEEDOR);
			var saved = await _storage.SaveAsync(Data.CORR_EMPRESA, Data.CORR_PROVEEDOR, Data.CORR_DOCUMENTO, Data.ARCHIVO);
			if (!saved.Ok)
			{
				return ValidationError(saved.Error);
			}

			Data.URL_DOCUMENTO = saved.RelativeUrl;
			Data.NOMBRE_ARCHIVO = saved.FileName;
			Data.USUARIO_CREA = vLOGIN_SISTEMA;
			Data.ESTACION_CREA = vESTACION;
			Data.USUARIO_ACTU = vLOGIN_SISTEMA;
			Data.ESTACION_ACTU = vESTACION;
			Data.FECHA_CREA = System.DateTime.Now;
			Data.FECHA_ACTU = Data.FECHA_CREA;

			var result = await _repo.CreateAsync(Data);
			if (!result.Result || result.ErrorCode != 0)
			{
				_storage.DeleteByRelativeUrl(saved.RelativeUrl);
			}

			return result;
		}

		public async Task<CResult> DeleteAsync(GEN_PROVEEDOR_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_PROVEEDOR <= 0 || Data.CORR_DOCUMENTO <= 0)
			{
				return ValidationError("No se pudo identificar el documento a eliminar.");
			}

			var actual = await GetAsync(new GEN_PROVEEDOR_DOCParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_PROVEEDOR = Data.CORR_PROVEEDOR,
				CORR_DOCUMENTO = Data.CORR_DOCUMENTO,
			});

			if (!actual.Result || actual.Data is not GEN_PROVEEDOR_DOCView vista)
			{
				return ValidationError("El documento no existe o ya fue eliminado.");
			}

			_storage.DeleteByRelativeUrl(vista.URL_DOCUMENTO);
			return await _repo.DeleteAsync(Data);
		}

		public async Task<Stream> GetDocAsync(GEN_PROVEEDOR_DOCParam xWhere)
		{
			var actual = await GetAsync(xWhere);
			if (!actual.Result || actual.Data is not GEN_PROVEEDOR_DOCView vista)
			{
				return null;
			}

			if (!_storage.TryResolvePhysicalPath(vista.URL_DOCUMENTO, out var physicalPath))
			{
				return null;
			}

			xWhere.NOMBRE_ARCHIVO = vista.NOMBRE_ARCHIVO;
			return new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read);
		}

		private static CResult ValidationError(string message) => new()
		{
			Data = null,
			Result = false,
			ErrorCode = 30000,
			ErrorMessage = message,
			RowsAffected = 0,
		};
	}
}
