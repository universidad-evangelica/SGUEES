import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DatePipe } from '@angular/common';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';

@Injectable()
export class AppInfoService {
  CORR_EMPRESA = 1;

  constructor(private authService: AuthService, private datePipe: DatePipe, private objData: CData) {}

  public get title() {
    return 'Sistema de gestión Universitario - UEES';
  }

  public get currentYear(): number {
    return new Date().getFullYear();
  }

  public get getLocale() {
    return 'es-SV';
  }

  getPermiso(opcion: string): string {
    return this.authService.decodedToken[opcion];
  }

  getTipoUsuario(): number {
    return this.authService.decodedToken['TIPO_USUARIO'];
  }

  getUsuario(): string {
    return this.authService.decodedToken.nameid;
  }

  toDate(date: any) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  toMonthComplete(date: any) {
    return this.datePipe.transform(date, 'd MMMM y');
  }

  toDateFMT(date: any, fmt: string) {
    return this.datePipe.transform(date, fmt);
  }

  toYear(date: any) {
    const vYear = this.datePipe.transform(date, 'yyyy') || 0;
    return +vYear;
  }

  toMonth(date: any) {
    const vMonth = this.datePipe.transform(date, 'MM') || 0;
    return +vMonth;
  }

  toDay(date: any) {
    const vDay = this.datePipe.transform(date, 'dd') || 0;
    return +vDay;
  }

  getDate(date?: Date, hours?: number, min?: number, sec?: number) {
    if (date === undefined) {
      date = new Date();
    }
    if (hours === undefined) {
      hours = 0;
    }
    if (min === undefined) {
      min = 0;
    }
    if (sec === undefined) {
      sec = 0;
    }

    const d = new Date(date.setHours(0, 0, 0, 0));

    return new Date(d.setHours(hours, min, sec, 0));
  }

  getDays(from: Date, to: Date) {
    if (from === null || to === null) {
      return 0;
    }

    return Math.floor((to.valueOf() - from.valueOf()) / 1000 / 60 / 60 / 24 + 1);
  }

  getHours(from: Date, to: Date) {
    if (from === null || to === null) {
      return 0;
    }

    return Math.floor((to.valueOf() - from.valueOf()) / 1000 / 60 / 60);
  }

  getMinutes(from: Date, to: Date) {
    if (from === null || to === null) {
      return 0;
    }

    return Math.floor((to.valueOf() - from.valueOf()) / 1000 / 60);
  }

  minDate() {
    return '0001-01-01T00:00:00';
  }
  /**
   * Adds time to a date. Modelled after MySQL DATE_ADD function.
   * Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
   * https://stackoverflow.com/a/1214753/18511
   *
   * @param date  Date to start with
   * @param interval  One of: year, quarter, month, week, day, hour, minute, second
   * @param units  Number of units of the given interval to add.
   */
  dateAdd(date: Date, interval: string, units: number) {
    if (!(date instanceof Date)) {
      return new Date();
    }

    let ret = new Date(date); //don't change original date

    const checkRollover = () => {
      if (ret.getDate() !== date.getDate()) {
        ret.setDate(0);
      }
    };
    switch (String(interval).toLowerCase()) {
      case 'year':
        ret.setFullYear(ret.getFullYear() + units);
        checkRollover();
        break;
      case 'quarter':
        ret.setMonth(ret.getMonth() + 3 * units);
        checkRollover();
        break;
      case 'month':
        ret.setMonth(ret.getMonth() + units);
        checkRollover();
        break;
      case 'week':
        ret.setDate(ret.getDate() + 7 * units);
        break;
      case 'day':
        ret.setDate(ret.getDate() + units);
        break;
      case 'hour':
        ret.setTime(ret.getTime() + units * 3600000);
        break;
      case 'minute':
        ret.setTime(ret.getTime() + units * 60000);
        break;
      case 'second':
        ret.setTime(ret.getTime() + units * 1000);
        break;
      default:
        ret = new Date(date);
        break;
    }
    return ret;
  }

  getLookUp(
    xOpcion: string,
    xController: string,
    xMetodo: string,
    xQueryList?: IParam[],
    xUrlAPI?: string
  ): Observable<IResult> {
    return this.objData.Get(xController, xMetodo + '_' + xOpcion, xQueryList, xUrlAPI);
  }

  public downloadFile(blob: any, fileName: string): void
  {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
