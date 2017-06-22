import limit from 'limit-framework';
import template from './ui-input.html';
import { LAYOUT } from '../resources/layout';

const LOG = limit.Logger.get('Input');

export class Input extends limit.Component {

    static get tagName() { return 'ui-input'; }

    get template() { return template; }
    get resource() { return { label: '', placeholder: '', type: '', value: '', icon: '', inputType: '', labelWidth: LAYOUT.labelWidth }; }

    created() {
        this.model.label = this.attr('ui-label');
        this.model.placeholder = this.attr('ui-placeholder');
        this.model.type = this.attr('ui-type');
        this.model.value = this.attr('ui-value');
        this.model.icon = this.attr('ui-icon');
        this.model.inputType = this.model.icon ? 'action' : '';
        this.input = this.query(`input[type=${this.model.type}]`);
    }

    select() {
        this.input.select();
    }

    get value() {
        if (this.model.type === 'date') {
            return this.input.valueAsDate ? { dayOfWeek: this.input.valueAsDate.getDay(), dayOfMonth: this.input.valueAsDate.getDate(), date: this.input.value } : undefined;
        }
        return this.input.value;
    }

    set value(value) {
        this.model.value = value;
    }

    onaction(callback) {
        this.find('#action').then((action) => {
            action.onclick = () => { callback() };
        });
    }
}