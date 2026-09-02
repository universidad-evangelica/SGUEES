namespace sguees.api.Shared
{
	public class ExpedienteEntrevistaDocumentoOptions
	{
		public const string SectionName = "ExpedienteEntrevistaDocumento";

		/// <summary>Tamaño máximo del archivo en bytes (default 10 MB).</summary>
		public int MaxBytes { get; set; } = 10 * 1024 * 1024;
	}
}
