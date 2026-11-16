/* Ejecutar: sqlcmd -S <srv> -d SGUEES -U <user> -f 65001 -i Deploy-ConPartidaContrapartida.sql */
:setvar Root ".."
:r $(Root)\Tables\dbo.CON_PARTIDA_CONTRAPARTIDA.sql
GO
:r $(Root)\Stored Procedures\dbo.PRAL_GENE_CON_PARTIDA_CONTRAPARTIDA.sql
GO
:r MENU_CON_PARTIDA_CONTRAPARTIDA_ESPECIAL.sql
GO
