import { Pipe, type PipeTransform } from '@angular/core';
import { formatPhone } from '@nails/shared/common/util';

@Pipe({ name: 'phone' })
export class PhonePipe implements PipeTransform {
  transform(phone: string): string {
    return formatPhone(phone);
  }
}
