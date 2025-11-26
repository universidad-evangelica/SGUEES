namespace scuees.api.Shared
{
    public enum UserType
    {
        /// <summary>
        /// Usuario de solo consulta
        /// </summary>
        ReadOnlyUser = 1,
        /// <summary>
        /// Usuario Normal del sistema
        /// </summary>
        Normal = 2,
        /// <summary>
        /// Usuario Supervisor o Auditor
        /// </summary>
        Supervisor = 3,
        /// <summary>
        /// Usuario Administrador del sistema
        /// </summary>
        Administrator = 4,
        /// <summary>
        /// Super Administrador con acceso absolutamente a todo
        /// </summary>
        SuperUser = 5
    };
}
