namespace sguees.Models
{
	/// <summary>
	/// Vista aplanada de persona para resumen/edición en gen-proveedor.
	/// </summary>
	public class GEN_PROVEEDOR_PERSONAView
	{
		public long CORR_PERSONA { get; set; }
		public string CODIGO_PERSONA { get; set; }
		public bool ACTIVO_PERSONA { get; set; }
		public string TIPO_PERSONERIA { get; set; }
		public string NOMBRE_TIPO_PERSONERIA { get; set; }
		public string NOMBRE_PERSONA { get; set; }

		public long? CORR_PERSONA_NATURAL { get; set; }
		public string PRIMER_NOMBRE { get; set; }
		public string SEGUNDO_NOMBRE { get; set; }
		public string PRIMER_APELLIDO { get; set; }
		public string SEGUNDO_APELLIDO { get; set; }

		public long? CORR_PERSONA_JURIDICA { get; set; }
		public string NOMBRE_EMPRESA { get; set; }
		public string RAZON_SOCIAL { get; set; }
		public string GIRO { get; set; }

		public bool ES_EXTRANJERO { get; set; }
		public string DOMICILIADO { get; set; }
		public int? CORR_TIPO_CONTRIBUYENTE { get; set; }
		public string NOMBRE_TIPO_CONTRIBUYENTE { get; set; }
		public int? CORR_ACTIVIDAD_ECONOMICA { get; set; }
		public string NOMBRE_ACTIVIDAD_ECONOMICA { get; set; }

		public string NUMERO_DIP { get; set; }
		public string NUMERO_NIT { get; set; }
		public string NUMERO_NRC { get; set; }

		public string DIRECCION { get; set; }
		public int? CORR_PAIS { get; set; }
		public string NOMBRE_PAIS { get; set; }
		public int? CORR_DEPTO { get; set; }
		public string NOMBRE_DEPTO { get; set; }
		public int? CORR_MUNICIPIO { get; set; }
		public string NOMBRE_MUNICIPIO { get; set; }
		public int? CORR_DISTRITO { get; set; }

		public string TELEFONO_FIJO { get; set; }
		public string TELEFONO_MOVIL { get; set; }
		public string CORREO_ELECTRONICO_1 { get; set; }
		public string CORREO_ELECTRONICO_2 { get; set; }
	}
}
