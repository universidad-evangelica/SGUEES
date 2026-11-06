namespace sguees.Models
{
	/// <summary>
	/// Payload de alta/edición de persona (N/J) desde gen-proveedor (subset sin RRHH).
	/// </summary>
	public class GEN_PROVEEDOR_PERSONATable
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public long? CORR_PERSONA_NATURAL { get; set; }
		public long? CORR_PERSONA_JURIDICA { get; set; }
		public string TIPO_PERSONERIA { get; set; }
		public string CODIGO_PERSONA { get; set; }

		/* Natural */
		public string PRIMER_NOMBRE { get; set; }
		public string SEGUNDO_NOMBRE { get; set; }
		public string PRIMER_APELLIDO { get; set; }
		public string SEGUNDO_APELLIDO { get; set; }

		/* Jurídica */
		public string NOMBRE_EMPRESA { get; set; }
		public string RAZON_SOCIAL { get; set; }
		public string GIRO { get; set; }

		public bool? ES_EXTRANJERO { get; set; }
		public string DOMICILIADO { get; set; }
		public int? CORR_TIPO_CONTRIBUYENTE { get; set; }
		public int? CORR_ACTIVIDAD_ECONOMICA { get; set; }

		public string NUMERO_DIP { get; set; }
		public string NUMERO_NIT { get; set; }
		public string NUMERO_NRC { get; set; }

		public string DIRECCION { get; set; }
		public int? CORR_PAIS { get; set; }
		public int? CORR_DEPTO { get; set; }
		public int? CORR_MUNICIPIO { get; set; }
		public int? CORR_DISTRITO { get; set; }

		public string TELEFONO_FIJO { get; set; }
		public string TELEFONO_MOVIL { get; set; }
		public string CORREO_ELECTRONICO_1 { get; set; }
		public string CORREO_ELECTRONICO_2 { get; set; }

		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
