import { CommonModule } from '@angular/common';
import { Component, OnInit, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent implements OnInit {
  readonly searchTerm = input<string | null>('');
  protected readonly searchControl = new FormControl('');

  protected searchChange = outputFromObservable(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
  );

  ngOnInit(): void {
    this.restoreValue();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  private restoreValue(): void {
    const searchTerm = this.searchTerm();
    this.searchControl.setValue(searchTerm, { emitEvent: false });
  }
}
