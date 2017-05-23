import limit from 'limit-framework';
import template from './ui-input.html';
import { LAYOUT } from '../resources/layout';

const LOG = limit.Logger.get('Input');

export class Input extends limit.Component {

    static get tagName() { return 'ui-input'; }
    get template() { return template; }
    get resource() { return viewModel(this.model); }

    created() {
        this.model.label = this.attr('ui-label');
        this.model.placeholder = this.attr('ui-placeholder');
        this.model.type = this.attr('ui-type');
        this.model.value = this.attr('ui-value');
    }

    get value() {
        let input = this.find(`input[type=${this.model.type}]`);
        if (this.model.type === 'date') {
            return input.valueAsDate ? input.valueAsDate + '' : undefined;
        }
        return input.value;
    }

    set value(value) {
        this.model.value = value;
    }
}

function viewModel(model) {
    return {
        label: model ? model.label : '',
        placeholder: model ? model.placeholder : '',
        type: model ? model.type : 'text',
        value: model ? model.value : '',
        labelWidth: LAYOUT.labelWidth
    };
}