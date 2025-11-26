namespace scuees.api.Shared
{
    public enum UserStatus
    {
        /// <summary>
        /// Usuario pendiente de activar
        /// </summary>
        Pending = 0,
        /// <summary>
        /// Usuario Activo
        /// </summary>
        Active = 1,
        /// <summary>
        /// Usuario Suspendido
        /// </summary>
        Suspended = 2,
        /// <summary>
        /// Usuario Cancelado
        /// </summary>
        Canceled = 3
    }
}
