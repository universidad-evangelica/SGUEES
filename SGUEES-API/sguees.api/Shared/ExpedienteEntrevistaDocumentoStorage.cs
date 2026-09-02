using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace sguees.api.Shared
{
	public class ExpedienteEntrevistaDocumentoStorage
	{
		private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
		{
			".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".doc", ".docx"
		};

		private readonly string _rootPath;
		private readonly ExpedienteEntrevistaDocumentoOptions _options;

		public ExpedienteEntrevistaDocumentoStorage(
			IWebHostEnvironment environment,
			ExpedienteEntrevistaDocumentoOptions options)
		{
			_rootPath = Path.Combine(environment.ContentRootPath, "uploads", "sc-expediente-entrevista");
			_options = options ?? new ExpedienteEntrevistaDocumentoOptions();
		}

		public int MaxBytes => _options.MaxBytes > 0 ? _options.MaxBytes : 10 * 1024 * 1024;

		public string BuildRelativeUrl(
			int corrEmpresa,
			int corrExpediente,
			int corrEntrevista,
			int corrDocumento,
			string extension)
		{
			var ext = NormalizeExtension(extension);
			var fileName = $"{corrEmpresa}_{corrExpediente}_{corrEntrevista}_{corrDocumento}{ext}";
			return $"/uploads/sc-expediente-entrevista/{fileName}";
		}

		public bool TryResolvePhysicalPath(string relativeUrl, out string physicalPath)
		{
			physicalPath = null;
			if (string.IsNullOrWhiteSpace(relativeUrl))
			{
				return false;
			}

			var relative = relativeUrl.Trim().Replace('\\', '/').TrimStart('/');
			const string prefix = "uploads/sc-expediente-entrevista/";
			if (!relative.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
			{
				return false;
			}

			var fileName = relative[prefix.Length..];
			if (fileName.Contains("..", StringComparison.Ordinal) || fileName.Contains('/'))
			{
				return false;
			}

			if (!Regex.IsMatch(fileName, @"^\d+_\d+_\d+_\d+\.[a-z0-9]+$", RegexOptions.IgnoreCase))
			{
				return false;
			}

			physicalPath = Path.GetFullPath(Path.Combine(_rootPath, fileName));
			var rootFull = Path.GetFullPath(_rootPath) + Path.DirectorySeparatorChar;
			return physicalPath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase)
				&& File.Exists(physicalPath);
		}

		public async Task<(bool Ok, string Error, string RelativeUrl, string FileName)> SaveAsync(
			int corrEmpresa,
			int corrExpediente,
			int corrEntrevista,
			int corrDocumento,
			IFormFile file)
		{
			var validation = Validate(file);
			if (validation != null)
			{
				return (false, validation, null, null);
			}

			if (corrEmpresa <= 0 || corrExpediente <= 0 || corrEntrevista <= 0 || corrDocumento <= 0)
			{
				return (false, "Identificador de adjunto inválido.", null, null);
			}

			Directory.CreateDirectory(_rootPath);

			var extension = NormalizeExtension(Path.GetExtension(file.FileName));
			var storedFileName = $"{corrEmpresa}_{corrExpediente}_{corrEntrevista}_{corrDocumento}{extension}";
			var destination = Path.Combine(_rootPath, storedFileName);

			await using (var stream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None))
			{
				await file.CopyToAsync(stream);
			}

			return (
				true,
				null,
				BuildRelativeUrl(corrEmpresa, corrExpediente, corrEntrevista, corrDocumento, extension),
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
				// No bloquear eliminación en BD si falla borrado físico.
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
				".doc" => "application/msword",
				".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				_ => "application/octet-stream",
			};
		}

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
				return "Formato no permitido. Use PDF, imagen (JPG, PNG, WEBP, GIF) o Word (DOC, DOCX).";
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
