using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace sguees.api.Shared
{
	/// <summary>
	/// Almacenamiento de adjuntos de proveedor en uploads/gen-proveedor-doc/{CORR_PROVEEDOR}/.
	/// </summary>
	public class ProveedorDocumentoStorage
	{
		private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
		{
			".pdf",
			".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp",
			".doc", ".docx",
			".xls", ".xlsx",
			".ppt", ".pptx",
			".txt", ".rtf", ".csv",
		};

		private readonly string _rootPath;
		private readonly ProveedorDocumentoOptions _options;

		public ProveedorDocumentoStorage(IWebHostEnvironment environment, ProveedorDocumentoOptions options)
		{
			_rootPath = Path.Combine(environment.ContentRootPath, "uploads", "gen-proveedor-doc");
			_options = options ?? new ProveedorDocumentoOptions();
		}

		public int MaxBytes => _options.MaxBytes > 0 ? _options.MaxBytes : 10 * 1024 * 1024;

		public string BuildRelativeUrl(int corrEmpresa, int corrProveedor, int corrDocumento, string extension)
		{
			var ext = NormalizeExtension(extension);
			var fileName = BuildStoredFileName(corrEmpresa, corrProveedor, corrDocumento, ext);
			return $"/uploads/gen-proveedor-doc/{corrProveedor}/{fileName}";
		}

		public bool TryResolvePhysicalPath(string relativeUrl, out string physicalPath)
		{
			physicalPath = null;
			if (string.IsNullOrWhiteSpace(relativeUrl))
			{
				return false;
			}

			var relative = relativeUrl.Trim().Replace('\\', '/').TrimStart('/');
			const string prefix = "uploads/gen-proveedor-doc/";
			if (!relative.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
			{
				return false;
			}

			var remainder = relative[prefix.Length..];
			if (string.IsNullOrWhiteSpace(remainder)
				|| remainder.Contains("..", StringComparison.Ordinal)
				|| remainder.StartsWith('/')
				|| remainder.EndsWith('/'))
			{
				return false;
			}

			// Nuevo: {CORR_PROVEEDOR}/{CORR_EMPRESA}_{CORR_PROVEEDOR}_{CORR_DOCUMENTO}.ext
			// Legacy (raíz): {CORR_EMPRESA}_{CORR_PROVEEDOR}_{CORR_DOCUMENTO}.ext
			var isNested = Regex.IsMatch(
				remainder,
				@"^\d+/\d+_\d+_\d+\.[a-z0-9]+$",
				RegexOptions.IgnoreCase);
			var isLegacyFlat = Regex.IsMatch(
				remainder,
				@"^\d+_\d+_\d+\.[a-z0-9]+$",
				RegexOptions.IgnoreCase);

			if (!isNested && !isLegacyFlat)
			{
				return false;
			}

			var segments = remainder.Split('/', StringSplitOptions.RemoveEmptyEntries);
			physicalPath = Path.GetFullPath(Path.Combine(new[] { _rootPath }.Concat(segments).ToArray()));
			var rootFull = Path.GetFullPath(_rootPath) + Path.DirectorySeparatorChar;
			return physicalPath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase)
				&& File.Exists(physicalPath);
		}

		public async Task<(bool Ok, string Error, string RelativeUrl, string FileName)> SaveAsync(
			int corrEmpresa,
			int corrProveedor,
			int corrDocumento,
			IFormFile file)
		{
			var validation = Validate(file);
			if (validation != null)
			{
				return (false, validation, null, null);
			}

			if (corrEmpresa <= 0 || corrProveedor <= 0 || corrDocumento <= 0)
			{
				return (false, "Identificador de documento inválido.", null, null);
			}

			var proveedorFolder = Path.Combine(_rootPath, corrProveedor.ToString());
			Directory.CreateDirectory(proveedorFolder);

			var extension = NormalizeExtension(Path.GetExtension(file.FileName));
			var storedFileName = BuildStoredFileName(corrEmpresa, corrProveedor, corrDocumento, extension);
			var destination = Path.Combine(proveedorFolder, storedFileName);

			await using (var stream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None))
			{
				await file.CopyToAsync(stream);
			}

			return (
				true,
				null,
				BuildRelativeUrl(corrEmpresa, corrProveedor, corrDocumento, extension),
				Path.GetFileName(file.FileName));
		}

		public void DeleteByRelativeUrl(string relativeUrl)
		{
			if (!TryResolvePhysicalPath(relativeUrl, out var physicalPath))
			{
				return;
			}

			try
			{
				File.Delete(physicalPath);
			}
			catch
			{
				// No bloquear eliminación en BD si falla el borrado físico.
			}
		}

		public static string GetContentType(string fileName)
		{
			var ext = NormalizeExtension(Path.GetExtension(fileName));
			return ext switch
			{
				".pdf" => "application/pdf",
				".jpg" or ".jpeg" => "image/jpeg",
				".png" => "image/png",
				".webp" => "image/webp",
				".gif" => "image/gif",
				".bmp" => "image/bmp",
				".doc" => "application/msword",
				".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				".xls" => "application/vnd.ms-excel",
				".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				".ppt" => "application/vnd.ms-powerpoint",
				".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
				".txt" => "text/plain",
				".csv" => "text/csv",
				".rtf" => "application/rtf",
				_ => "application/octet-stream",
			};
		}

		private static string BuildStoredFileName(int corrEmpresa, int corrProveedor, int corrDocumento, string extension) =>
			$"{corrEmpresa}_{corrProveedor}_{corrDocumento}{extension}";

		private string Validate(IFormFile file)
		{
			if (file == null || file.Length <= 0)
			{
				return "Debe seleccionar un archivo.";
			}

			if (file.Length > MaxBytes)
			{
				var maxMb = Math.Round(MaxBytes / (1024d * 1024d), 1);
				return $"El archivo no debe superar {maxMb} MB.";
			}

			var extension = NormalizeExtension(Path.GetExtension(file.FileName));
			if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
			{
				return "Formato no permitido. Use PDF, imágenes u Office (Word/Excel/PowerPoint). No se admiten videos.";
			}

			return null;
		}

		private static string NormalizeExtension(string extension)
		{
			if (string.IsNullOrWhiteSpace(extension))
			{
				return string.Empty;
			}

			var ext = extension.Trim().ToLowerInvariant();
			return ext.StartsWith('.') ? ext : $".{ext}";
		}
	}
}
