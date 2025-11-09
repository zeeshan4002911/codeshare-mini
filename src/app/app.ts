import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppInit } from './service/app-init';
import { Popover } from 'bootstrap';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  private _destroy: Subject<boolean> = new Subject<boolean>();

  themeMode: string | undefined = 'light';
  languages: any = [];
  selectedLanguage: string = '';

  // More Options popover variables
  popoverInstance!: Popover | undefined;
  @ViewChild('popoverBtn', { static: false }) popoverBtn!: ElementRef;
  @ViewChild('popoverContent', { static: false }) popoverContent!: TemplateRef<any>;

  constructor(
    private _appInit: AppInit
  ) {
    this._appInit.themeMode$.pipe(takeUntil(this._destroy)).subscribe((val: string) => {
      this.themeMode = val;
      this.bodyTagThemeUpdateHandler();
    });
    this._appInit.selectedLanguage$.pipe(takeUntil(this._destroy)).subscribe((language: any) => {
      this.selectedLanguage = language;
    });
  }

  ngOnInit(): void {
    this.languages = this._appInit.languages;
  }

  ngAfterViewInit(): void {
    const embeddedView = this.popoverContent.createEmbeddedView(null);
    const popoverContentEl = embeddedView.rootNodes[0];

    // Initialize Bootstrap Popover for More Options
    this.popoverInstance = new Popover(this.popoverBtn.nativeElement, {
      html: true,
      content: popoverContentEl,
      customClass: 'no-padding-popover'
    });
  }

  public toggleTheme() {
    this.themeMode = (this.themeMode == 'light') ? 'dark' : 'light';
    this._appInit.toggleThemeMode(this.themeMode);
    this.bodyTagThemeUpdateHandler();
  }

  private bodyTagThemeUpdateHandler() {
    if (this.themeMode == 'dark') {
      // Dark mode by setting the bootstrap theme attribute on body
      document.body.setAttribute('data-bs-theme', 'dark');
    } else {
      document.body.setAttribute('data-bs-theme', 'light');
    }
  }

  public moreOptionHanlder(btnName: string) {
    this._appInit.dispatchAction(btnName);
  }

  public selectLanguage(language: any) {
    this.selectedLanguage = language;
    this._appInit.setEditorLanguage(language);
  }

  ngOnDestroy(): void {
    this._destroy.next(false);
    this._destroy.complete();
    this.themeMode = undefined;
    this.popoverInstance = undefined;
  }
}
