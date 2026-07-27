using eFramework.Data;



namespace sguees.Models

{

	public class BAN_TIPO_MOVI_SEGUN_BANCARIOTable : BaseEntity

	{

		public int CORR_EMPRESA { get; set; }

		public int CORR_TIPO_MOVIMIENTO { get; set; }

		public int CORR_BANCO { get; set; }

		public string CODIGO_MOVIMIENTO { get; set; }

		public string NOMBRE_MOVIMIENTO_SEGUN_BANCO { get; set; }

	}

}

