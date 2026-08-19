using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
    public class SC_SOLICITUD_EMPLEO_COMPLETARParam
    {
        [Required(ErrorMessage = "El token es requerido.")]
        public string TOKEN { get; set; }

        [Required(ErrorMessage = "El primer nombre es requerido.")]
        [StringLength(50)]
        public string NOMBRE1 { get; set; }

        [StringLength(50)]
        public string NOMBRE2 { get; set; }

        [Required(ErrorMessage = "El primer apellido es requerido.")]
        [StringLength(50)]
        public string APELLIDO1 { get; set; }

        [StringLength(50)]
        public string APELLIDO2 { get; set; }

        public DateOnly FECHA_NACIMIENTO { get; set; }
        public int EDAD { get; set; }
        public string ESTADO_CIVIL { get; set; }
        public string NACIONALIDAD { get; set; }

        [Required(ErrorMessage = "El correo es requerido.")]
        public string CORREO { get; set; }

        [Required(ErrorMessage = "El celular es requerido.")]
        public string CELULAR { get; set; }

        public string TELEFONO { get; set; }

        [Required(ErrorMessage = "La dirección es requerida.")]
        public string DIRECCION { get; set; }

        [Required(ErrorMessage = "El DUI es requerido.")]
        public string DUI { get; set; }

        public string PASAPORTE { get; set; }
        public string ISSS { get; set; }
        public string AFP { get; set; }
        public string NOMBRE_AFP { get; set; }
        public string LICENCIA { get; set; }
        public string PLAZA_SOLICITADA { get; set; }
        public int PRETENSION_SALARIAL { get; set; }
        public string DISPONIBILIDAD { get; set; }
        public string RELIGION { get; set; }
        public string IGLESIA { get; set; }
        public string DIRECCION_IGLESIA { get; set; }
        public bool ES_CONTRIBUYENTE_CCF { get; set; }
        public bool ES_JUBILADO { get; set; }
        public bool POSEE_DISCAPACIDAD { get; set; }
        public string TIPO_DISCAPACIDAD { get; set; }

        [Required(ErrorMessage = "El contacto de emergencia es requerido.")]
        public string EMERGENCIA_NOMBRE { get; set; }

        public string EMERGENCIA_PARENTESCO { get; set; }

        [Required(ErrorMessage = "El teléfono de emergencia es requerido.")]
        public string EMERGENCIA_TELEFONO { get; set; }
        public bool TIENE_FAMILIARES_UEES { get; set; }
        public bool DECLARA_VERDAD { get; set; }
        public bool AUTORIZA_VERIFICACION { get; set; }
        public DateTime FECHA_DECLARACION { get; set; }
        public string FIRMA_ELECTRONICA { get; set; }

        public List<SC_PERSONA_FAMILIARTable> FAMILIARES_DIRECTOS { get; set; } = new();
        public List<SC_PERSONA_HIJOSTable> HIJOS { get; set; } = new();
        public List<SC_PERSONA_ESTUDIOTable> ESTUDIOS { get; set; } = new();
        public List<SC_PERSONA_IDIOMASTable> IDIOMAS { get; set; } = new();
        public List<SC_PERSONA_COMPETENCIAS_TECNICASTable> COMPETENCIAS { get; set; } = new();
        public List<SC_PERSONA_EXPERIENCIA_LABORALTable> EXPERIENCIAS { get; set; } = new();
        public List<SC_PERSONA_FAMILIAR_UEESTable> FAMILIARES_UEES { get; set; } = new();
    }
}
