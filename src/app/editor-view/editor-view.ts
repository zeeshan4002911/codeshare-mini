import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import * as monaco from 'monaco-editor';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AppInit } from '@/service/app-init';

@Component({
  selector: 'app-editor-view',
  imports: [FormsModule],
  templateUrl: './editor-view.html',
  styleUrl: './editor-view.scss',
  standalone: true
})
export class EditorView implements AfterViewInit, OnDestroy {
  private _destroy: Subject<boolean> = new Subject<boolean>();

  editorOptions = { theme: 'vs', language: 'javascript' };
  code: string = 'function x() {\n\tconsole.log("Hello world 😺!");\n}';
  editor: monaco.editor.IStandaloneCodeEditor | null = null;

  constructor(
    private _appInit: AppInit
  ) {
    this._appInit.themeMode$.pipe(takeUntil(this._destroy)).subscribe((themeMode) => {
      if (this.editor) {
        const isDarkMode = (themeMode == 'dark') ? true : false;
        monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs');
        // monaco.editor.setTheme(isHighContrast && isDarkMode ? 'hc-black' : 'hc-light');
      }
    });
    this._appInit.selectedLanguage$.pipe(takeUntil(this._destroy)).subscribe((language: any) => {
      if (this.editor) {
        monaco.editor.setModelLanguage(this.editor.getModel()!, language['id']);
      }
    });
    this._appInit.appAction$.pipe(takeUntil(this._destroy)).subscribe((action) => {
      switch(action) {
        case "format-code":
          if (this.editor) this.editor.getAction('editor.action.formatDocument')?.run();
          break;
      }
    })
  }

  ngAfterViewInit(): void {
    this.editor = monaco.editor.create(document.getElementById('monaco-container')!, {
      value: this.code,
      language: this.editorOptions.language,
      automaticLayout: true
    })
  }

  ngOnDestroy(): void {
    this._destroy.next(false);
    this._destroy.complete();
  }
}
