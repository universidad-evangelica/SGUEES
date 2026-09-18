using System;

namespace sguees.Models
{
	// Qué hace: proyección de V_GEN_EMPLEADO para grilla/lookups.
	// Cómo lo hace: mapea columnas de la vista (persona, documentos DUI/NIT, empleado).
	public class GEN_EMPLEADOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public long CORR_PERSONA { get; set; }
		public string CODIGO_EMPLEADO { get; set; }
		public string NOMBRE_EMPLEADO { get; set; }
		public string NOMBRE_1 { get; set; }
		public string NOMBRE_2 { get; set; }
		public string APELLIDO_1 { get; set; }
		public string APELLIDO_2 { get; set; }
		public string APELLIDO_3 { get; set; }
		public string DUI { get; set; }
		public string NIT { get; set; }
		public string CORREO_ELECTRONICO { get; set; }
		public string CORREO_INSTITUCIONAL { get; set; }
		public string TELEFONO_1 { get; set; }
		public string TELEFONO_INSTITUCIONAL { get; set; }
		public DateTime? FECHA_INGRESO { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public int CORR_DEPARTAMENTO { get; set; }
		public int CORR_PUESTO { get; set; }
		public bool ACTIVO_EMPLEADO { get; set; }
		public string ESTADO_EMPLEADO { get; set; }
		public string NOMBRE_ESTADO_EMPLEADO { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public string LOGIN_SISTEMA_WEB { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
