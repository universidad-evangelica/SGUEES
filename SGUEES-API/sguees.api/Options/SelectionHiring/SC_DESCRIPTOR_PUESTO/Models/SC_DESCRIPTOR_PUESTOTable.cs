using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_DESCRIPTOR_PUESTOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int? CORR_PUESTO { get; set; }
        public int? CORR_UNIDAD { get; set; }
        public DateTime? FECHA_EMISION { get; set; }
        public int? CORR_PUESTO_REPORTA { get; set; }
        public DateTime? FECHA_REVISION { get; set; }
        public int? NUM_PERSONAL_CARGO { get; set; }
        public string OBJETIVO_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int? CORR_IMPACTO_ECONOMICO { get; set; }
        public string DESCRIPCION_IMPACTO_ECONOMICO { get; set; }
        public int? CORR_INDUCCION { get; set; }
        public string NOMBRE_INDUCCION { get; set; }
        public int? SEMANAS_INDUCCION { get; set; }
        public string RESPONSABLE { get; set; }
        public string FORMATO { get; set; }
        public int? VERSION { get; set; }
        public string ESTADO_DESCRIPTOR { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
