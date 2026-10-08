import { Pipe, type PipeTransform } from '@angular/core';
import { formatPrice, type PriceValue } from '@nails/shared/common/util';

@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(price: PriceValue): string {
    return formatPrice(price);
  }
}
