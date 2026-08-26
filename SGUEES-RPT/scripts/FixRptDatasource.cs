/*
  Consolida datasources .rpt al patron Compras (una sola tabla de datos en runtime).
  - Mueve campos {GEN_PARAMETRO.*} -> {TablaDatos.*}
  - No renombra alias de tabla (Crystal SDK no lo permite sin objeto SQL)
  - Para renombrar a *_IMPRView y quitar tabla huerfana: Crystal Designer (Database Expert)
*/
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;

internal static class FixRptDatasource
{
    private sealed class MapEntry
    {
        public string RptPath;
        public string[] DataTableNames;
        public string[] ReplaceFrom;
    }

    private static readonly string Root = ResolveReportsRoot();

    private static string ResolveReportsRoot()
    {
        var candidates = new[]
        {
            Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "sguees-rpt", "Reports")),
            Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "sguees-rpt", "Reports")),
        };

        foreach (var candidate in candidates)
        {
            if (Directory.Exists(candidate))
            {
                return candidate;
            }
        }

        return candidates[0];
    }

    private static readonly MapEntry[] Maps =
    {
        new MapEntry
        {
            RptPath = @"Accounting\CON_PARTIDA\PARTIDA_CONTABLEReport.rpt",
            DataTableNames = new[] { "V_CON_PARTIDA_IMPR" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\CON_GASTOS\CON_REPORTE_GASTOSReport.rpt",
            DataTableNames = new[] { "V_CON_REPORTE_GASTOS", "PRAL_IMPR_CON_REPORTE_GASTOS" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\BALANCE_GENERAL\BALANCE_GENERALReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_BALANCE_GENERAL" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\BALANCE_GENERAL_VERTICAL\BALANCE_GENERAL_VERTICALReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_BALANCE_GENERAL_VERTICAL", "PRAL_IMPR_ESTADO_RESULTADOS" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\BALANCE_COMPROBACION\BALANCE_COMPROBACIONReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_BALANCE_COMPROBACION" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\BALANCE_COMPROBACION_MES\BALANCE_COMPROBACION_MESReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_BALANCE_COMPROBACION" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\ESTADO_RESULTADOS\ESTADO_RESULTADOSReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_ESTADO_RESULTADOS" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\LIBRO_DIARIO_AUXILIAR\LIBRO_DIARIO_AUXILIARReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_LIBRO_DIARIO_AUXILIAR" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\LIBRO_DIARIO_AUXILIAR_MES\LIBRO_DIARIO_AUXILIAR_MESReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_LIBRO_DIARIO_AUXILIAR" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Accounting\LIBRO_DIARIO_MAYOR\LIBRO_DIARIO_MAYORReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_LIBRO_DIARIO_MAYOR" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Banking\BAN_CHEQUE_EMITIDOS\BAN_CHEQUE_EMITIDOSReport.rpt",
            DataTableNames = new[] { "V_BAN_DOCUMENTO" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Banking\BAN_ESTADO_CUENTA\BAN_ESTADO_CUENTAReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_BAN_ESTADO_CUENTA" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Banking\BAN_ESTADO_CUENTA_ACUMULADO\BAN_ESTADO_CUENTA_ACUMULADOReport.rpt",
            DataTableNames = new[] { "PRAL_IMPR_BAN_ESTADO_CUENTA_ACUMULADO" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
        new MapEntry
        {
            RptPath = @"Banking\BAN_ENTREGA_CHEQUES\BAN_ENTREGA_CHEQUESReport.rpt",
            DataTableNames = new[] { "V_BAN_ENTREGA_CHEQUES" },
            ReplaceFrom = new[] { "GEN_PARAMETRO" }
        },
    };

    private static int Main(string[] args)
    {
        var apply = args.Any(a => string.Equals(a, "--apply", StringComparison.OrdinalIgnoreCase));
        var dryRun = !apply;
        Console.WriteLine(dryRun ? "DRY-RUN (use --apply para guardar)" : "APLICANDO cambios");

        foreach (var map in Maps)
        {
            var path = Path.Combine(Root, map.RptPath);
            if (!File.Exists(path))
            {
                Console.WriteLine("SKIP (no existe): " + path);
                continue;
            }

            Console.WriteLine("=== " + map.RptPath + " ===");
            FixReport(path, map, dryRun);
        }

        return 0;
    }

    private static void FixReport(string path, MapEntry map, bool dryRun)
    {
        var report = new ReportDocument();
        try
        {
            report.Load(path);
            Console.WriteLine("Tablas:");
            LogTables(report);

            var mainTable = FindMainTable(report, map);
            if (mainTable == null)
            {
                Console.WriteLine("  Sin tabla de datos.");
                return;
            }

            var targetTable = GetShortName(mainTable.Name);
            Console.WriteLine("  Tabla destino campos: " + targetTable);

            var changed = ReplaceFieldReferences(report, map.ReplaceFrom, targetTable);
            changed += ReplaceFormulaFields(report, map.ReplaceFrom, targetTable);
            Console.WriteLine("  Referencias actualizadas: " + changed);

            FixSubreports(report, dryRun);

            if (!dryRun)
            {
                var backup = path + ".bak-" + DateTime.Now.ToString("yyyyMMddHHmmss");
                File.Copy(path, backup, true);
                report.SaveAs(path);
                Console.WriteLine("Guardado. Backup: " + backup);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERROR: " + ex.Message);
        }
        finally
        {
            report.Close();
            report.Dispose();
        }
    }

    private static void FixSubreports(ReportDocument report, bool dryRun)
    {
        foreach (ReportDocument sub in report.Subreports)
        {
            var map = FindMapForSubreport(sub.Name);
            if (map == null)
            {
                continue;
            }

            Console.WriteLine("  Subreporte: " + sub.Name);
            var mainTable = FindMainTable(sub, map);
            if (mainTable == null)
            {
                continue;
            }

            var targetTable = GetShortName(mainTable.Name);
            ReplaceFieldReferences(sub, map.ReplaceFrom, targetTable);
            ReplaceFormulaFields(sub, map.ReplaceFrom, targetTable);
        }
    }

    private static MapEntry FindMapForSubreport(string subReportName)
    {
        if (string.IsNullOrWhiteSpace(subReportName))
        {
            return null;
        }

        foreach (var map in Maps)
        {
            var fileName = Path.GetFileNameWithoutExtension(map.RptPath) ?? string.Empty;
            if (string.Equals(fileName, subReportName, StringComparison.OrdinalIgnoreCase))
            {
                return map;
            }
        }

        return null;
    }

    private static Table FindMainTable(ReportDocument report, MapEntry map)
    {
        if (report.Database.Tables.Count == 0)
        {
            return null;
        }

        foreach (var preferred in map.DataTableNames ?? new string[0])
        {
            foreach (Table table in report.Database.Tables)
            {
                var shortName = GetShortName(table.Name);
                var shortLocation = GetShortName(table.Location);
                if (string.Equals(shortName, preferred, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(shortLocation, preferred, StringComparison.OrdinalIgnoreCase))
                {
                    return table;
                }
            }
        }

        foreach (Table table in report.Database.Tables)
        {
            if (!string.Equals(GetShortName(table.Name), "GEN_PARAMETRO", StringComparison.OrdinalIgnoreCase))
            {
                return table;
            }
        }

        return report.Database.Tables[0];
    }

    private static void LogTables(ReportDocument report)
    {
        for (var i = 0; i < report.Database.Tables.Count; i++)
        {
            var t = report.Database.Tables[i];
            Console.WriteLine("  [" + i + "] Name=" + t.Name + " Location=" + t.Location);
        }
    }

    private static int ReplaceFormulaFields(ReportDocument report, IEnumerable<string> replaceFrom, string targetTable)
    {
        var sources = replaceFrom.ToList();
        var changed = 0;
        foreach (FormulaFieldDefinition formula in report.DataDefinition.FormulaFields)
        {
            var original = formula.Text;
            if (string.IsNullOrWhiteSpace(original))
            {
                continue;
            }

            var updated = ReplaceTokens(original, sources, targetTable);
            if (!string.Equals(original, updated, StringComparison.Ordinal))
            {
                formula.Text = updated;
                changed++;
            }
        }

        return changed;
    }

    private static string ReplaceTokens(string original, List<string> replaceFrom, string targetTable)
    {
        var updated = original;
        foreach (var source in replaceFrom)
        {
            updated = updated.Replace("{" + source + ".", "{" + targetTable + ".");
            updated = updated.Replace("@" + source + ".", "@" + targetTable + ".");
        }

        return updated;
    }

    private static int ReplaceFieldReferences(ReportDocument report, IEnumerable<string> replaceFrom, string targetTable)
    {
        var sources = replaceFrom.ToList();
        var changed = 0;

        foreach (Section section in report.ReportDefinition.Sections)
        {
            changed += ReplaceInReportObjects(section.ReportObjects, sources, targetTable);
        }

        foreach (Area area in report.ReportDefinition.Areas)
        {
            foreach (Section section in area.Sections)
            {
                changed += ReplaceInReportObjects(section.ReportObjects, sources, targetTable);
            }
        }

        return changed;
    }

    private static int ReplaceInReportObjects(ReportObjects objects, List<string> replaceFrom, string targetTable)
    {
        var changed = 0;
        foreach (ReportObject obj in objects)
        {
            changed += ReplaceObjectStringProperties(obj, replaceFrom, targetTable);
        }

        return changed;
    }

    private static int ReplaceObjectStringProperties(object obj, List<string> replaceFrom, string targetTable)
    {
        var changed = 0;
        foreach (var prop in obj.GetType().GetProperties())
        {
            if (prop.PropertyType != typeof(string) || !prop.CanWrite || !prop.CanRead)
            {
                continue;
            }

            var original = prop.GetValue(obj, null) as string;
            if (string.IsNullOrWhiteSpace(original))
            {
                continue;
            }

            if (original.IndexOf('{') < 0 && !replaceFrom.Any(s => original.IndexOf(s, StringComparison.OrdinalIgnoreCase) >= 0))
            {
                continue;
            }

            var updated = ReplaceTokens(original, replaceFrom, targetTable);
            if (!string.Equals(original, updated, StringComparison.Ordinal))
            {
                prop.SetValue(obj, updated, null);
                changed++;
            }
        }

        return changed;
    }

    private static string GetShortName(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        var name = value.Trim();
        var dot = name.LastIndexOf('.');
        return dot >= 0 ? name.Substring(dot + 1) : name;
    }
}
