import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ProfileComponent
  ]
})
export class ProfileModule { }