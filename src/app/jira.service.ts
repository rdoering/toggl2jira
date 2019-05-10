import {Injectable} from '@angular/core';
import {MessageService} from './message.service';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {SettingsService} from './settings.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Worklog} from './jira/worklog';
import {Login} from './jira/login';
import {WorklogEntry} from './jira/worklog.entry';
import {Myself} from './jira/myself';
import {tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class JiraService {
    private _displayName: BehaviorSubject<string> = new BehaviorSubject('');
    public displayName: Observable<string> = this._displayName.asObservable();

    constructor(
        private messageService: MessageService,
        private http: HttpClient,
        private settingsService: SettingsService) {
        settingsService.jiraSettingsChanged.asObservable().subscribe(() => {
            this._displayName.next('');
            if (settingsService.isJiraUseCookieOnly()) {
                this.fetchMyself();
            }
        });
        this.fetchMyself();
    }

    getWorklogByKey(key: string): Observable<Worklog> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': 'Basic ' + btoa(this.settingsService.getJiraUserName() + ':' + this.settingsService.getJiraPassword())
            }),
        };
        return this.http.get<Worklog>(`${this.settingsService.getJiraServerUrl()}/rest/api/latest/issue/${key}/worklog`, httpOptions).pipe(
            tap(() => this.log(`fetched worklogs for ${key}`)),
        );
    }

    logIn(userName: string, passwd: string): Observable<Login> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
        };

        const body = {
            username: userName,
            password: passwd
        };

        return this.http.post<Login>(`${this.settingsService.getJiraServerUrl()}/rest/auth/1/session`, body, httpOptions).pipe(
            tap(() => this.log(`logged in`))
        );
    }

    createWorklog(key: string, started: string, durationSec: number, comment: string): Observable<WorklogEntry> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(this.settingsService.getJiraUserName() + ':' + this.settingsService.getJiraPassword())
            }),
        };

        const dateInJiraTxt = new Date(started).toISOString().replace('Z', '') + '+0000';
        const body = {
            started: dateInJiraTxt,
            timeSpentSeconds: durationSec,
            comment: comment
        };

        return this.http.post<WorklogEntry>(`${this.settingsService.getJiraServerUrl()}/rest/api/latest/issue/${key}/worklog`,
            body, httpOptions).pipe(
            tap(() => this.log(`created worklog for ${key} at ${started} for ${durationSec}`))
        );

    }

    getCreateWorklogCurlCommand(key: string, started: string, durationSec: number, comment: string): string {
        const dateInJiraTxt = new Date(started).toISOString().replace('Z', '') + '+0000';
        return `curl '${this.settingsService.getJiraServerUrl()}/rest/api/latest/issue/${key}/worklog'`
            + ` -H 'Authorization: Basic ${btoa(this.settingsService.getJiraUserName() + ':' + this.settingsService.getJiraPassword())}'`
            + ` -H 'Content-Type: application/json'`
            + ` -H 'cache-control: no-cache'`
            + ` -d '{"started":  "${dateInJiraTxt}", "timeSpentSeconds": ${durationSec}, "comment": "${comment}"}'`;
    }

    getMyself(): Observable<Myself> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(this.settingsService.getJiraUserName() + ':' + this.settingsService.getJiraPassword())
            }),
        };

        return this.http.get<Myself>(`${this.settingsService.getJiraServerUrl()}/rest/api/latest/myself`, httpOptions).pipe(
            tap(() => this.log(`fetch user info about myself`))
        );
    }

    private fetchMyself() {
        this.getMyself().subscribe(
            myself => this._displayName.next(myself.displayName),
            (err: HttpErrorResponse) => {
                this.log(`Failed to log in: ${err.message}`);
                this._displayName.next('');
            }
        );
    }

    private log(message: string) {
        this.messageService.add(`JiraService: ${message}`);
    }
}
