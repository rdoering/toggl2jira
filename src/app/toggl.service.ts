import {Injectable} from '@angular/core';
import {TimeEntry} from './toggl/time.entry';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {MessageService} from './message.service';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {map, switchMap, tap} from 'rxjs/operators';
import {SettingsService} from './settings.service';
import {Workspace} from './toggl/workspace';
import {Project} from './toggl/Project';
import {Me} from './toggl/Me';

@Injectable({
    providedIn: 'root'
})
export class TogglService {
    private togglUrlBase = 'https://toggl.com';

    private projectCache: Map<number, Observable<Project>>;

    private me: Me;

    private _fullName: BehaviorSubject<string> = new BehaviorSubject('');
    public fullName: Observable<string> = this._fullName.asObservable();

    constructor(
        private messageService: MessageService,
        private http: HttpClient,
        private settingsService: SettingsService) {
        this.projectCache = new Map<number, Observable<Project>>();
        settingsService.togglApiKey.subscribe(() => this.fetchFullName());
    }

    getTimeEntries(): Observable<TimeEntry[]> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - this.settingsService.getNumOfDaysToSync());

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(this.settingsService.getTogglApiKey() + ':api_token')
            }),
            params: new HttpParams()
                .set('start_date', startDate.toISOString())
                .set('end_date', endDate.toISOString())
        };

        return this.http.get<TimeEntry[]>(this.togglUrlBase + '/api/v8/time_entries', httpOptions).pipe(
            tap(() => this.log('fetched time entries.'))
        );
    }

    getAllProjects(): Observable<Project[]> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(this.settingsService.getTogglApiKey() + ':api_token')
            }),
        };

        return this.http.get<Workspace[]>(`${this.togglUrlBase}/api/v8/workspaces`, httpOptions).pipe(
            tap(() => this.log('fetched workspaces')),
            switchMap(workspaces => {
                    const projectRequests = workspaces.map(
                        (w: Workspace) => this.http.get<Project[]>(`${this.togglUrlBase}/api/v8/workspaces/${w.id}/projects`, httpOptions));
                    return forkJoin(projectRequests)
                        .pipe(
                            map(
                                (resp) => {
                                    return [].concat(...resp);
                                }
                            )
                        );
                }
            )
        );
    }

    private fetchFullName() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(this.settingsService.getTogglApiKey() + ':api_token')
            }),
        };

        this.http.get<Me>(`${this.togglUrlBase}/api/v8/me`, httpOptions).subscribe(
            (me) => {
                 this.log('fetched me');
                this.me = me;
                this._fullName.next(me.data.fullname);
            },
            () => this.log(`failed to fetch user info`)
        );
    }

    private log(message: string) {
        this.messageService.add(`TogglService: ${message}`);
    }
}
