/* eslint-disable no-unused-vars */
import inherits from 'inherits'

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'

import {
    append as svgAppend,
    create as svgCreate
} from 'tiny-svg'

import { customElements, customConfig, STATICPATH, hasLabelElements } from '../utils/util'
/**
 * A renderer that knows how to render custom elements.
 */
export default function CustomRenderer(eventBus, styles, bpmnRenderer) {
    BaseRenderer.call(this, eventBus, 2000)
    var computeStyle = styles.computeStyle

    this.drawElements = function(parentNode, element) {
        console.log(element)
        const type = element.type // 获取到类型
        if (type !== 'label') {
            if (customElements.includes(type)) { // or customConfig[type]
                return drawCustomElements(parentNode, element)
            }
            const shape = bpmnRenderer.drawShape(parentNode, element)
            return shape
        } else {
            element
        }
    }
}

inherits(CustomRenderer, BaseRenderer)

CustomRenderer.$inject = ['eventBus', 'styles', 'bpmnRenderer']

CustomRenderer.prototype.canRender = function(element) {
    // ignore labels
    return true
        // return !element.labelTarget;
}

CustomRenderer.prototype.drawShape = function(parentNode, element) {
    return this.drawElements(parentNode, element)
}

CustomRenderer.prototype.getShapePath = function(shape) {
    // console.log(shape)
}

function drawCustomElements(parentNode, element) {
    const { type } = element
    const { field, attr } = customConfig[type]
    const url = `${STATICPATH}${field}.png`
    const customIcon = svgCreate('image', {
        ...attr,
        href: url
    })
    element['width'] = attr.width // 这里我是取了巧, 直接修改了元素的宽高
    element['height'] = attr.height
    svgAppend(parentNode, customIcon)
        // 判断是否有name属性来决定是否要渲染出label
    if (!hasLabelElements.includes(type) && element.businessObject.name) {
        const text = svgCreate('text', {
            x: attr.x,
            y: attr.y + attr.height + 20,
            "font-size": "14",
            "fill": "#000"
        })
        text.innerHTML = element.businessObject.name
        svgAppend(parentNode, text)
        console.log(text)
    }
    return customIcon
}