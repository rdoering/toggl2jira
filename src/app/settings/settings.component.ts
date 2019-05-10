import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../settings.service';
import {Settings} from './settings';
import {JiraService} from '../jira.service';
import {MessageService} from '../message.service';
import {MatSlideToggleChange} from '@angular/material';
import {TogglService} from '../toggl.service';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.sass'],
})
export class SettingsComponent implements OnInit {

    constructor(
        public settingsService: SettingsService,
        public jiraService: JiraService,
        public messageService: MessageService,
        public togglService: TogglService) {
    }

    ngOnInit() {
    }

    private log(message: string) {
        this.messageService.add(`SettingsComponent: ${message}`);
    }
}
