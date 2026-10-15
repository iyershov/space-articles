import { Component, effect, input } from '@angular/core';
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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class SearchComponent {
  readonly inputId = input.required<string>();
  readonly searchTerm = input<string | null>('');
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  readonly searchChange = outputFromObservable(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
  );

  constructor() {
    effect(() => {
      const value = this.searchTerm() ?? '';
      if (this.searchControl.value !== value) {
        this.searchControl.setValue(value, { emitEvent: false });
      }
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
