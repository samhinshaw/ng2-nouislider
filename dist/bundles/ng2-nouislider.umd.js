(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('nouislider'), require('@angular/core'), require('@angular/forms')) :
	typeof define === 'function' && define.amd ? define(['exports', 'nouislider', '@angular/core', '@angular/forms'], factory) :
	(factory((global['ng2-nouislider'] = {}),global.noUiSlider,global.ng.core,global.ng.forms));
}(this, (function (exports,nouislider,core,forms) { 'use strict';

var DefaultFormatter = (function () {
    function DefaultFormatter() {
    }
    /**
     * @param {?} value
     * @return {?}
     */
    DefaultFormatter.prototype.to = function (value) {
        // formatting with http://stackoverflow.com/a/26463364/478584
        return String(parseFloat(parseFloat(String(value)).toFixed(2)));
    };
    
    /**
     * @param {?} value
     * @return {?}
     */
    DefaultFormatter.prototype.from = function (value) {
        return parseFloat(value);
    };
    return DefaultFormatter;
}());
var NouisliderComponent = (function () {
    /**
     * @param {?} el
     * @param {?} renderer
     */
    function NouisliderComponent(el, renderer) {
        var _this = this;
        this.el = el;
        this.renderer = renderer;
        this.config = {};
        this.change = new core.EventEmitter(true);
        this.update = new core.EventEmitter(true);
        this.slide = new core.EventEmitter(true);
        this.set = new core.EventEmitter(true);
        this.start = new core.EventEmitter(true);
        this.end = new core.EventEmitter(true);
        this.onChange = Function.prototype;
        this.onTouched = Function.prototype;
        this.eventHandler = function (emitter, values, handle, unencoded) {
            var /** @type {?} */ v = _this.toValues(values);
            var /** @type {?} */ emitEvents = false;
            if (_this.value === undefined) {
                _this.value = v;
                return;
            }
            if (Array.isArray(v) && _this.value[handle] != v[handle]) {
                emitEvents = true;
            }
            if (!Array.isArray(v) && _this.value != v) {
                emitEvents = true;
            }
            if (emitEvents) {
                emitter.emit(v);
                _this.onChange(v);
            }
            if (Array.isArray(v)) {
                _this.value[handle] = v[handle];
            }
            else {
                _this.value = v;
            }
        };
        this.defaultKeyHandler = function (e) {
            var /** @type {?} */ stepSize = _this.slider.steps();
            var /** @type {?} */ index = parseInt(((e.target)).getAttribute('data-handle'));
            var /** @type {?} */ sign = 1;
            var /** @type {?} */ multiplier = 1;
            var /** @type {?} */ step = 0;
            var /** @type {?} */ delta = 0;
            switch (e.which) {
                case 34:// PageDown
                    multiplier = _this.config.pageSteps;
                case 40: // ArrowDown
                case 37:// ArrowLeft
                    sign = -1;
                    step = stepSize[index][0];
                    e.preventDefault();
                    break;
                case 33:// PageUp
                    multiplier = _this.config.pageSteps;
                case 38: // ArrowUp
                case 39:// ArrowRight
                    step = stepSize[index][1];
                    e.preventDefault();
                    break;
                default:
                    break;
            }
            delta = sign * multiplier * step;
            var /** @type {?} */ newValue;
            if (Array.isArray(_this.value)) {
                newValue = [].concat(_this.value);
                newValue[index] = newValue[index] + delta;
            }
            else {
                newValue = _this.value + delta;
            }
            _this.slider.set(newValue);
        };
    }
    /**
     * @return {?}
     */
    NouisliderComponent.prototype.ngOnInit = function () {
        var _this = this;
        var /** @type {?} */ inputsConfig = JSON.parse(JSON.stringify({
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
        this.slider = nouislider.create(this.el.nativeElement.querySelector('div'), Object.assign(this.config, inputsConfig));
        this.handles = [].slice.call(this.el.nativeElement.querySelectorAll('.noUi-handle'));
        if (this.config.keyboard) {
            if (this.config.pageSteps === undefined) {
                this.config.pageSteps = 10;
            }
            var _loop_1 = function (handle) {
                handle.setAttribute('tabindex', 0);
                handle.addEventListener('click', function () {
                    handle.focus();
                });
                if (this_1.config.onKeydown === undefined) {
                    handle.addEventListener('keydown', this_1.defaultKeyHandler);
                }
                else {
                    handle.addEventListener('keydown', this_1.config.onKeydown);
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = this.handles; _i < _a.length; _i++) {
                var handle = _a[_i];
                _loop_1(/** @type {?} */ handle);
            }
        }
        this.slider.on('set', function (values, handle, unencoded, tap, positions) {
            _this.set.emit({
                values: values,
                handle: handle,
                unencoded: unencoded,
                tap: tap,
                positions: positions
            });
        });
        this.slider.on('update', function (values, handle, unencoded, tap, positions) {
            _this.update.emit({
                values: values,
                handle: handle,
                unencoded: unencoded,
                tap: tap,
                positions: positions
            });
        });
        this.slider.on('change', function (values, handle, unencoded, tap, positions) {
            _this.change.emit({
                values: values,
                handle: handle,
                unencoded: unencoded,
                tap: tap,
                positions: positions
            });
        });
        this.slider.on('slide', function (values, handle, unencoded, tap, positions) {
            _this.slide.emit({
                values: values,
                handle: handle,
                unencoded: unencoded,
                tap: tap,
                positions: positions
            });
        });
        this.slider.on('start', function (values, handle, unencoded, tap, positions) {
            _this.start.emit({
                values: values,
                handle: handle,
                unencoded: unencoded,
                tap: tap,
                positions: positions
            });
        });
        this.slider.on('end', function (values, handle, unencoded, tap, positions) {
            _this.end.emit({
                values: values,
                handle: handle,
                unencoded: unencoded,
                tap: tap,
                positions: positions
            });
        });
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    NouisliderComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        if (this.slider && (changes.min || changes.max || changes.step || changes.range)) {
            setTimeout(function () {
                _this.slider.updateOptions({
                    range: Object.assign({}, {
                        min: _this.min,
                        max: _this.max
                    }, _this.range || {}),
                    step: _this.step
                });
            });
        }
    };
    /**
     * @param {?} values
     * @return {?}
     */
    NouisliderComponent.prototype.toValues = function (values) {
        var /** @type {?} */ v = values.map(this.config.format.from);
        return (v.length == 1 ? v[0] : v);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    NouisliderComponent.prototype.writeValue = function (value) {
        var _this = this;
        if (this.slider) {
            setTimeout(function () {
                _this.slider.set(value);
            });
        }
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    NouisliderComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    /**
     * @param {?} fn
     * @return {?}
     */
    NouisliderComponent.prototype.registerOnTouched = function (fn) {
        this.onTouched = fn;
    };
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    NouisliderComponent.prototype.setDisabledState = function (isDisabled) {
        isDisabled
            ? this.renderer.setAttribute(this.el.nativeElement.childNodes[0], 'disabled', 'true')
            : this.renderer.removeAttribute(this.el.nativeElement.childNodes[0], 'disabled');
    };
    return NouisliderComponent;
}());
NouisliderComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'nouislider',
                host: {
                    '[class.ng2-nouislider]': 'true'
                },
                template: '<div [attr.disabled]="disabled ? true : undefined"></div>',
                styles: ["\n    :host {\n      display: block;\n      margin-top: 1rem;\n      margin-bottom: 1rem;\n    }\n  "],
                providers: [
                    {
                        provide: forms.NG_VALUE_ACCESSOR,
                        useExisting: core.forwardRef(function () { return NouisliderComponent; }),
                        multi: true
                    }
                ]
            },] },
];
/**
 * @nocollapse
 */
NouisliderComponent.ctorParameters = function () { return [
    { type: core.ElementRef, },
    { type: core.Renderer2, },
]; };
NouisliderComponent.propDecorators = {
    'disabled': [{ type: core.Input },],
    'behaviour': [{ type: core.Input },],
    'connect': [{ type: core.Input },],
    'limit': [{ type: core.Input },],
    'min': [{ type: core.Input },],
    'max': [{ type: core.Input },],
    'snap': [{ type: core.Input },],
    'animate': [{ type: core.Input },],
    'range': [{ type: core.Input },],
    'step': [{ type: core.Input },],
    'format': [{ type: core.Input },],
    'pageSteps': [{ type: core.Input },],
    'config': [{ type: core.Input },],
    'ngModel': [{ type: core.Input },],
    'keyboard': [{ type: core.Input },],
    'onKeydown': [{ type: core.Input },],
    'formControl': [{ type: core.Input },],
    'tooltips': [{ type: core.Input },],
    'change': [{ type: core.Output },],
    'update': [{ type: core.Output },],
    'slide': [{ type: core.Output },],
    'set': [{ type: core.Output },],
    'start': [{ type: core.Output },],
    'end': [{ type: core.Output },],
};
var NouisliderModule = (function () {
    function NouisliderModule() {
    }
    return NouisliderModule;
}());
NouisliderModule.decorators = [
    { type: core.NgModule, args: [{
                exports: [NouisliderComponent],
                declarations: [NouisliderComponent],
            },] },
];
/**
 * @nocollapse
 */
NouisliderModule.ctorParameters = function () { return []; };

exports.DefaultFormatter = DefaultFormatter;
exports.NouisliderComponent = NouisliderComponent;
exports.NouisliderModule = NouisliderModule;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ng2-nouislider.umd.js.map
