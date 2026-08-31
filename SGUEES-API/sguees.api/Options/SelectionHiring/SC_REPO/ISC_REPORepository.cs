using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Qué hace: puente API Selección y Contratación → SGUEES-RPT.
    // Cómo: PostStreamAsync a controller SelectionHiring (mismo patrón CON_REPO/Accounting).
    public interface ISC_REPORepository
    {
        Task<Stream> GetScDescriptorPuestoFormatoCortoImprAsync(
            List<SC_DESCRIPTOR_PUESTO_IMPRView> data,
            string token);

        Task<Stream> GetScDescriptorPuestoFormatoExtensoImprAsync(
            List<SC_DESCRIPTOR_PUESTO_IMPRView> data,
            string token);
    }
}
