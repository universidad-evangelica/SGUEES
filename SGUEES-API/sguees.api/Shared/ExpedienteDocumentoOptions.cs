namespace sguees.api.Shared
{
	public class ExpedienteDocumentoOptions
	{
		public const string SectionName = "ExpedienteDocumento";

		/// <summary>Tamaño máximo del archivo en bytes (default 10 MB).</summary>
		public int MaxBytes { get; set; } = 10 * 1024 * 1024;
	}
}
