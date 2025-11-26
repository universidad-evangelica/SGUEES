using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_JSON_DOC_PDFTable: BaseEntity
	{
        public int CORR_SUSCRIPCION { get; set; }
		public int CORR_CONFI_PAIS { get; set; }
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_DOCUMENTO_DOC { get; set; }
		public String NOMBRE_DOCUMENTO { get; set; }
        public String DESCRIPCION_DOCUMENTO { get; set; }
        public Int32 CORR_TIPO_DOCUMENTO { get; set; }
        public String NOMBRE_ARCHIVO { get; set; }
        public IFormFile FOTO_DOCUMENTO { get; set; }
        public String USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public String ESTACION_CREA { get; set; }
        public String USUARIO_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
        public String ESTACION_ACTU { get; set; }
	}
}
