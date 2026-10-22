// Qué hace: modelo que representa la persona natural asignada a un usuario.
// Cómo lo hace: contiene campos de identificación, nombre, tipo (empleado/estudiante/proveedor/natural), DUI y fecha de asociación.
using System;

namespace sguees.Models
{
	public class SEG_USUARIO_PERSONA_ASIGNADAView
	{
		public long CORR_PERSONA { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public long CORR_PERSONA_NATURAL { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public string PRIMER_NOMBRE { get; set; }
		public string PRIMER_APELLIDO { get; set; }
		public string SEXO { get; set; }
		public bool ACTIVO_PERSONA { get; set; } = true;
		public string FOTO_URL { get; set; }
		public string TIPO_PERSONA { get; set; }
		public string DUI { get; set; }
		public DateTime? FECHA_ASOCIACION { get; set; }
		public string USUARIO_ASIGNADO { get; set; }
	}
}
