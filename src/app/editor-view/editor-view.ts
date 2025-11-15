import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
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

  editorOptions = {
    theme: 'vs',
    language: 'javascript',
    automaticLayout: true,
    scrollBeyondLastLine: true,
    wordWrap: true // For toggling the word wrap 'on' & 'off'
  };
  code: string = 'function x() {\n\tconsole.log("Hello world 😺!");\n}';
  editor: monaco.editor.IStandaloneCodeEditor | null = null;

  constructor(
    private _appInit: AppInit
  ) {
    this._appInit.themeMode$.pipe(takeUntil(this._destroy)).subscribe((themeMode) => {
      const isDarkMode = (themeMode == 'dark') ? true : false;
      this.editorOptions.theme = isDarkMode ? 'vs-dark' : 'vs';
      if (this.editor) {
        monaco.editor.setTheme(this.editorOptions.theme);
        // monaco.editor.setTheme(isHighContrast && isDarkMode ? 'hc-black' : 'hc-light');
      }
    });
    this._appInit.selectedLanguage$.pipe(takeUntil(this._destroy)).subscribe((language: any) => {
      if (this.editor) {
        monaco.editor.setModelLanguage(this.editor.getModel()!, language['id']);
      }
    });
    this._appInit.appAction$.pipe(takeUntil(this._destroy)).subscribe((action) => {
      if (!this.editor) {
        console.error("Editor doesn't exists to perform action");
        return;
      }
      switch (action) {
        case "format-code":
          this.editor.getAction('editor.action.formatDocument')?.run();
          break;
        case "scroll-to-top":
          this.editor.setScrollPosition({ scrollTop: 0 });
          break;
        case "scroll-to-bottom":
          const lineCount = this.editor.getModel()?.getLineCount();
          this.editor.revealLine(lineCount ?? 0);
          break;
        case "undo":
          this.editor.trigger('undo-button', 'undo', null);
          break;
        case "redo":
          this.editor.trigger('undo-button', 'redo', null);
          break;
        case "font-up":
          const currFS_1 = this.editor.getRawOptions().fontSize ?? 14;
          this.editor.updateOptions({ fontSize: currFS_1 + 2 });

          break;
        case "font-down":
          const currFS_2 = this.editor.getRawOptions().fontSize ?? 14;
          this.editor.updateOptions({ fontSize: Math.max(6, currFS_2 - 2) });
          break;
        case "clear-all":
          // Triggering undo stack and executing edit to empty editor
          this.editor.pushUndoStop();
          this.editor.executeEdits(
            'clear-all',
            [
              {
                range: this.editor.getModel()!.getFullModelRange(),
                text: '',
                forceMoveMarkers: true
              }
            ]
          )
          this.editor.pushUndoStop();
          break;
        case "json-compression":
          const jsonContent = this.editor.getValue();
          try {
            const jsonObject = JSON.parse(jsonContent);
            const minifiedJson = JSON.stringify(jsonObject);
            this.editor.setValue(minifiedJson);
            // Setting the monaco language as json to have highlight in string
            monaco.editor.setModelLanguage(this.editor.getModel()!, 'json');
          } catch (error) {
            console.error("Invalid JSON:", error);
          }
          break;
        case "word-wrap-toggle":
          this.editorOptions.wordWrap = !this.editorOptions.wordWrap;
          this.editor.updateOptions({
            wordWrap: this.editorOptions.wordWrap ? 'on' : 'off'
          })
          break;
        default:
          console.warn("No such action exists", action);
      }
    })
  }

  ngAfterViewInit(): void {
    this.editor = monaco.editor.create(document.getElementById('monaco-container')!, {
      value: this.code,
      language: this.editorOptions.language,
      automaticLayout: this.editorOptions.automaticLayout,
      scrollBeyondLastLine: this.editorOptions.scrollBeyondLastLine,
      wordWrap: this.editorOptions.wordWrap ? 'on' : 'off',
      theme: this.editorOptions.theme
    })
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Toggle word wrap on Alt + Z key combination
    if (event.altKey && event.key.toLowerCase() == 'z' && !event.shiftKey) {
      this.editorOptions.wordWrap = !this.editorOptions.wordWrap;
      if (this.editor)
        this.editor.updateOptions({
          wordWrap: this.editorOptions.wordWrap ? 'on' : 'off'
        })
    }
  }

  ngOnDestroy(): void {
    this._destroy.next(false);
    this._destroy.complete();
  }
}
