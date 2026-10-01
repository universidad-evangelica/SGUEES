namespace sguees.api.Policies
{
    // Qué hace: permisos de las dos vistas del prospecto (mismo componente, dos opciones de menú).
    // Cómo lo hace: cada vista es una URL con su propio permiso en el token; lo que comparten ambas (datos personales,
    //               catálogos) acepta cualquiera de las dos gracias al "OR" de HasScopeHandler ("/a,/b|R").
    //               Cambiar una URL es editar solo este archivo (y SEG_OPCION_SISTEMA).
    public static class PermisosProspecto
    {
        public const string Academico = "/aca-prospecto-academico";
        public const string Economico = "/aca-prospecto-economico";
        public const string Ambos = Academico + "," + Economico;

        public const string LecturaAmbos = Ambos + "|R";
        public const string EdicionAmbos = Ambos + "|U";

        // Encabezado (carrera, ciclo, forma de ingreso) y estudios: solo la vista académica los edita.
        public const string LecturaAcademico = Academico + "|R";
        public const string EdicionAcademico = Academico + "|U";

        // Empleo y estudio socioeconómico: solo la vista socioeconómica.
        public const string LecturaEconomico = Economico + "|R";
        public const string EdicionEconomico = Economico + "|U";
    }
}
