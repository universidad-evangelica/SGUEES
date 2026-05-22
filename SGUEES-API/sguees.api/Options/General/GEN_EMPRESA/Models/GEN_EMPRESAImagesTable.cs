using System;
using Microsoft.AspNetCore.Http;

namespace sguees.Models
{
	public class GEN_EMPRESAImagesTable
	{
		public int CORR_EMPRESA { get; set; }
		public string NOMBRE_EMPRESA { get; set; }
		public string NOMBRE_COMERCIAL { get; set; }
		public string NOMBRE_REPRESENTANTE_LEGAL { get; set; }
		public string GIRO_EMPRESA { get; set; }
		public string DIRECCION_EMPRESA { get; set; }
		public string NUMERO_NIT { get; set; }
		public string NUMERO_NRC { get; set; }
		public string NOMBRE_CONTACTO { get; set; }
		public string TELEFONO_1 { get; set; }
		public string TELEFONO_2 { get; set; }
		public string FAX { get; set; }
		public string CORREO_ELECTRONICO { get; set; }
		public IFormFile Logo1File { get; set; }
		public IFormFile Logo2File { get; set; }
		public string TAMANO_EMPRESA { get; set; }
		public string NATURAL_JURIDICO { get; set; }
		public string CODIGO_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
		public int CORR_DEPTO { get; set; }
		public int CORR_MUNICIPIO { get; set; }
		public string NOMBRE_EMPRESA_LARGO { get; set; }
		public string DIRECCION_EMPRESA_LARGO { get; set; }
		public IFormFile SelloFile { get; set; }
		public string CODIGO_POSTAL { get; set; }
		public int TIPO_INGRESO_ISR { get; set; }
		public int CORR_SECTOR_ECONOMICO { get; set; }
		public bool USA_CAMPOS_LIBRO_IVA { get; set; }
		public bool PERMITE_EDITAR_CAMPOS_LIBRO_IVA { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}