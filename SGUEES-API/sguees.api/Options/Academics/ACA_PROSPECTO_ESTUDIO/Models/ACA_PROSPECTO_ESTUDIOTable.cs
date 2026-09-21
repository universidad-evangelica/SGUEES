using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_ESTUDIO para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_ESTUDIO.
    public class ACA_PROSPECTO_ESTUDIOTable : BaseEntity
    {
        public int CORR_PROSPECTO_ESTUDIO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int? CORR_TIPO_INSTITUCION { get; set; }
        public int? CORR_GRADO_ACADEMICO { get; set; }
        public int? CORR_PAIS { get; set; }
        public int? CORR_DEPTO { get; set; }
        public int? CORR_MUNICIPIO { get; set; }
        public int? CORR_CARRERA { get; set; }
        public string NOMBRE_INSTITUCION { get; set; }
        public string TIPO_INSTITUCION { get; set; }
        public string TIPO_EDUCACION { get; set; }
        public string TITULO_OBTENIDO { get; set; }
        public string CARRERA_TEXTO { get; set; }
        public string NIVEL_CURSADO { get; set; }
        public string BACHILLER_OPCION { get; set; }
        public short? ANIO_TITULACION { get; set; }
        public DateTime? FECHA_EGRESO { get; set; }
        public DateTime? FECHA_GRADUACION { get; set; }
        public decimal? CUOTA { get; set; }
        public string QUIEN_PAGO_CUOTA { get; set; }
        public bool GRADUADO { get; set; }
        public bool GRADUADO_UEES { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string NIVEL_ESTUDIO { get; set; }
    }
}
