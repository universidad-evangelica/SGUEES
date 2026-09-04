using System;

namespace SGUEES.Models
{
    public class SC_REQUISICION_PERSONALView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_REQUISICION_PERSONAL { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int CORR_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public int CORR_TIPO_MODALIDAD { get; set; }
        public string MODALIDAD_NOMBRE { get; set; }
        public int CORR_TIPO_CONTRATACION { get; set; }
        public string NOMBRE_TIPO_CONTRATACION { get; set; }
        public int CORR_TIPO_VACANTE { get; set; }
        public string NOMBRE_TIPO_VACANTE { get; set; }
        public int CANTIDAD_PLAZAS { get; set; }
        public int PLAZAS_CUBIERTAS { get; set; }
        public DateOnly FECHA_REQUISICION { get; set; }
        public string JUSTIFICACION { get; set; }
        public string CORR_EMPLEADO_SUSTITUTO { get; set; }
        public decimal SALARIO { get; set; }
        public int CORR_ESTADO_REQUISICION { get; set; }
        public DateOnly? FECHA_APROBACION { get; set; }
        public DateOnly? FECHA_CIERRE { get; set; }
        public int TIEMPO_CONTRATO { get; set; }
        public string HORARIO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
