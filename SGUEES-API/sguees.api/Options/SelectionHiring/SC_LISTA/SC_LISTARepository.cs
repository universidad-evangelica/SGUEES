using System.Collections.Generic;
using eFramework.Core;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public class SC_LISTARepository : ISC_LISTARepository
    {
        public SC_LISTARepository(IConfiguration config)
        {
        }

        public CResult GetNIVEL_DOMINIO()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "BASICO", Value = "Basico" },
                new() { Key = "INTERMEDIO", Value = "Intermedio" },
                new() { Key = "AVANZADO", Value = "Avanzado" },
            });
        }

        public CResult GetSEXO()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "INDIFERENTE", Value = "Indiferente" },
                new() { Key = "MASCULINO", Value = "Masculino" },
                new() { Key = "FEMENINO", Value = "Femenino" },
            });
        }

        public CResult GetESTADO_FAMILIAR()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "INDIFERENTE", Value = "Indiferente" },
                new() { Key = "SOLTERO", Value = "Soltero(a)" },
                new() { Key = "CASADO", Value = "Casado(a)" },
                new() { Key = "OTRO", Value = "Otro" },
            });
        }

        public CResult GetLICENCIA()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = false, Value = "No" },
                new() { Key = true, Value = "Si" },
            });
        }

        public CResult GetTIPO_REQUERIDO()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "SI", Value = "Si" },
                new() { Key = "NO", Value = "No" },
                new() { Key = "DESEABLE", Value = "Deseable" },
            });
        }

        public CResult GetFORMATO()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "CORTO", Value = "Version corta" },
                new() { Key = "EXTENSO", Value = "Version extensa" },
                new() { Key = "AMBOS", Value = "Ambos" },
            });
        }

        // Qué hace: estados de flujo del Descriptor de puesto para filtro del listado.
        // Cómo: lista fija alineada a NOMBRE_ESTADO del flujo (SEG_FLUJO / SC_DESCRIPTOR_PUESTO).
        public CResult GetESTADO_DESCRIPTOR()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "Borrador", Value = "Borrador" },
                new() { Key = "Observado", Value = "Observado" },
                new() { Key = "Enviado JI", Value = "Enviado JI" },
                new() { Key = "Aprobado JI", Value = "Aprobado JI" },
                new() { Key = "Enviado a JTH", Value = "Enviado a JTH" },
                new() { Key = "Activo", Value = "Activo" },
                new() { Key = "Inactivo", Value = "Inactivo" },
            });
        }

        // Qué hace: entrega las unidades de tiempo válidas para el catálogo de inducción.
        // Cómo: lista fija que coincide exacto con el CHECK de SC_INDUCCION.UNIDAD_TIEMPO ('Semanas'/'Meses').
        public CResult GetUNIDAD_TIEMPO_INDUCCION()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "Semanas", Value = "Semanas" },
                new() { Key = "Meses", Value = "Meses" },
            });
        }

        public CResult GetNIVEL()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = "NIV1", Value = "Nivel 1" },
                new() { Key = "NIV2", Value = "Nivel 2" },
                new() { Key = "NIV3", Value = "Nivel 3" },
            });
        }

        private static CResult Ok(List<SC_LISTAView> data)
        {
            return new CResult
            {
                Data = data,
                Result = true,
                RowsAffected = data.Count,
                CodeHelper = 0,
                ErrorCode = 0,
                ErrorMessage = "",
                ErrorSource = "",
            };
        }
    }
}
