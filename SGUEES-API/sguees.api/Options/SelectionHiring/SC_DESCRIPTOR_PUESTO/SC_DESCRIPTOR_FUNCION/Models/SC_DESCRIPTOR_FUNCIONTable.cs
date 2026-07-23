using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de escritura de la tabla SC_DESCRIPTOR_FUNCION: funciones (esenciales/periódicas) asociadas
    // a un descriptor de puesto.
    public class SC_DESCRIPTOR_FUNCIONTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de esta función.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public string NOMBRE_FUNCION { get; set; }
        // Clasificación de la función, por ejemplo ESENCIAL o PERIODICA.
        public string TIPO_FUNCION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
