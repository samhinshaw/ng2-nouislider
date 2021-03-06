import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NouisliderModule } from '../src/public_api';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    NouisliderModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AppComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
