import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SC_OrganigramaEstructuralNivel } from './models/sc-organigrama-estructural-nivel';
import { SC_OrganigramaEstructuralNivelService } from './sc-organigrama-estructural-nivel.service';

@Component({
    selector: 'app-sc-organigrama-estructural-nivel',
    templateUrl: './sc-organigrama-estructural-nivel.component.html',
    styleUrls: ['./sc-organigrama-estructural-nivel.component.scss'],
})
export class SC_OrganigramaEstructuralNivelComponent extends CBaseComponent implements OnInit {
    constructor(
        public override appInfoService: AppInfoService,
        public override router: ActivatedRoute,
        private service: SC_OrganigramaEstructuralNivelService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getNivelColumns();
        this.items = this.service.getNivelItems();
    }

    //#region <Inicializando Opciones>
    ngOnInit(): void {
        this.inicializaOpciones();
        this.consultar();
    }

    inicializaOpciones() {}
    //#endregion

    //#region <Metodos Fill>
    override fillData(xModel?: SC_OrganigramaEstructuralNivel): SC_OrganigramaEstructuralNivel {
        if (xModel !== undefined) {
            return {
                CORR_EMPRESA: xModel.CORR_EMPRESA,
                CORR_NIVEL: xModel.CORR_NIVEL,
                NOMBRE_NIVEL: xModel.NOMBRE_NIVEL,
                CANTIDAD_CARACTERES: xModel.CANTIDAD_CARACTERES,
                ACTIVO: xModel.ACTIVO,
                USUARIO_CREA: xModel.USUARIO_CREA,
                ESTACION_CREA: xModel.ESTACION_CREA,
                FECHA_CREA: xModel.FECHA_CREA,
                USUARIO_ACTU: xModel.USUARIO_ACTU,
                ESTACION_ACTU: xModel.ESTACION_ACTU,
                FECHA_ACTU: xModel.FECHA_ACTU,
                EN_USO: xModel.EN_USO,
            };
        } else {
            return {
                CORR_EMPRESA: 1,
                CORR_NIVEL: 0,
                NOMBRE_NIVEL: '',
                CANTIDAD_CARACTERES: 1,
                ACTIVO: true,
                USUARIO_CREA: '',
                ESTACION_CREA: '',
                FECHA_CREA: new Date(),
                USUARIO_ACTU: '',
                ESTACION_ACTU: '',
                FECHA_ACTU: new Date(),
                EN_USO: 0,
            };
        }
    }
    //#endregion

    //#region <Metodos Mtto>
    consultar() {
        this.service
            .getNiveles({})
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.models = response.Data;
                    }
                },
                error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    guardar(): void {
        if (!this.service.esValidoNivel(this.model, this.notifyFx)) {
            return;
        }

        this.loadingVisible = true;
        if (this.banderaMtto === UpdateType.Add) {
            this.service
                .insertNivel(this.model)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.models.push(response.Data);
                            this.model = response.Data;
                            this.AsignaStatus(UpdateType.Browse);
                            this.notifyFx('Nivel creado con exito!', NotifyType.Success);
                        } else {
                            this.notifyFx(response.ErrorMessage, NotifyType.Error);
                        }
                        this.loadingVisible = false;
                    },
                    error: (error: any) => {
                        this.notifyFx(error, NotifyType.Error);
                        this.loadingVisible = false;
                    },
                });
        } else if (this.banderaMtto === UpdateType.Update) {
            this.service
                .updateNivel(this.model)
                .pipe(take(1))
                .subscribe({
                    next: (response: any) => {
                        if (response.Result) {
                            this.model = response.Data;
                            const vIndex = this.models.findIndex(
                                (item: any) => item.CORR_NIVEL === response.Data.CORR_NIVEL
                            );
                            this.models[vIndex] = response.Data;
                            this.AsignaStatus(UpdateType.Browse);
                            this.notifyFx('Nivel modificado con exito!', NotifyType.Success);
                        } else {
                            this.notifyFx(response.ErrorMessage, NotifyType.Error);
                        }
                        this.loadingVisible = false;
                    },
                    error: (error: any) => {
                        this.notifyFx(error, NotifyType.Error);
                        this.loadingVisible = false;
                    },
                });
        }
    }

    override cancelar(): void {
        super.cancelar((item: any) => item.CORR_NIVEL === this.modelUpdate.CORR_NIVEL);
    }

    rowRemoving(e: any) {
        this.service
            .deleteNivel(e.data)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    if (response.Result) {
                        this.notifyFx('Nivel eliminado con exito!', NotifyType.Success);
                        e.component.refresh();
                    } else {
                        e.cancel = true;
                        this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                },
                error: (error: any) => {
                    e.cancel = true;
                    this.notifyFx(error, NotifyType.Error);
                },
            });
    }

    override bloquear(): void {
        this.dataForm?.instance?.getEditor('NOMBRE_NIVEL')?.option('readOnly', true);
        this.dataForm?.instance?.getEditor('CANTIDAD_CARACTERES')?.option('readOnly', true);
        this.dataForm?.instance?.getEditor('ACTIVO')?.option('disabled', true);
    }

    override setFocus() {
        setTimeout(() => {
            this.dataForm?.instance?.getEditor('NOMBRE_NIVEL')?.focus();
        });
    }
    //#endregion
}
