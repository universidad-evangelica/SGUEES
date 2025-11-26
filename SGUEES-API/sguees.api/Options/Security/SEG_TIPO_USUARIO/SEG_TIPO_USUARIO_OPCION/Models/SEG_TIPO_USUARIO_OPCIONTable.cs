using System;
using System.ComponentModel.DataAnnotations;
using eFramework.Core;
using eFramework.Data;

namespace scuees.Models
{
    public class SEG_TIPO_USUARIO_OPCIONTable: BaseEntity
    {
        public int TIPO_USUARIO { get; set; }               
		[StringLength(30, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 30 caracteres")]
        public string CODIGO_SISTEMA { get; set; }        
		[StringLength(10, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 10 caracteres")]
        public string CODIGO_MENU  { get; set; }        
		[StringLength(30, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 30 caracteres")]
        public string CODIGO_OPCION { get; set; }
        public bool NUEVO  { get; set; }
        public bool MODIFICAR  { get; set; }
        public bool ELIMINAR  { get; set; }
        public bool IMPRIMIR  { get; set; }        
		[StringLength(30, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 30 caracteres")]
        public string USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA  { get; set; }        
		[StringLength(50, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 30 caracteres")]        
        public string ESTACION_CREA  { get; set; }
        [StringLength(30, ErrorMessage = "Debe especificar hasta 30 caracteres")]
        public string USUARIO_ACTU  { get; set; }
        public DateTime FECHA_ACTU  { get; set; }
        [StringLength(50, ErrorMessage = "Debe especificar hasta 50 caracteres")]
        public string ESTACION_ACTU { get; set; }
        public bool SELECCION { get; set; }
        public UpdateType MTTO { get; set; } = UpdateType.Browse;
        public SEG_TIPO_USUARIO_OPCIONTable() {
            FECHA_CREA = DateTime.Now;
			FECHA_ACTU = DateTime.Now;
        }	
    }
}
