import { Routes } from '@angular/router';
import { EditorView } from './editor-view/editor-view';

export const routes: Routes = [
    { path: "", component: EditorView },
    { path: "**", redirectTo: "", pathMatch: "full" }
];
