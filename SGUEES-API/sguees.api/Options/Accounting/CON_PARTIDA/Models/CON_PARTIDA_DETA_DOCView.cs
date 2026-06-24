using System;

namespace sguees.Models
{
	public class CON_PARTIDA_DETA_DOCView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public int CORR_PARTIDA_DETA { get; set; }
		public string TIPO_DOCUMENTO { get; set; }
		public DateTime FECHA_DOCUMENTO { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public int ANIO_PERIODO_DOC { get; set; }
		public int MES_PERIODO_DOC { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string FORMA { get; set; }
		public string ID_DOCUMENTO { get; set; }
	}
}
