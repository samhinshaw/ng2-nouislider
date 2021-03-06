import { create } from 'nouislider';
import { Component, ElementRef, EventEmitter, Input, NgModule, Output, Renderer2, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

class DefaultFormatter {
    /**
     * @param {?} value
     * @return {?}
     */
    to(value) {
        // formatting with http://stackoverflow.com/a/26463364/478584
        return String(parseFloat(parseFloat(String(value)).toFixed(2)));
    }
    ;
    /**
     * @param {?} value
     * @return {?}
     */
    from(value) {
        return parseFloat(value);
    }
}
class NouisliderComponent {
    /**
     * @param {?} el
     * @param {?} renderer
     */
    constructor(el, renderer) {
        this.el = el;
        this.renderer = renderer;
        this.config = {};
        this.change = new EventEmitter(true);
        this.update = new EventEmitter(true);
        this.slide = new EventEmitter(true);
        this.set = new EventEmitter(true);
        this.start = new EventEmitter(true);
        this.end = new EventEmitter(true);
        this.onChange = Function.prototype;
        this.onTouched = Function.prototype;
        this.eventHandler = (emitter, values, handle, unencoded) => {
            let /** @type {?} */ v = this.toValues(values);
            let /** @type {?} */ emitEvents = false;
            if (this.value === undefined) {
                this.value = v;
                return;
            }
            if (Array.isArray(v) && this.value[handle] != v[handle]) {
                emitEvents = true;
            }
            if (!Array.isArray(v) && this.value != v) {
                emitEvents = true;
            }
            if (emitEvents) {
                emitter.emit(v);
                this.onChange(v);
            }
            if (Array.isArray(v)) {
                this.value[handle] = v[handle];
            }
            else {
                this.value = v;
            }
        };
        this.defaultKeyHandler = (e) => {
            let /** @type {?} */ stepSize = this.slider.steps();
            let /** @type {?} */ index = parseInt(((e.target)).getAttribute('data-handle'));
            let /** @type {?} */ sign = 1;
            let /** @type {?} */ multiplier = 1;
            let /** @type {?} */ step = 0;
            let /** @type {?} */ delta = 0;
            switch (e.which) {
                case 34:// PageDown
                    multiplier = this.config.pageSteps;
                case 40: // ArrowDown
                case 37:// ArrowLeft
                    sign = -1;
                    step = stepSize[index][0];
                    e.preventDefault();
                    break;
                case 33:// PageUp
                    multiplier = this.config.pageSteps;
                case 38: // ArrowUp
                case 39:// ArrowRight
                    step = stepSize[index][1];
                    e.preventDefault();
                    break;
                default:
                    break;
            }
            delta = sign * multiplier * step;
            let /** @type {?} */ newValue;
            if (Array.isArray(this.value)) {
                newValue = [].concat(this.value);
                newValue[index] = newValue[index] + delta;
            }
            else {
                newValue = this.value + delta;
            }
            this.slider.set(newValue);
        };
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        let /** @type {?} */ inputsConfig = JSON.parse(JSON.stringify({
            behaviour: this.behaviour,
            connect: this.connect,
            limit: this.limit,
            start: this.formControl !== undefined ? this.formControl.value : this.ngModel,
            step: this.step,
            pageSteps: this.pageSteps,
            keyboard: this.keyboard,
            onKeydown: this.onKeydown,
            range: this.range || this.config.range || { min: this.min, max: this.max },
            tooltips: this.tooltips,
            snap: this.snap,
            animate: this.animate
        }));
        inputsConfig.tooltips = this.tooltips || this.config.tooltips;
        inputsConfig.format = this.format || this.config.format || new DefaultFormatter();
        this.slider = create(this.el.nativeElement.querySelector('div'), Object.assign(this.config, inputsConfig));
        this.handles = [].slice.call(this.el.nativeElement.querySelectorAll('.noUi-handle'));
        if (this.config.keyboard) {
            if (this.config.pageSteps === undefined) {
                this.config.pageSteps = 10;
            }
            for (let /** @type {?} */ handle of this.handles) {
                handle.setAttribute('tabindex', 0);
                handle.addEventListener('click', () => {
                    handle.focus();
                });
                if (this.config.onKeydown === undefined) {
                    handle.addEventListener('keydown', this.defaultKeyHandler);
                }
                else {
                    handle.addEventListener('keydown', this.config.onKeydown);
                }
            }
        }
        this.slider.on('set', (values, handle, unencoded, tap, positions) => {
            this.set.emit({
                values,
                handle,
                unencoded,
                tap,
                positions
            });
        });
        this.slider.on('update', (values, handle, unencoded, tap, positions) => {
            this.update.emit({
                values,
                handle,
                unencoded,
                tap,
                positions
            });
        });
        this.slider.on('change', (values, handle, unencoded, tap, positions) => {
            this.change.emit({
                values,
                handle,
                unencoded,
                tap,
                positions
            });
        });
        this.slider.on('slide', (values, handle, unencoded, tap, positions) => {
            this.slide.emit({
                values,
                handle,
                unencoded,
                tap,
                positions
            });
        });
        this.slider.on('start', (values, handle, unencoded, tap, positions) => {
            this.start.emit({
                values,
                handle,
                unencoded,
                tap,
                positions
            });
        });
        this.slider.on('end', (values, handle, unencoded, tap, positions) => {
            this.end.emit({
                values,
                handle,
                unencoded,
                tap,
                positions
            });
        });
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
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
    /**
     * @param {?} values
     * @return {?}
     */
    toValues(values) {
        let /** @type {?} */ v = values.map(this.config.format.from);
        return (v.length == 1 ? v[0] : v);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    writeValue(value) {
        if (this.slider) {
            setTimeout(() => {
                this.slider.set(value);
            });
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        this.onChange = fn;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    setDisabledState(isDisabled) {
        isDisabled
            ? this.renderer.setAttribute(this.el.nativeElement.childNodes[0], 'disabled', 'true')
            : this.renderer.removeAttribute(this.el.nativeElement.childNodes[0], 'disabled');
    }
}
NouisliderComponent.decorators = [
    { type: Component, args: [{
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
            },] },
];
/**
 * @nocollapse
 */
NouisliderComponent.ctorParameters = () => [
    { type: ElementRef, },
    { type: Renderer2, },
];
NouisliderComponent.propDecorators = {
    'disabled': [{ type: Input },],
    'behaviour': [{ type: Input },],
    'connect': [{ type: Input },],
    'limit': [{ type: Input },],
    'min': [{ type: Input },],
    'max': [{ type: Input },],
    'snap': [{ type: Input },],
    'animate': [{ type: Input },],
    'range': [{ type: Input },],
    'step': [{ type: Input },],
    'format': [{ type: Input },],
    'pageSteps': [{ type: Input },],
    'config': [{ type: Input },],
    'ngModel': [{ type: Input },],
    'keyboard': [{ type: Input },],
    'onKeydown': [{ type: Input },],
    'formControl': [{ type: Input },],
    'tooltips': [{ type: Input },],
    'change': [{ type: Output },],
    'update': [{ type: Output },],
    'slide': [{ type: Output },],
    'set': [{ type: Output },],
    'start': [{ type: Output },],
    'end': [{ type: Output },],
};

class NouisliderModule {
}
NouisliderModule.decorators = [
    { type: NgModule, args: [{
                exports: [NouisliderComponent],
                declarations: [NouisliderComponent],
            },] },
];
/**
 * @nocollapse
 */
NouisliderModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { DefaultFormatter, NouisliderComponent, NouisliderModule };
//# sourceMappingURL=ng2-nouislider.js.map
