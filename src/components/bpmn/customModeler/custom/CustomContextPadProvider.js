import store from '../../../../store'
import {
    isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import { batchCreateCustom, customShapeAction, customFlowAction } from '../utils/util'
export default function ContextPadProvider(contextPad, config, injector, translate, bpmnFactory, elementFactory, create, modeling, connect) {
    this.create = create
    this.elementFactory = elementFactory
    this.translate = translate
    this.bpmnFactory = bpmnFactory
    this.modeling = modeling
    this.connect = connect
    config = config || {}
    if (config.autoPlace !== false) {
        this.autoPlace = injector.get('autoPlace', false);
    }
    contextPad.registerProvider(this)
}

ContextPadProvider.$inject = [
    'contextPad',
    'config',
    'injector',
    'translate',
    'bpmnFactory',
    'elementFactory',
    'create',
    'modeling',
    'connect'
]

ContextPadProvider.prototype.getContextPadEntries = function(element) {
    const {
        autoPlace,
        create,
        elementFactory,
        translate,
        modeling,
        bpmnFactory,
        connect
    } = this;

    var actions = {}
    var businessObject = element.businessObject

    // 删除功能
    function removeElement(e) {
        modeling.removeElements([element])
    }

    function startConnect(event, element) {
        connect.start(event, element)
    }

    function clickElement(e) {
        console.log(element)
        store.commit('SETNODEINFO', element)
        store.commit('TOGGLENODEVISIBLE', true)
    }

    function createAction(type, group, className, title, options) {
        function appendCustomElements(type) {
            return function(event, element) {
                console.log(title)
                console.log(autoPlace)
                if (autoPlace) {
                    const businessObject = bpmnFactory.create(type)
                    const shape = elementFactory.createShape(Object.assign({
                        type,
                        businessObject
                    }, options))
                    autoPlace.append(element, shape)
                } else {
                    appendCustomElementsStart(event, element)
                }
            }
        }

        function appendCustomElementsStart(type) {
            return function(event) {
                const businessObject = bpmnFactory.create(type)
                const shape = elementFactory.createShape(Object.assign({
                    type,
                    businessObject
                }, options))
                create.start(event, shape, element)
            }
        }
        return {
            group,
            className,
            title: translate(title),
            action: {
                click: appendCustomElements(type),
                dragstart: appendCustomElementsStart(type)
            }
        }
    }

    function createConnect(type, group, className, title, options) {
        return {
            group,
            className,
            title,
            action: {
                click: startConnect,
                dragstart: startConnect
            }
        }
    }

    function editElement() { // 创建编辑图标
        return {
            group: 'edit',
            className: 'icon-custom icon-custom-edit',
            title: translate('编辑'),
            action: {
                click: clickElement
            }
        }
    }

    function deleteElement() {
        return {
            group: 'edit',
            className: 'icon-custom icon-custom-delete',
            title: translate('删除'),
            action: {
                click: removeElement
            }
        }
    }

    // 只有点击列表中的元素才会产生的元素
    if (isAny(businessObject, ['bpmn:StartEvent', 'bpmn:Task', 'bpmn:BusinessRuleTask', 'bpmn:ExclusiveGateway', 'bpmn:DataObjectReference'])) {
        Object.assign(actions, {
            ...batchCreateCustom(customShapeAction, createAction),
            ...batchCreateCustom(customFlowAction, createConnect), // 连接线
            'edit': editElement(),
            'delete': deleteElement()
        })
    }
    // 结束节点和线只有删除和编辑
    if (isAny(businessObject, ['bpmn:EndEvent', 'bpmn:SequenceFlow', 'bpmn:DataOutputAssociation'])) {
        Object.assign(actions, {
            'edit': editElement(),
            'delete': deleteElement()
        })
    }
    return actions
}