namespace sguees.api.Shared
{
	public class ProveedorDocumentoOptions
	{
		public const string SectionName = "ProveedorDocumento";

		/// <summary>Límite máximo de archivo en bytes (default 10 MB).</summary>
		public int MaxBytes { get; set; } = 10 * 1024 * 1024;
	}
}
