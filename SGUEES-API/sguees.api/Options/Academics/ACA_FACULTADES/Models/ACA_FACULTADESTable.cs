using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: fila de dbo.ACA_FACULTADES que recibe el API al crear, editar o cambiar estado.
    // Cómo lo hace: los tipos coinciden con la tabla; CORR_FACULTAD es IDENTITY y lo genera la base.
    public class ACA_FACULTADESTable : BaseEntity
    {
        public int CORR_FACULTAD { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string CODIGO_FACULTAD { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public bool? ACTIVO { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
