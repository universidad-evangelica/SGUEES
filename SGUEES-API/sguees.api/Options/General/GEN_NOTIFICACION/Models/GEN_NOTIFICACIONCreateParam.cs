namespace sguees.Models
{
	/// <summary>
	/// Parámetros para creación interna (sin endpoint HTTP público).
	/// Destinatario y empresa los fija el servicio llamador, no el cliente de bandeja.
	/// </summary>
	public class GEN_NOTIFICACIONCreateParam
	{
		public int CORR_EMPRESA { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public string TITULO { get; set; }
		public string MENSAJE { get; set; }
		public string URL_DESTINO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
	}
}
