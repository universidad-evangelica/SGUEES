// Qué hace: contrato del repositorio de competencias técnicas.
// Cómo: extiende IRepository con operaciones de estado, unicidad de código y consultas jerárquicas del catálogo.
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SGUEES.Repositories
{
    public interface ISC_COMPETENCIAS_TECNICASRepository : IRepository<SC_COMPETENCIAS_TECNICASTable>
    {
        // Qué hace: define el cambio de estado activo/inactivo de la competencia técnica.
        // Cómo: recibe SC_COMPETENCIAS_TECNICASTable con las claves y ejecuta PRAL_MTTO_CATALOGO_ESTADO_BIT.
        Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: define la verificación de unicidad del código dentro de la empresa.
        // Cómo: consulta V_SC_COMPETENCIAS_TECNICAS filtrando por CORR_EMPRESA, CODIGO y excluyendo excludeCorr.
        Task<bool> ExistsCodigoAsync(int corrEmpresa, string codigo, int excludeCorr);
        // Qué hace: define la consulta de candidatos padre por nivel y estado.
        // Cómo: consulta V_SC_COMPETENCIAS_TECNICAS filtrando por CORR_EMPRESA, NIVEL y opcionalmente soloActivos.
        Task<List<SC_COMPETENCIAS_TECNICASView>> GetPadresByNivelAsync(int corrEmpresa, string nivel, bool? soloActivos);
        // Qué hace: define la consulta del catálogo de nivel 3 para el descriptor de puesto.
        // Cómo: une V_SC_COMPETENCIAS_TECNICAS de niveles 1, 2 y 3 activos filtrando por CORR_EMPRESA.
        Task<List<SC_COMPETENCIAS_TECNICASView>> GetCatalogoNivel3DescriptorAsync(int corrEmpresa);
        // Qué hace: define la consulta de códigos hermanos de nivel 3 para calcular el siguiente sufijo.
        // Cómo: consulta V_SC_COMPETENCIAS_TECNICAS filtrando por CORR_EMPRESA, CORR_PADRE y prefijo del código padre.
        Task<List<string>> GetSiblingCodigosLevel3Async(int corrEmpresa, int corrPadre, string parentCodigoPrefix);
        // Qué hace: define la verificación de existencia de nodos hijos asociados.
        // Cómo: consulta V_SC_COMPETENCIAS_TECNICAS filtrando por CORR_EMPRESA y CORR_COMPETENCIAS_TECNICAS_PADRE.
        Task<bool> HasChildrenAsync(int corrEmpresa, int corrCompetencia);
    }
}
