import limit from 'limit-framework';
import template from './ui-file.html';
import { LAYOUT } from '../resources/layout';

const LOG = limit.Logger.get('File');

export class File extends limit.Component {

    static get tagName() { return 'ui-file'; }
    
    get template() { return template; }
    get resource() { return { label: '', placeholder: '', value: '', labelWidth: LAYOUT.labelWidth }; }

    created() {

        this.model.label = this.attr('ui-label');
        this.model.placeholder = this.attr('ui-placeholder');
        this.model.value = this.attr('ui-value');

        let file = this.find('input[type=file]');
        file.onchange = () => { this.model.value = file.files[0].path; };
        this.find('.ui.icon.button').onclick = () => { file.click(); };
    }

    get value() {
        return this.model.value;
    }

    set value(value) {
        this.model.value = value;
    }
}