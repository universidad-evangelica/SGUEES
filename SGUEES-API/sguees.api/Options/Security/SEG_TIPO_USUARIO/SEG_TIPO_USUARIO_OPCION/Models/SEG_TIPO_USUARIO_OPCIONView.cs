using System;
using eFramework.Core;

namespace scuees.Models
{
    public class SEG_TIPO_USUARIO_OPCIONView
    {
        public int TIPO_USUARIO { get; set; }                      
        public string CODIGO_SISTEMA { get; set; }     
        public string NOMBRE_SISTEMA { get; set; }        
        public string IMAGEN_SISTEMA { get; set; }           
        public string CODIGO_MENU  { get; set; }        
        public string NOMBRE_MENU  { get; set; }        
        public string IMAGEN_MENU  { get; set; }        
        public string CODIGO_OPCION { get; set; }
        public string NOMBRE_OPCION { get; set; }
        public string IMAGEN_OPCION { get; set; }
        public string URL_OPCION { get; set; }
        public bool NUEVO  { get; set; }
        public bool MODIFICAR  { get; set; }
        public bool ELIMINAR  { get; set; }
        public bool IMPRIMIR  { get; set; }        
        public string USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA  { get; set; }        
        public string ESTACION_CREA  { get; set; }        
        public string USUARIO_ACTU  { get; set; }
        public DateTime FECHA_ACTU  { get; set; }        
        public string ESTACION_ACTU { get; set; }   
        public int ORDEN_SISTEMA { get; set; }
        public int ORDEN_MENU { get; set; }
        public int ORDEN_OPCION { get; set; }
        public string PERMISO { get; set; }
        public bool SELECCION { get; set; }
        public UpdateType MTTO { get; set; } = UpdateType.Browse;
    }
}
