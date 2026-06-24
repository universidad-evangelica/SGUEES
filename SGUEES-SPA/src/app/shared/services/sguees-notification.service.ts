import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { NotifyType } from '../models/NotifyType';

@Injectable({ providedIn: 'root' })
export class SgueesNotificationService {
	constructor(private messageService: MessageService) {}

	show(message: string, type: NotifyType = NotifyType.Success): void {
		if (!message) {
			return;
		}

		switch (type) {
			case NotifyType.Error:
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: message,
					life: 8000,
				});
				break;
			case NotifyType.Warning:
				this.messageService.add({
					severity: 'warn',
					summary: 'Advertencia',
					detail: message,
					life: 4500,
				});
				break;
			default:
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: message,
					life: 3000,
				});
				break;
		}
	}
}
