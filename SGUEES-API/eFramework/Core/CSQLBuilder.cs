using System.Collections.Generic;

namespace eFramework.Core
{
    public class CSQLBuilder
    {
        public string vFieldsSelect { get; set; } = "*";
        public string toSelect(string vViewName , string vWhereSelect = "", string vSortingFields = "") 
        {
            var vOrderBy = "";
            if (vWhereSelect != "") { vWhereSelect = "WHERE " + vWhereSelect; }
            if (vSortingFields != "") { vOrderBy = @$"ORDER BY {vSortingFields}"; }

            string sql = @$"SELECT {vFieldsSelect}
                            FROM {vViewName}
                            {vWhereSelect}
                            {vOrderBy}".Trim();


            return sql;
        }

        public string toInsert(string vTableName, string vFields, string vValues, string vCorrName = "", string vWhereCorr="") 
        {
            string sqlInsert = @$" INSERT INTO {vTableName} ({vFields}) VALUES({vValues})";
            string sql = sqlInsert;
            string vAnd = "";

            if (vWhereCorr != "") 
            { 
                vWhereCorr = "WHERE " + vWhereCorr; 
                vAnd = "AND";
            } else {
                vAnd = "WHERE";
            }

            if (vCorrName != "") {
                sql = @$"BEGIN
                                SET NOCOUNT ON
                                IF @@ERROR <> 0 SET NOEXEC ON
                                SELECT @{vCorrName} = ISNULL(MAX({vCorrName}),0)+1
                                FROM {vTableName}
                                {vWhereCorr}

                                IF @@ERROR <> 0 SET NOEXEC ON
                                {sqlInsert}

                                IF @@ERROR <> 0 SET NOEXEC ON
                                SELECT *
                                FROM V_{vTableName}
                                {vWhereCorr}
                                {vAnd} {vCorrName}=@{vCorrName}

                                SET NOEXEC OFF
                          END".Trim();
            } else {
                sql = @$"BEGIN
                                SET NOCOUNT ON
                                IF @@ERROR <> 0 SET NOEXEC ON
                                {sqlInsert}

                                IF @@ERROR <> 0 SET NOEXEC ON
                                SELECT *
                                FROM V_{vTableName}
                                {vWhereCorr}

                                SET NOEXEC OFF
                          END".Trim();
            }

            return sql;
        }

        public string toUpdate(string vTableName, string vFieldsUpdate, string vWhere)
        {
            string sql="";

            sql = @$"BEGIN
                        SET NOCOUNT ON
                        IF @@ERROR <> 0 SET NOEXEC ON
                        UPDATE {vTableName} SET 
                        {vFieldsUpdate} 
                        WHERE {vWhere}

                        IF @@ERROR <> 0 SET NOEXEC ON
                        SELECT *
                        FROM V_{vTableName}
                        WHERE {vWhere}

                        SET NOEXEC OFF
                    END".Trim();

            return sql;
        }

         public string toDelete(string vTableName, string vWhere) 
        {
            string sql = @$"DELETE 
                            FROM {vTableName} 
                            WHERE {vWhere}".Trim();

            return sql;
        }
    }
}
