using System;
using Microsoft.AspNetCore.Http;

namespace SGUEES.Models
{
	public class SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOUploadTable
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_EXPEDIENTE_ENTREVISTA { get; set; }
		public int CORR_ENTREVISTA_DOCUMENTO { get; set; }
		public DateTime FECHA_CARGA { get; set; }
		public string NOTAS { get; set; }
		public IFormFile ARCHIVO_DOCUMENTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
