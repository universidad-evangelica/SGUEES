// Qué hace: almacenamiento de fotografías de empleado (GEN_PERSONA_NATURAL.FOTO_URL).
// Cómo: guarda en uploads/gen-empleado/{CORR_EMPRESA}_{CORR_PERSONA}/foto.ext (mismo patrón que PersonaFotoStorage).
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace sguees.api.Options.General.GEN_EMPLEADO
{
	public class EmpleadoFotoStorage
	{
		public const int MaxBytes = 5 * 1024 * 1024;
		private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
		{
			".jpg", ".jpeg", ".png", ".webp"
		};

		private readonly string _rootPath;

		public EmpleadoFotoStorage(IWebHostEnvironment environment)
		{
			_rootPath = Path.Combine(environment.ContentRootPath, "uploads", "gen-empleado");
		}

		public string FinalDirectory(int corrEmpresa, int corrPersona)
		{
			return Path.Combine(_rootPath, $"{corrEmpresa}_{corrPersona}");
		}

		public string RelativeUrl(int corrEmpresa, int corrPersona, string fileName)
		{
			return $"/uploads/gen-empleado/{corrEmpresa}_{corrPersona}/{fileName}";
		}

		public bool TryResolveFinalFile(string fotoUrl, out string physicalPath)
		{
			physicalPath = null;
			if (string.IsNullOrWhiteSpace(fotoUrl))
			{
				return false;
			}

			var relative = fotoUrl.Trim().Replace('\\', '/').TrimStart('/');
			const string prefix = "uploads/gen-empleado/";
			if (!relative.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
			{
				return false;
			}

			var remainder = relative[prefix.Length..];
			if (remainder.Contains("..", StringComparison.Ordinal) || remainder.Contains(':'))
			{
				return false;
			}

			var parts = remainder.Split('/', StringSplitOptions.RemoveEmptyEntries);
			if (parts.Length != 2)
			{
				return false;
			}

			var folder = parts[0];
			var fileName = parts[1];
			if (!Regex.IsMatch(folder, @"^\d+_\d+$") || !IsSafeFileName(fileName))
			{
				return false;
			}

			physicalPath = Path.GetFullPath(Path.Combine(_rootPath, folder, fileName));
			var rootFull = Path.GetFullPath(_rootPath) + Path.DirectorySeparatorChar;
			return physicalPath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase)
				&& File.Exists(physicalPath);
		}

		/// <summary>
		/// Guarda/reemplaza la fotografía definitiva del empleado (flujo autenticado gen-empleado).
		/// </summary>
		public async Task<(bool Ok, string Error, string RelativeUrl)> SaveFinalAsync(
			int corrEmpresa,
			int corrPersona,
			IFormFile file)
		{
			var validation = Validate(file);
			if (validation != null)
			{
				return (false, validation, null);
			}

			if (corrEmpresa <= 0 || corrPersona <= 0)
			{
				return (false, "Identificador de persona inválido.", null);
			}

			var extension = Path.GetExtension(file.FileName);
			var fileName = "foto" + extension.ToLowerInvariant();
			var finalDir = FinalDirectory(corrEmpresa, corrPersona);
			Directory.CreateDirectory(finalDir);

			foreach (var existing in Directory.EnumerateFiles(finalDir, "foto.*"))
			{
				File.Delete(existing);
			}

			var destination = Path.Combine(finalDir, fileName);
			await using (var stream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None))
			{
				await file.CopyToAsync(stream);
			}

			return (true, null, RelativeUrl(corrEmpresa, corrPersona, fileName));
		}

		public static string GetContentType(string physicalPath)
		{
			return Path.GetExtension(physicalPath).ToLowerInvariant() switch
			{
				".png" => "image/png",
				".webp" => "image/webp",
				_ => "image/jpeg",
			};
		}

		private static string Validate(IFormFile file)
		{
			if (file == null || file.Length <= 0)
			{
				return "Debe seleccionar una fotografía.";
			}

			if (file.Length > MaxBytes)
			{
				return "La fotografía no debe superar 5 MB.";
			}

			var extension = Path.GetExtension(file.FileName);
			if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
			{
				return "Formato no permitido. Use JPG, PNG o WEBP.";
			}

			var contentType = (file.ContentType ?? string.Empty).ToLowerInvariant();
			if (!contentType.StartsWith("image/"))
			{
				return "El archivo no es una imagen válida.";
			}

			return null;
		}

		private static bool IsSafeFileName(string fileName)
		{
			return Regex.IsMatch(fileName ?? string.Empty, @"^foto\.(jpg|jpeg|png|webp)$", RegexOptions.IgnoreCase);
		}
	}
}
