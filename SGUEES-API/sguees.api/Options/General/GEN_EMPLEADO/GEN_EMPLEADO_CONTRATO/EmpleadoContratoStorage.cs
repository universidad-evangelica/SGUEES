// Qué hace: almacenamiento físico seguro de documentos de contratos firmados por empleado.
// Cómo lo hace: guarda archivos validados en uploads/gen-empleado-contrato/{CORR_EMPLEADO}/ y resuelve rutas validando path traversal.
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace sguees.api.Options.General.GEN_EMPLEADO.GEN_EMPLEADO_CONTRATO
{
	public class EmpleadoContratoStorage
	{
		private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
		{
			".pdf", ".jpg", ".jpeg", ".png", ".webp"
		};

		private const int MaxBytes = 10 * 1024 * 1024;
		private readonly string _rootPath;

		public EmpleadoContratoStorage(IWebHostEnvironment environment)
		{
			_rootPath = Path.Combine(environment.ContentRootPath, "uploads", "gen-empleado-contrato");
		}

		// Qué hace: construye la ruta relativa estándar dentro de uploads/gen-empleado-contrato.
		// Cómo lo hace: organiza por CORR_EMPLEADO con nombre determinístico empresa_empleado_contrato.ext.
		public static string BuildRelativePath(int corrEmpresa, int corrEmpleado, int corrContrato, string extension)
		{
			var ext = NormalizeExtension(extension);
			return $"/uploads/gen-empleado-contrato/{corrEmpleado}/{corrEmpresa}_{corrEmpleado}_{corrContrato}{ext}";
		}

		// Qué hace: valida que la ruta relativa pertenezca a uploads/gen-empleado-contrato y exista en disco.
		// Cómo lo hace: verifica prefijo, patrón estricto sin '..' y coincidencia bajo _rootPath.
		public bool TryResolvePhysicalPath(string relativePath, out string physicalPath)
		{
			physicalPath = null;
			if (string.IsNullOrWhiteSpace(relativePath))
			{
				return false;
			}

			var relative = relativePath.Trim().Replace('\\', '/').TrimStart('/');
			const string prefix = "uploads/gen-empleado-contrato/";
			if (!relative.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
			{
				return false;
			}

			var remainder = relative[prefix.Length..];
			if (string.IsNullOrWhiteSpace(remainder)
				|| remainder.Contains("..", StringComparison.Ordinal)
				|| !Regex.IsMatch(remainder, @"^\d+/\d+_\d+_\d+\.[a-z0-9]+$", RegexOptions.IgnoreCase))
			{
				return false;
			}

			var segments = remainder.Split('/', StringSplitOptions.RemoveEmptyEntries);
			physicalPath = Path.GetFullPath(Path.Combine(new[] { _rootPath }.Concat(segments).ToArray()));
			var rootFull = Path.GetFullPath(_rootPath) + Path.DirectorySeparatorChar;
			return physicalPath.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase)
				&& File.Exists(physicalPath);
		}

		// Qué hace: valida y guarda en disco el PDF o imagen del contrato firmado.
		// Cómo lo hace: comprueba extensión y tamaño máximo, crea la carpeta del empleado y escribe el archivo.
		public async Task<(bool Ok, string Error, string RelativePath, string FileName)> SaveAsync(
			int corrEmpresa,
			int corrEmpleado,
			int corrContrato,
			IFormFile file)
		{
			var validation = Validate(file);
			if (validation != null)
			{
				return (false, validation, null, null);
			}

			if (corrEmpresa <= 0 || corrEmpleado <= 0 || corrContrato <= 0)
			{
				return (false, "Identificador de contrato inválido.", null, null);
			}

			var folder = Path.Combine(_rootPath, corrEmpleado.ToString());
			Directory.CreateDirectory(folder);

			var extension = NormalizeExtension(Path.GetExtension(file.FileName));
			var storedName = $"{corrEmpresa}_{corrEmpleado}_{corrContrato}{extension}";
			var destination = Path.Combine(folder, storedName);

			await using (var stream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None))
			{
				await file.CopyToAsync(stream);
			}

			return (
				true,
				null,
				BuildRelativePath(corrEmpresa, corrEmpleado, corrContrato, extension),
				Path.GetFileName(file.FileName));
		}

		// Qué hace: elimina un archivo previo en disco si la ruta es válida.
		// Cómo lo hace: resuelve la ruta física segura e intenta File.Delete sin propagar errores de E/S.
		public void DeleteByRelativePath(string relativePath)
		{
			if (!TryResolvePhysicalPath(relativePath, out var physicalPath))
			{
				return;
			}

			try
			{
				File.Delete(physicalPath);
			}
			catch
			{
				// Ignorar error de borrado físico para no bloquear la transacción en BD.
			}
		}

		// Qué hace: devuelve el MIME type correspondiente a la extensión del archivo.
		// Cómo lo hace: mapea pdf e imágenes permitidas con application/octet-stream como respaldo.
		public static string GetContentType(string fileName)
		{
			var ext = NormalizeExtension(Path.GetExtension(fileName));
			return ext switch
			{
				".pdf" => "application/pdf",
				".jpg" or ".jpeg" => "image/jpeg",
				".png" => "image/png",
				".webp" => "image/webp",
				_ => "application/octet-stream",
			};
		}

		private static string Validate(IFormFile file)
		{
			if (file == null || file.Length <= 0)
			{
				return "Debe seleccionar un archivo firmado válido.";
			}

			if (file.Length > MaxBytes)
			{
				return "El archivo firmado no puede superar 10 MB.";
			}

			var ext = NormalizeExtension(Path.GetExtension(file.FileName));
			if (!AllowedExtensions.Contains(ext))
			{
				return "Formato no permitido. Use PDF o imagen (JPG, PNG, WEBP).";
			}

			return null;
		}

		private static string NormalizeExtension(string extension)
		{
			return string.IsNullOrWhiteSpace(extension) ? ".pdf" : extension.Trim().ToLowerInvariant();
		}
	}
}

