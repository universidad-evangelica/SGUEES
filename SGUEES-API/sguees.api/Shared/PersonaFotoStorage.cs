using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace sguees.api.Shared
{
    public class PersonaFotoStorage
    {
        public const int MaxBytes = 5 * 1024 * 1024;
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };

        private readonly string _rootPath;

        public PersonaFotoStorage(IWebHostEnvironment environment)
        {
            _rootPath = Path.Combine(environment.ContentRootPath, "uploads", "sc-persona-datos");
        }

        public string TempDirectory(string tokenHash)
        {
            return Path.Combine(_rootPath, "temp", SafeTokenFolder(tokenHash));
        }

        public string FinalDirectory(int corrEmpresa, int corrPersonaDatos)
        {
            return Path.Combine(_rootPath, $"{corrEmpresa}_{corrPersonaDatos}");
        }

        public string RelativeUrl(int corrEmpresa, int corrPersonaDatos, string fileName)
        {
            return $"/uploads/sc-persona-datos/{corrEmpresa}_{corrPersonaDatos}/{fileName}";
        }

        public bool TryResolveFinalFile(string fotoUrl, out string physicalPath)
        {
            physicalPath = null;
            if (string.IsNullOrWhiteSpace(fotoUrl))
            {
                return false;
            }

            var relative = fotoUrl.Trim().Replace('\\', '/').TrimStart('/');
            const string prefix = "uploads/sc-persona-datos/";
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

        public async Task<(bool Ok, string Error, string FileName)> SaveTempAsync(string tokenHash, IFormFile file)
        {
            var validation = Validate(file);
            if (validation != null)
            {
                return (false, validation, null);
            }

            var extension = Path.GetExtension(file.FileName);
            var fileName = "foto" + extension.ToLowerInvariant();
            var directory = TempDirectory(tokenHash);
            Directory.CreateDirectory(directory);

            foreach (var existing in Directory.EnumerateFiles(directory, "foto.*"))
            {
                File.Delete(existing);
            }

            var destination = Path.Combine(directory, fileName);
            await using (var stream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream);
            }

            return (true, null, fileName);
        }

        public string MoveTempToFinal(string tokenHash, int corrEmpresa, int corrPersonaDatos)
        {
            var tempDir = TempDirectory(tokenHash);
            if (!Directory.Exists(tempDir))
            {
                return null;
            }

            var tempFile = Directory.EnumerateFiles(tempDir, "foto.*").FirstOrDefault();
            if (tempFile == null)
            {
                TryDeleteDirectory(tempDir);
                return null;
            }

            var fileName = Path.GetFileName(tempFile);
            var finalDir = FinalDirectory(corrEmpresa, corrPersonaDatos);
            Directory.CreateDirectory(finalDir);

            foreach (var existing in Directory.EnumerateFiles(finalDir, "foto.*"))
            {
                File.Delete(existing);
            }

            var destination = Path.Combine(finalDir, fileName);
            File.Move(tempFile, destination, overwrite: true);
            TryDeleteDirectory(tempDir);
            return RelativeUrl(corrEmpresa, corrPersonaDatos, fileName);
        }

        public void DeleteTemp(string tokenHash)
        {
            TryDeleteDirectory(TempDirectory(tokenHash));
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

        private static string SafeTokenFolder(string tokenHash)
        {
            var hash = (tokenHash ?? string.Empty).Trim().ToLowerInvariant();
            if (!Regex.IsMatch(hash, @"^[a-f0-9]{64}$"))
            {
                throw new InvalidOperationException("Token hash inválido.");
            }

            return hash;
        }

        private static bool IsSafeFileName(string fileName)
        {
            return Regex.IsMatch(fileName ?? string.Empty, @"^foto\.(jpg|jpeg|png|webp)$", RegexOptions.IgnoreCase);
        }

        private static void TryDeleteDirectory(string path)
        {
            try
            {
                if (Directory.Exists(path))
                {
                    Directory.Delete(path, recursive: true);
                }
            }
            catch
            {
                // No bloquear el flujo público si falla la limpieza de temp.
            }
        }
    }
}
