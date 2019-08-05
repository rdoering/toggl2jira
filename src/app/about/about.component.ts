declare var chrome;
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass']
})
export class AboutComponent implements OnInit {

  // @ts-ignore
  public manifest: chrome.runtime.Manifest;

  constructor() { }
  ngOnInit() {
    this.manifest = chrome.runtime.getManifest();
  }

}
