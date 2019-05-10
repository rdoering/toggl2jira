import { Component, OnInit } from '@angular/core';
import {MessageService} from '../message.service';
import {SettingsService} from '../settings.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.sass']
})
export class LogComponent implements OnInit {

  constructor(public messageService: MessageService, public settingsService: SettingsService) { }

  ngOnInit() {
  }

}
