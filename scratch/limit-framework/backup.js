'use strict';
const observer = require('universal-observer');
const diffDOM = require('diff-dom');
const Logger = require('js-logger');
const EventEmitter = require('events');
const EVENTS = new EventEmitter();

const dd = new diffDOM();

const LOG = Logger.get('limit-framework');

const support = {
    'customElements.define': customElements && customElements.define ? true : false,
    'document.registerElement': document && document.registerElement ? true : false
}

class Component extends HTMLElement {

    constructor(template) {
        super();
        if (!this.template) this.template = template;
        if (this.resource) this.model = observer.observe(this.resource, (change) => { this.render(); });
        this.render();
    }

    render() {
        let template = parse(this.template, this.resource);
        appendTemplate(this, template);
        if (this.isAttached) return;
        this.isAttached = true;
        setTimeout(() => { this.created && this.created(); }, 1);
    }

    find(pattern) {
        return this.shadowRoot.querySelector(pattern);
    }
}

function appendTemplate(element, template) {

    LOG.debug('appendTemplate > ', { element, template });

    if (!element.shadowRoot) {
        if (support['customElements.define']) element.attachShadow({ mode: 'open' }); // closed
        else if (support['document.registerElement']) element.createShadowRoot();
        if (element.shadowRoot === null) throw Error('Nope');
        element.shadowRoot.appendChild(createTemplate(template));
        return;
    }

    let temp = createTemplate(template);
    let diff = dd.diff(element.shadowRoot, temp);
    if (!diff) {
        diff = dd.diff(temp, element.shadowRoot);
    }
    LOG.debug('appendTemplate > ', { diff });
    dd.apply(element.shadowRoot, diff);
}

function createTemplate(template) {

    let el = document.createElement('div');
    el.innerHTML = `<template>${template}</template>`;
    return document.importNode(el.firstChild.content, true);
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