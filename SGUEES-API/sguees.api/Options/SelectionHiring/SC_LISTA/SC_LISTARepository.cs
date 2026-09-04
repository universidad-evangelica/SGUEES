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
                new() { Key = "CORTO", Value = "Formato corto" },
                new() { Key = "EXTENSO", Value = "Formato extenso" },
                new() { Key = "AMBOS", Value = "Ambos" },
            });
        }

        // Qué hace: estados de flujo del Descriptor de puesto para filtro del listado.
        // Cómo: Key = CORR_ESTADO (SEG_FLUJO_ESTADO), Value = nombre visible; orden de flujo.
        public CResult GetESTADO_DESCRIPTOR()
        {
            return Ok(new List<SC_LISTAView>
            {
                new() { Key = 11, Value = "Borrador" },
                new() { Key = 15, Value = "Observado" },
                new() { Key = 16, Value = "Enviado a Jefe Inmediato" },
                new() { Key = 12, Value = "Aprobado por Jefe Inmediato" },
                new() { Key = 13, Value = "Revisado por Talento Humano" },
                new() { Key = 17, Value = "Enviado a Jefe de Talento Humano" },
                new() { Key = 14, Value = "Activo" },
                new() { Key = 18, Value = "Inactivo" },
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
