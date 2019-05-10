import {Pipe, PipeTransform} from '@angular/core';
import {TimeEntry} from '../toggl/time.entry';

@Pipe({name: 'reverse', pure: true})

export class ReversePipe implements PipeTransform {
    transform(values: TimeEntry[]) {
        return values.slice().reverse();
    }
}
