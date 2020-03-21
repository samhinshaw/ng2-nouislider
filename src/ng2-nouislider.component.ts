import * as noUiSlider from 'nouislider';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  OnChanges,
  Output,
  Renderer2
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

export interface NouiFormatter {
  to(value: number): string;
  from(value: string): number;
}

export class DefaultFormatter implements NouiFormatter {
  to(value: number): string {
    // formatting with http://stackoverflow.com/a/26463364/478584
    return String(parseFloat(parseFloat(String(value)).toFixed(2)));
  };

  from(value: string): number {
    return parseFloat(value);
  }
}

export interface NouiEvent {
  values: any[]
  handle: number
  unencoded: number[]
  tap: boolean
  positions: number[]
}

@Component({
  selector: 'nouislider',
  host: {
    '[class.ng2-nouislider]': 'true'
  },
  template: '<div [attr.disabled]="disabled ? true : undefined"></div>',
  styles: [`
    :host {
      display: block;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NouisliderComponent),
      multi: true
    }
  ]
})
export class NouisliderComponent implements ControlValueAccessor, OnInit, OnChanges {

  public slider: any;
  public handles: any[];
  @Input() public disabled: boolean; // tslint:disable-line
  @Input() public behaviour: string;
  @Input() public connect: boolean[];
  @Input() public limit: number;
  @Input() public min: number;
  @Input() public max: number;
  @Input() public snap: boolean;
  @Input() public animate: boolean | boolean[];
  @Input() public range: any;
  @Input() public step: number;
  @Input() public format: NouiFormatter;
  @Input() public pageSteps: number;
  @Input() public config: any = {};
  @Input() public ngModel: number | number[];
  @Input() public keyboard: boolean;
  @Input() public onKeydown: any;
  @Input() public formControl: FormControl;
  @Input() public tooltips: Array<any>;
  @Output() public change: EventEmitter<NouiEvent> = new EventEmitter(true);
  @Output() public update: EventEmitter<NouiEvent> = new EventEmitter(true);
  @Output() public slide: EventEmitter<NouiEvent> = new EventEmitter(true);
  @Output() public set: EventEmitter<NouiEvent> = new EventEmitter(true);
  @Output() public start: EventEmitter<NouiEvent> = new EventEmitter(true);
  @Output() public end: EventEmitter<NouiEvent> = new EventEmitter(true);
  private value: any;
  private onChange: any = Function.prototype;
  private onTouched: any = Function.prototype;

  constructor(private el: ElementRef, private renderer : Renderer2) { }

  ngOnInit(): void {
    let inputsConfig = JSON.parse(JSON.stringify({
      behaviour: this.behaviour,
      connect: this.connect,
      limit: this.limit,
      start: this.formControl !== undefined ? this.formControl.value : this.ngModel,
      step: this.step,
      pageSteps: this.pageSteps,
      keyboard: this.keyboard,
      onKeydown: this.onKeydown,
      range: this.range || this.config.range || {min: this.min, max: this.max},
      tooltips: this.tooltips,
      snap: this.snap,
      animate: this.animate
    }));
    inputsConfig.tooltips = this.tooltips || this.config.tooltips;
    inputsConfig.format = this.format || this.config.format || new DefaultFormatter();

    this.slider = noUiSlider.create(
      this.el.nativeElement.querySelector('div'),
      Object.assign(this.config, inputsConfig)
    );

    this.handles = [].slice.call(this.el.nativeElement.querySelectorAll('.noUi-handle'));

    if(this.config.keyboard) {
      if(this.config.pageSteps === undefined) {
        this.config.pageSteps = 10;
      }
      for(let handle of this.handles) {
        handle.setAttribute('tabindex', 0);
        handle.addEventListener('click', () => {
          handle.focus();
        });
        if(this.config.onKeydown === undefined) {
          handle.addEventListener('keydown', this.defaultKeyHandler);
        } else {
          handle.addEventListener('keydown', this.config.onKeydown);
        }
      }
    }

    this.slider.on('set', (values: string[], handle: number, unencoded: number[], tap: any, positions: any) => {
      this.set.emit({
        values, 
        handle, 
        unencoded,
        tap,
        positions
      });
    });

    this.slider.on('update', (values: string[], handle: number, unencoded: number[], tap: any, positions: any) => {
      this.update.emit({
        values, 
        handle, 
        unencoded,
        tap,
        positions
      });
    });

    this.slider.on('change', (values: string[], handle: number, unencoded: number[], tap: any, positions: any) => {
      this.change.emit({
        values, 
        handle, 
        unencoded,
        tap,
        positions
      })
    });

    this.slider.on('slide', (values: string[], handle: number, unencoded: number[], tap: any, positions: any) => {
      this.slide.emit({
        values, 
        handle, 
        unencoded,
        tap,
        positions
      })
    });

    this.slider.on('start', (values: string[], handle: number, unencoded: number[], tap: any, positions: any) => {
      this.start.emit({
        values, 
        handle, 
        unencoded,
        tap,
        positions
      });
    });

    this.slider.on('end', (values: string[], handle: number, unencoded: number[], tap: any, positions: any) => {
      this.end.emit({
        values, 
        handle, 
        unencoded,
        tap,
        positions
      });
    });
  }

  ngOnChanges(changes: any) {
    if (this.slider && (changes.min || changes.max || changes.step || changes.range)) {
      setTimeout(() => {
        this.slider.updateOptions({
          range: Object.assign({}, {
            min: this.min,
            max: this.max
          }, this.range || {}),
          step: this.step
        });
      });
    }
  }

  toValues(values: string[]): any | any[] {
    let v = values.map(this.config.format.from);
    return (v.length == 1 ? v[0] : v);
  }

  writeValue(value: any): void {
    if (this.slider) {
      setTimeout(() => {
        this.slider.set(value);
      });
    }
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.renderer.setAttribute(this.el.nativeElement.childNodes[0], 'disabled', 'true')
      : this.renderer.removeAttribute(this.el.nativeElement.childNodes[0], 'disabled');
  }

  private eventHandler = (emitter: EventEmitter<any>, values: string[], handle: number, unencoded: number[]) => {
    let v = this.toValues(values);
    let emitEvents = false;
    if(this.value === undefined) {
      this.value = v;
      return;
    }
    if(Array.isArray(v) && this.value[handle] != v[handle]) {
      emitEvents = true;
    }
    if(!Array.isArray(v) && this.value != v) {
      emitEvents = true;
    }
    if(emitEvents) {
      emitter.emit(v);
      this.onChange(v);
    }
    if(Array.isArray(v)) {
      this.value[handle] = v[handle];
    } else {
      this.value = v;
    }
  }

  private defaultKeyHandler = (e: KeyboardEvent) => {
    let stepSize: any[] = this.slider.steps();
    let index = parseInt((<HTMLElement>e.target).getAttribute('data-handle'));
    let sign = 1;
    let multiplier: number = 1;
    let step = 0;
    let delta = 0;

    switch ( e.which ) {
      case 34:  // PageDown
        multiplier = this.config.pageSteps;
      case 40:  // ArrowDown
      case 37:  // ArrowLeft
        sign = -1;
        step = stepSize[index][0];
        e.preventDefault();
        break;

      case 33:  // PageUp
        multiplier = this.config.pageSteps;
      case 38:  // ArrowUp
      case 39:  // ArrowRight
        step = stepSize[index][1];
        e.preventDefault();
        break;

      default:
        break;
    }

    delta = sign * multiplier * step;
    let newValue: number | number[];

    if(Array.isArray(this.value)) {
      newValue = [].concat(this.value);
      newValue[index] = newValue[index] + delta;
    } else {
      newValue = this.value + delta;
    }

    this.slider.set(newValue);
  }
}

