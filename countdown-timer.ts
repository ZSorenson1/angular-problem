import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  imports: [],
  selector: 'app-countdown-timer',
  template: `
    <div class="countdown-container">
      @if (isLoading) {
        <p>Loading...</p>
      } @else if (errorMsg) {
        <p>{{ errorMsg }}</p>
      } @else {
        <div class="timer">{{ count }}</div>
      }
    </div>
  `,
})

//This would still work without these interfaces but enforcing strong type checking is best practice.
export class CountdownTimer implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  count: number = 0;
  isLoading: boolean = true;
  errorMsg: string | null = null;
  private timerSub?: Subscription;
  
  //Since the end time never changes only one API call needs to be made. 
  ngOnInit() {
     this.getInitialCount();
  }
  
  getInitialCount() {
    this.http.get<{ secondsLeft: number }>('https://insertdomain.com/api/deadline')
      .subscribe({
        next: (data) => {
          this.count = data.secondsLeft;
          this.isLoading = false;
          this.startCountdown();
        },
        error: (err) => {
          this.errorMsg = 'Timer has failed to load.';
          this.isLoading = false;
        }
      })
  }
  
  startCountdown() {
    this.timerSub = timer(0, 1000)
      .pipe(
        takeWhile(() => this.count >= 0)
      )
      .subscribe(() => {
        if(this.count > 0) {
          this.count--;
        } else {
          this.handleTimerEnd()
        }
      })
  }

  handleTimerEnd() {
    this.timerSub?.unsubscribe();
  }

  //if the Component is destroyed before the timer finishes make sure it doesn't run forever 
  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
