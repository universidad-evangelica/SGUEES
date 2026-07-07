using System;
using System.Collections.Generic;
using System.Linq;

namespace eFramework.Core
{
    /// <summary>Parámetros estándar de paginación/orden para catálogos A+P.</summary>
    public static class CPagingParameters
    {
        public const string Page = "PAGE";
        public const string PageSize = "PAGE_SIZE";
        public const string SortField = "SORT_FIELD";
        public const string SortDesc = "SORT_DESC";

        public static readonly string[] ReservedNames = { Page, PageSize, SortField, SortDesc };

        public static CPagedQuery Parse(List<CParameter> xWhere, int maxPageSize = 200)
        {
            var page = xWhere?
                .Where(x => x.ParameterName == Page)
                .Select(x => Convert.ToInt32(x.Value ?? 1))
                .FirstOrDefault() ?? 1;

            var pageSize = xWhere?
                .Where(x => x.ParameterName == PageSize)
                .Select(x => Convert.ToInt32(x.Value ?? 10))
                .FirstOrDefault() ?? 10;

            var sortField = xWhere?
                .Where(x => x.ParameterName == SortField)
                .Select(x => x.Value?.ToString())
                .FirstOrDefault()?
                .Trim();

            var sortDesc = xWhere?
                .Where(x => x.ParameterName == SortDesc)
                .Select(x => x.Value as bool?)
                .FirstOrDefault() ?? false;

            page = page < 1 ? 1 : page;
            if (pageSize > 0)
            {
                pageSize = Math.Min(pageSize, maxPageSize);
            }

            return new CPagedQuery
            {
                Page = page,
                PageSize = pageSize,
                SortField = sortField,
                SortDesc = sortDesc,
            };
        }

        public static List<CParameter> ExcludeReserved(List<CParameter> xWhere)
        {
            if (xWhere == null || xWhere.Count == 0)
            {
                return new List<CParameter>();
            }

            return xWhere
                .Where(p => !ReservedNames.Contains(p.ParameterName))
                .ToList();
        }
    }

    public class CPagedQuery
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortField { get; set; }
        public bool SortDesc { get; set; }

        public int Offset => (Page - 1) * PageSize;

        /// <summary>PAGE_SIZE &lt;= 0 devuelve todos los registros (opción all del pager).</summary>
        public bool ReturnAll => PageSize <= 0;
    }

    public class CPagedResult<T>
    {
        public List<T> PageData { get; set; } = new List<T>();
        public int TotalRows { get; set; }
    }
}
