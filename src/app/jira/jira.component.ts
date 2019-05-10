import {Component, OnInit} from '@angular/core';
import {MessageService} from '../message.service';
import {JiraService} from '../jira.service';
import {Worklog} from './worklog';
import {SettingsService} from '../settings.service';
import {Settings} from '../settings/settings';

@Component({
    selector: 'app-jira',
    templateUrl: './jira.component.html',
    styleUrls: ['./jira.component.sass']
})
export class JiraComponent implements OnInit {

    public key = 'IT-2054';
    public user = '';
    public passwd = '';
    public workLog: Worklog;

    constructor(private messageService: MessageService, private jiraService: JiraService, private settingsService: SettingsService) {
    }

    ngOnInit() {
    }

    public getWorkLogs() {
        this.log(`key: ${this.key}`);
        this.jiraService.getWorklogByKey(this.key)
            .subscribe(
                worklog => this.workLog = worklog,
                err => this.log(`Failed to get worklogs ${JSON.stringify(err)}`)
            );
    }

    logMyself() {
        this.jiraService.getMyself().subscribe(
            myself => this.log(JSON.stringify(myself))
        );
    }

    login() {
        const jiraUserName = this.settingsService.getJiraUserName();
        const jiraPassword = this.settingsService.getJiraPassword();
        this.jiraService.logIn(jiraUserName, jiraPassword)
            .subscribe(
                _ => this.log('logged in'),
                err => this.log(`Failed to login ${err.statusText}(${err.status}): ${err.error}`)
            );
    }

    private log(message: string) {
        this.messageService.add(`JiraComponent: ${message}`);
    }
}


