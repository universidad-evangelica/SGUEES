using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class ACA_BEC_TIPOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_BECA { get; set; }
        public string CODIGO_BECA { get; set; }
        public string NOMBRE_BECA { get; set; }
        public int CORR_ORIGEN_BECA { get; set; }
        public int? CORR_CONVENIO { get; set; }
        public string ARTICULO_REGLAMENTO { get; set; }
        public decimal? PORCENTAJE_COBERTURA_REFERENCIAL { get; set; }
        public decimal? CUM_MINIMO_RENOVACION { get; set; }
        public bool APLICA_NUEVO_INGRESO { get; set; } = true;
        public bool APLICA_ANTIGUO_INGRESO { get; set; } = true;
        public bool APLICA_EMPLEADO { get; set; }
        public bool APLICA_HIJO_EMPLEADO { get; set; }
        public string NIVEL_ACADEMICO_APLICA { get; set; } = "TODOS";
        public bool REQUIERE_CONVENIO { get; set; }
        public bool REQUIERE_ESTUDIO_SOCIOECONOMICO { get; set; }
        public bool REQUIERE_APROBACION_COMITE { get; set; } = true;
        public bool REQUIERE_APROBACION_DIRECTORIO { get; set; } = true;
        public string UNIDAD_RESPONSABLE { get; set; }
        public string DESCRIPCION { get; set; }
        public string ESTADO_BECA { get; set; } = "ACTIVA";
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
