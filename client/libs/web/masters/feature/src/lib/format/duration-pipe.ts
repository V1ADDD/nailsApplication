import { Pipe, type PipeTransform } from '@angular/core';
import { formatDuration } from '@nails/shared/common/util';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(minutes: number): string {
    return formatDuration(minutes);
  }
}
