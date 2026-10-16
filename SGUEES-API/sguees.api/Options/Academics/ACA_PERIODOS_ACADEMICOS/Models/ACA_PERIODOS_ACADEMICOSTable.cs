using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PERIODOS_ACADEMICOS.
    // Cómo lo hace: espejo de la tabla; hoy esta carpeta solo expone el combo de ciclos.
    public class ACA_PERIODOS_ACADEMICOSTable : BaseEntity
    {
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int? CORR_FACULTAD { get; set; }
        public int? CORR_CARRERA { get; set; }
        public short ANIO { get; set; }
        public byte? NUMERO_PERIODO { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime FECHA_FIN { get; set; }
        public DateTime FECHA_INICIO_INSCRIPCION { get; set; }
        public DateTime FECHA_FIN_INSCRIPCION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public bool ACTIVO { get; set; }
    }
}
