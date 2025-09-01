import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinalDate'
})
export class OrdinalDatePipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const date = new Date(value);
    const day = date.getDate();
    const suffix = this.getOrdinalSuffix(day);
    const options: Intl.DateTimeFormatOptions = { month: 'long' };
    return `${date.toLocaleDateString('en-US', options)} ${day}${suffix}, ${date.getFullYear()}`;
  }

  private getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) {
      return 'th';
    }

    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}
