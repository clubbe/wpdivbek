import limit from 'limit-framework';
import template from './ui-select.html';
import { LAYOUT } from '../resources/layout';

const LOG = limit.Logger.get('Select');

export class Select extends limit.Component {

    static get tagName() { return 'ui-select'; }
    get template() { return template; }
    get resource() { return viewModel(this.model); }

    created() {

        this.model.label = this.attr('ui-label');
        this.model.placeholder = this.attr('ui-placeholder');
        this.model.value = this.attr('ui-value');
        this.model.options = this.attr('ui-options').split(',');

        let select = this.find('select');
        select.onchange = () => {
            this.model.value = select.value;
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

function viewModel(model) {
    return {
        label: model ? model.label : '',
        placeholder: model ? model.placeholder : '',
        value: model ? model.value : '',
        options: model ? model.options : [],
        labelWidth: LAYOUT.labelWidth
    };
}