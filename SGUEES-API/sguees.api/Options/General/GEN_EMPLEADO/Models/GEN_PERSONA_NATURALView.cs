// Qué hace: modelo de vista V_GEN_PERSONA_NATURAL.
// Cómo lo hace: proyecta persona natural + nombres de catálogos asociados.
using System;

namespace sguees.Models
{
	public class GEN_PERSONA_NATURALView
	{
		public long? CORR_PERSONA { get; set; }
		public long CORR_PERSONA_NATURAL { get; set; }
		public string PRIMER_NOMBRE { get; set; }
		public string SEGUNDO_NOMBRE { get; set; }
		public string PRIMER_APELLIDO { get; set; }
		public string SEGUNDO_APELLIDO { get; set; }
		public string APELLIDO_CASADA { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public string FOTO_URL { get; set; }
		public string SEXO { get; set; }
		public string ESTADO_CIVIL { get; set; }
		public string NACIONALIDAD { get; set; }
		public int? EDAD { get; set; }
		public DateTime? FECHA_NACIMIENTO { get; set; }
		public bool? ES_JUBILADO { get; set; }
		public bool? POSEE_DISCAPACIDAD { get; set; }
		public string TIPO_DISCAPACIDAD { get; set; }
		public int? CORR_RELIGION { get; set; }
		public string NOMBRE_RELIGION { get; set; }
		public string IGLESIA_CONGREGA { get; set; }
		public string CARTA_PASTORAL { get; set; }
		public bool? ES_EXTRANJERO { get; set; }
		public string DOMICILIADO { get; set; }
		public int? CORR_PAIS_NACIMIENTO { get; set; }
		public string NOMBRE_PAIS_NACIMIENTO { get; set; }
		public int? CORR_DEPTO_NACIMIENTO { get; set; }
		public string NOMBRE_DEPTO_NACIMIENTO { get; set; }
		public int? CORR_MUNICIPIO_NACIMIENTO { get; set; }
		public string NOMBRE_MUNICIPIO_NACIMIENTO { get; set; }
		public int? CORR_DISTRITO_NACIMIENTO { get; set; }
		public string NOMBRE_DISTRITO_NACIMIENTO { get; set; }
		public int? CORR_ORIGEN_INGRESO { get; set; }
		public string NOMBRE_ORIGEN_INGRESO { get; set; }
		public int? CORR_TIPO_CONTRIBUYENTE { get; set; }
		public string NOMBRE_TIPO_CONTRIBUYENTE { get; set; }
		public int? CORR_ACTIVIDAD_ECONOMICA { get; set; }
		public string NOMBRE_ACTIVIDAD_ECONOMICA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
