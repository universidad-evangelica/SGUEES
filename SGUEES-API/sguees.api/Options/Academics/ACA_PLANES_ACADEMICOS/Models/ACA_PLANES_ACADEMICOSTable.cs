using System;
using System.ComponentModel.DataAnnotations;
using eFramework.Data;
namespace sguees.Models
{
    public class ACA_PLANES_ACADEMICOSTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_PLAN_ACADEMICO { get; set; }
        [StringLength(20)]
        public string CODIGO_PLAN { get; set; }
        public int CORR_MODALIDAD { get; set; }
        public int ANIO_PLAN { get; set; }
        public DateTime? FECHA_VIGENCIA_INICIO { get; set; }
        public DateTime? FECHA_VIGENCIA_FIN { get; set; }
        // PLAN_VIGENTE y auditoría se resuelven exclusivamente en el servidor.
    }
    public class ACA_PLANES_ACADEMICOSParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_PLAN_ACADEMICO { get; set; }
    }
    public class ACA_PLANES_ACADEMICOSView
    {
        public int CORR_PLAN_ACADEMICO { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string CODIGO_PLAN { get; set; }
        public int CORR_MODALIDAD { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
        public short ANIO_PLAN { get; set; }
        public DateTime FECHA_VIGENCIA_INICIO { get; set; }
        public DateTime? FECHA_VIGENCIA_FIN { get; set; }
        public bool PLAN_VIGENTE { get; set; }
        public bool EN_USO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
    public class ACA_MODALIDADES_CARRERAView
    {
        public int Key { get; set; }
        public string Value { get; set; }
        public bool ACTIVO { get; set; }
    }
}
