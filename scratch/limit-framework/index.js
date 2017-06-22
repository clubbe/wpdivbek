'use strict';
const observer = require('universal-observer');
const virtual = require('virtual-html');
const diff = require('virtual-dom/diff');
const patch = require('virtual-dom/patch');
const createElement = require('virtual-dom/create-element');
const Logger = require('js-logger');
const EventEmitter = require('events');
const EVENTS = new EventEmitter();

const diffDOM = require('diff-dom');
const dd = new diffDOM();

const LOG = Logger.get('limit-framework');

const support = {
    'customElements.define': customElements && customElements.define ? true : false,
    'document.registerElement': document && document.registerElement ? true : false
}

class Component extends HTMLElement {

    constructor() {
        super();
        if (!this.template) this.template = '<div>implement <code>get template() {return\'<div>...</div>\';}</code></div>';
        else if (this.resource) this.model = observer.observe(this.resource, () => { this.render(); }, { deliveryMode: 'singleOperation', reportLength: false });
        this.render();
    }

    render() {
        let template = parse(this.template, this.model);
        appendTemplate(this, template);
        if (this.isAttached) return;
        this.isAttached = true;
        setTimeout(() => { this.created && this.created(); }, 1);
    }

    find(pattern) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let element = this.query(pattern);
                if (element) {
                    resolve(element);
                } else {
                    reject(new Error(`Element not found for ${pattern} in ${this.tagName}`));
                }
            }, 1);
        });
    }

    query(pattern) {
        return this.shadowRoot.querySelector(pattern);
    }

    attr(name) {
        let attr = this.attributes && this.attributes[name] && this.attributes[name].value;
        return attr ? this.attributes[name].value : this[name];
    }
}

function appendTemplate(element, template) {

    LOG.debug('appendTemplate > ', { element, template });

    if (!element.shadowRoot) {
        if (support['customElements.define']) element.attachShadow({ mode: 'open' }); // closed
        else if (support['document.registerElement']) element.createShadowRoot();
        if (element.shadowRoot === null) throw Error('Nope');

        // let el = document.createElement('div');
        // el.innerHTML = `<template>${template}</template>`;
        // let clone = document.importNode(el.firstChild.content, true);
        // LOG.debug('appendTemplate > ', { el, clone });
        // element.shadowRoot.appendChild(clone);

        let tree = virtual(`<div>${template}</div>`);
        let rootNode = createElement(tree);
        element.shadowRoot.appendChild(rootNode);
        LOG.debug({ element, template, tree, rootNode });

        // element.shadowRoot.appendChild(createTemplate(template));
        return;
    }

    // LOG.debug('appendTemplate > ', { elementA: element.shadowRoot.firstChild, elementB: createTemplate(template) });

    // let diff = dd.diff(element.shadowRoot.firstChild, createTemplate(template));
    // if (!diff) {
    //     diff = dd.diff(createTemplate(template), element.shadowRoot.firstChild);
    // }
    // LOG.debug('appendTemplate > ', { elementA: element.shadowRoot.firstChild, elementB: createTemplate(template) });
    // dd.apply(element.shadowRoot.firstChild, diff);

    // let tree = virtual(`<template>${element.shadowRoot.innerHTML}</template>`);
    // let newTree = virtual(`<template>${template}</template>`);

    let tree = virtual(element.shadowRoot.innerHTML);
    let newTree = virtual(`<div>${template}</div>`);

    let patches = diff(tree, newTree);
    LOG.debug('appendTemplate > ', { tree, newTree, patches });
    patch(element.shadowRoot.firstChild, patches);
}

function createTemplate(template) {

    let el = document.createElement('div');
    el.innerHTML = `<div>${template}</div>`;
    return el.firstChild;
    // el.innerHTML = `<template>${template}</template>`;
    // return document.importNode(el.firstChild.content, true);
    // LOG.debug('appendTemplate > ', { el, clone });
}

function registerComponents(components) {
    if ((components instanceof Array) === false) {
        throw new Error('components must be instance of Array');
    }
    for (let component of components) {
        if (support['customElements.define']) {
            customElements.define(component.tagName, component);
            continue;
        }
        if (support['document.registerElement']) {
            document.registerElement(component.tagName, component);
            continue;
        }
        throw Error('Nope');
    }
}

let RENDERER = null;

function setViewModelRenderer(renderer) {
    RENDERER = renderer;
}

function parse(view, model) {
    if (!RENDERER) return view;
    return RENDERER(view, model);
}

module.exports = { EVENTS, Logger, Component, registerComponents, setViewModelRenderer };