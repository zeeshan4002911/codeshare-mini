import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppInit } from './service/app-init';
import { Popover, Modal, Toast} from 'bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  private _destroy: Subject<boolean> = new Subject<boolean>();

  themeMode: string | undefined = 'light';
  languages: any = [];
  selectedLanguage: any = {};
  searchLanguage: string = '';

  // More Options popover variables
  popoverInstance!: Popover | undefined;
  @ViewChild('popoverBtn', { static: false }) popoverBtn!: ElementRef;
  @ViewChild('popoverContent', { static: false }) popoverContent!: TemplateRef<any>;
  
  private bModal: any;
  private bToast: any;

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

    // Initialize Bootstrap Modal
    const modalElement = document.getElementById('bModal');
    if (modalElement) {
      this.bModal = new Modal(modalElement);
    }
    
    // Initialize Bootstrap Toast
    const toastElement = document.getElementById('bToast');
    if (toastElement) {
      this.bToast = new Toast(toastElement);
    }
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
    if (this.selectedLanguage['id'] == 'json-compression') btnName = 'json-compression';
    this._appInit.dispatchAction(btnName);
  }

  public selectLanguage(language: any) {
    this.selectedLanguage = language;
    if (language['id'] !== 'json-compression')
      this._appInit.setEditorLanguage(language);
  }

  public filterLanguages() {
    const searchLanguage = this.searchLanguage.toLowerCase().trim();

    this.languages = this._appInit.languages.filter((language: any) => {
      const idSearch = language['id'].includes(searchLanguage);
      let aliasesSearch = false;
      if (language.hasOwnProperty('aliases') && Array.isArray(language['aliases'])) {
        aliasesSearch = language['aliases'].some((val: string) => 
        val.toLowerCase().includes(searchLanguage))
      }
      return idSearch || aliasesSearch;
    })
  }

  // Handler for Bootstrap Modal and Toast open
  openModal = () => (this.bModal) ? this.bModal.show() : null;
  openToast = () => (this.bToast) ? this.bToast.show() : null;

  // Hide popover once any any click happen outside the content of it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.popoverInstance) {
      const targetElement = event.target as HTMLElement;
      const isInisdePopover = document.querySelector('.popover-content')?.contains(targetElement);

      if (!isInisdePopover) {
        this.popoverInstance.hide();
      }
    }
  }

  ngOnDestroy(): void {
    this._destroy.next(false);
    this._destroy.complete();
    this.themeMode = undefined;
    this.popoverInstance = undefined;
  }
}
