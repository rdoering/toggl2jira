import {Component, OnInit} from '@angular/core';
import {MessageService} from '../message.service';
import {SettingsService} from '../settings.service';
import {TogglService} from '../toggl.service';
import {Project} from '../toggl/Project';

@Component({
    selector: 'app-workspaces',
    templateUrl: './workspaces.component.html',
    styleUrls: ['./workspaces.component.sass']
})
export class WorkspacesComponent implements OnInit {
    public projects: Project[];

    constructor(
        private messageService: MessageService,
        private settingsService: SettingsService,
        private togglService: TogglService) {
    }

    ngOnInit() {
        this.getProjects();
    }

    private getProjects() {
        this.togglService.getAllProjects().subscribe(projects => {
                this.projects = projects;
            },
            () => this.log('Failed to get Projects'));
    }

    private log(message: string) {
        this.messageService.add(`WorkspacesComponent: ${message}`);
    }

}
