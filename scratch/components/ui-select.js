import limit from 'limit-framework';
import template from './ui-select.html';
import { LAYOUT } from '../resources/layout';

const LOG = limit.Logger.get('Select');

export class Select extends limit.Component {

    static get tagName() { return 'ui-select'; }

    get template() { return template; }
    get resource() { return { label: '', placeholder: '', value: '', labelWidth: LAYOUT.labelWidth }; }

    created() {

        this.model.label = this.attr('ui-label');
        this.model.placeholder = this.attr('ui-placeholder');
        this.model.value = this.attr('ui-value');

        let options = [];
        let temp = this.attr('ui-options').split(',');
        for (let option of temp) {
            options.push({ value: option, selected: option === this.model.value });
        }
        this.model.options = options;

        let select = this.find('select');
        select.onchange = () => {

            this.model.value = select.value;

            let options = [];
            let temp = this.model.options;
            for (let option of temp) {
                options.push({ value: option.value, selected: option.value === this.model.value });
            }
            this.model.options = options;

            limit.EVENTS.emit(this.changedEvent);
        };
    }

    get changedEvent() {
        return `${Select.tagName}:changed`;
    }

    get value() {
        return this.model.value === this.model.placeholder ? undefined : this.model.value;
    }

    set value(value) {
        this.model.value = value;
    }

    set onchange(onchange) {
        limit.EVENTS.on(this.changedEvent, () => {
            onchange();
        });
    }
}