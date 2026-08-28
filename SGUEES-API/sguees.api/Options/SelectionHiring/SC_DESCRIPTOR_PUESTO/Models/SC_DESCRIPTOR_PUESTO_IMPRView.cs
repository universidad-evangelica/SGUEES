using System;

namespace SGUEES.Models
{
    // Qué hace: fila de impresión del Descriptor de puesto (Formato corto).
    // Cómo: mapea result set 1 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO
    //       (descriptor + función CLAVE/SECUNDARIA) + logos del result set 2.
    public class SC_DESCRIPTOR_PUESTO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public DateTime? FECHA_EMISION { get; set; }
        public DateTime? FECHA_REVISION { get; set; }
        public string OBJETIVO_PUESTO { get; set; }
        public int? NUM_PERSONAL_CARGO { get; set; }
        public int? CORR_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public int? CORR_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int? CORR_PUESTO_REPORTA { get; set; }
        // Nombre completo del jefe (GEN_EMPLEADO; CORR_PUESTO_REPORTA = CORR_EMPLEADO).
        public string NOMBRE_EMPLEADO_REPORTA { get; set; }
        public int? CORR_IMPACTO_ECONOMICO { get; set; }
        public string DESCRIPCION_IMPACTO_ECONOMICO { get; set; }
        public string RESPONSABLE { get; set; }
        public string FORMATO { get; set; }
        public int? VERSION { get; set; }
        public int? CORR_ESTADO { get; set; }
        public string NOMBRE_ESTADO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }

        // Función asociada (SC_DESCRIPTOR_PUESTO_FUNCION); null si el descriptor no tiene funciones.
        public int? CORR_FUNCION { get; set; }
        public string NOMBRE_FUNCION { get; set; }
        public string TIPO_FUNCION { get; set; }
        // Nombre ya numerado por tipo ("1. Nombre"); NOMBRE_FUNCION queda sin numerar.
        public string NOMBRE_FUNCION_NUM { get; set; }

        // Encabezado / logos (result set 2).
        public string NOMBRE_EMPRESA { get; set; }
        public string PERIODO { get; set; }
        public byte[] LOGO1 { get; set; }
        public byte[] LOGO2 { get; set; }
        public string TITULO_REPORTE { get; set; }
        public string NOMBRE_SISTEMA { get; set; }
        public DateTime FECHA_IMPRESION { get; set; }
    }
}
