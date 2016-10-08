/**
 * Knockout.js textInputComplete binding
 * A Knockout.js binding which keep tracks of text inputs and update observable 
 * only when user stops typing
 *
 * Copyright (c) 2016 Yu H.
 * 
 * @author Yu H.
 * @version 1.0.0
 * @license The MIT License (MIT)
 * https://opensource.org/licenses/MIT
 **/
(function() {
    // Some of the variables and ko.utils available in the debug version is not 
    // available in production version
    var utils = {};
    utils.tagNameLower = function(element) {
        // For HTML elements, tagName will always be upper case; 
        // for XHTML elements, it'll be lower case.
        // Possible future optimization: If we know it's an element from 
        // an XHTML document (not HTML), we don't need to do the 
        // .toLowerCase() as it will always be lower case anyway.
        return element && element.tagName && element.tagName.toLowerCase();
    };
    // The ko.utils.setTimeout is introduced in 3.4.0 to provide support to
    // asynchronous error handling.
    // For Knockout.js prior to 3.4.0, the workaround is simply replace it with
    // a simple setTimeout
    utils.setTimeout = ko.utils.setTimeout || function (handler, timeout) {
        return setTimeout(handler, timeout);
    };
    if (window && window.navigator) {
        // Detect various browser versions because some old versions don't 
        // fully support the 'input' event
        var parseVersion = function (matches) {
            if (matches) {
                return parseFloat(matches[1]);
            }
        };
        var userAgent = window.navigator.userAgent;
        utils.ieVersion = document && (function() {
            var version = 3, 
                div = document.createElement('div'), 
                iElems = div.getElementsByTagName('i');

            // Keep constructing conditional HTML blocks until we hit one that 
            // resolves to an empty fragment
            while (
                div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
                iElems[0]
            ) {}
            return version > 4 ? version : undefined;
        }());
        utils.operaVersion = window.opera && window.opera.version && parseInt(window.opera.version());
        utils.safariVersion = parseVersion(userAgent.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i));
        utils.firefoxVersion = parseVersion(userAgent.match(/Firefox\/([^ ]*)/));
    }
    if (utils.ieVersion < 10) {
        // In the original design of Knockout.js, There is only one universal
        // statechange event listener binded to the document node. When 
        // statechange event is triggered, the universal listener will find the 
        // current active element and invoke the statechange event handlers 
        // registered by that element. The registrations between handler and 
        // element are managed by ko.utils.domData
        // However, in production version of Knockout.js, the ko.utils.domData 
        // lacks the essential methods to register statchenage event handlers 
        // to the universal listener. So here we will implement a simplified
        // version of ko.utils.domData to replace its job.
        var selectionChangeName = "__ko_textInputComplete__", 
            selectionChangeHandlerId = 0, 
            selectionChangeHandlerMapping = [];
        var selectionChangeHandler = function(event) {
            var target = this.activeElement,
                mappingId = target && target[selectionChangeName];

            if (mappingId) {
                selectionChangeHandlerMapping[mappingId](event);
            }
        };
        utils.registerForSelectionChangeEvent = function (element, handler) {
            var ownerDoc = element.ownerDocument;
            // Bind an universal event listener to the selectionchange event of
            // the owner document node once only
            if (!ownerDoc[selectionChangeName]) {

                ownerDoc[selectionChangeName] = true;
                ko.utils.registerEventHandler(ownerDoc, 'selectionchange', selectionChangeHandler);
            }
            var handlerId = selectionChangeHandlerId++;
            selectionChangeHandlerMapping[handlerId] = handler;
            element[selectionChangeName] = handlerId;
        };
    }

    ko.bindingHandlers['textInputComplete'] = {
        'init': function (element, valueAccessor, allBindings) {
            var previousElementValue = element.value,
                value = valueAccessor(), 
                // default updater delay is 300ms
                updaterDelay = allBindings.get('textInputCompleteDelay') || 
                    ko.bindingHandlers['textInputComplete']['delay'] || 
                    300, 
                timeoutHandle,
                updaterHandle,
                elementValueBeforeEvent;

            var updateModel = function (event) {
                clearTimeout(timeoutHandle);
                clearTimeout(updaterHandle);
                elementValueBeforeEvent = timeoutHandle = updaterHandle = undefined;

                var updater = function() {
                    updaterHandle = undefined;
                    var elementValue = element.value;
                    if (previousElementValue !== elementValue) {
                        previousElementValue = elementValue;
                        value(elementValue);
                    }
                }
                if (event.type === 'blur') {
                    // blur event trigger the update immediately
                    updater();
                } else {
                    // otherwise wait for delay
                    updaterHandle = utils.setTimeout(updater, updaterDelay);
                }
            };

            var deferUpdateModel = function (event) {
                if (!timeoutHandle) {
                    // The elementValueBeforeEvent variable is set *only* 
                    // during the brief gap between an event firing and the 
                    // updateModel function running. This allows us to ignore 
                    // model updates that are from the previous state of the 
                    // element, usually due to techniques such as rateLimit. 
                    // Such updates, if not ignored, can cause keystrokes to 
                    // be lost.
                    elementValueBeforeEvent = element.value;
                    var handler = updateModel.bind(element, {type: event.type});
                    timeoutHandle = utils.setTimeout(handler, 4);
                }
            };

            // IE9 will mess up the DOM if you handle events synchronously 
            // which results in DOM changes (such as other bindings);
            // so we'll make sure all updates are asynchronous
            var ieUpdateModel = utils.ieVersion == 9? 
                deferUpdateModel: 
                updateModel;

            var updateView = function () {
                var modelValue = ko.utils.unwrapObservable(valueAccessor());

                if (modelValue === null || modelValue === undefined) {
                    modelValue = '';
                }

                if (elementValueBeforeEvent !== undefined && 
                    modelValue === elementValueBeforeEvent) {

                    utils.setTimeout(updateView, 4);
                    return;
                }

                // Update the element only if the element and model are 
                // different. On some browsers, updating the value will move 
                // the cursor to the end of the input, which would be bad while 
                // the user is typing.
                if (element.value !== modelValue) {
                    // Make sure we ignore events (propertychange) that result 
                    // from updating the value
                    previousElementValue = modelValue;
                    element.value = modelValue;
                }
            };

            var onEvent = function (event, handler) {
                ko.utils.registerEventHandler(element, event, handler);
            };

            if (utils.ieVersion < 10) {
                // Internet Explorer <= 8 doesn't support the 'input' event, 
                // but does include 'propertychange' that fires whenever any 
                // property of an element changes. Unlike 'input', it also 
                // fires if a property is changed from JavaScript code, but 
                // that's an acceptable compromise for this binding. IE 9 does 
                // support 'input', but since it doesn't fire it when using 
                // autocomplete, we'll use 'propertychange' for it also.
                onEvent('propertychange', function(event) {
                    if (event.propertyName === 'value') {
                        ieUpdateModel(event);
                    }
                });

                if (utils.ieVersion == 8) {
                    // IE 8 has a bug where it fails to fire 'propertychange' 
                    // on the first update following a value change from
                    // JavaScript code. It also doesn't fire if you clear the 
                    // entire value. To fix this, we bind to the following
                    // events too.

                    // A single keystoke
                    onEvent('keyup', updateModel);
                    // The first character when a key is held down
                    onEvent('keydown', updateModel);
                }
                if (utils.ieVersion >= 8) {
                    // Internet Explorer 9 doesn't fire the 'input' event when 
                    // deleting text, including using the backspace, delete, or 
                    // ctrl-x keys, clicking the 'x' to clear the input, 
                    // dragging text out of the field, and cutting or deleting 
                    // text using the context menu. 'selectionchange' can 
                    // detect all of those except dragging text out of the 
                    // field, for which we use 'dragend'.
                    // These are also needed in IE8 because of the bug 
                    // described above.

                    // 'selectionchange' covers cut, paste, drop, delete, etc.
                    utils.registerForSelectionChangeEvent(element, ieUpdateModel);
                    onEvent('dragend', deferUpdateModel);
                }
            } else {
                // All other supported browsers support the 'input' event, 
                // which fires whenever the content of the element is changed
                // through the user interface.
                onEvent('input', updateModel);

                if (utils.safariVersion < 5 && 
                    utils.tagNameLower(element) === "textarea") {

                    // Safari <5 doesn't fire the 'input' event for <textarea> 
                    // elements (it does fire 'textInput' but only when 
                    // typing). So we'll just catch as much as we can with 
                    // keydown, cut, and paste.
                    onEvent('keydown', deferUpdateModel);
                    onEvent('paste', deferUpdateModel);
                    onEvent('cut', deferUpdateModel);
                } else if (utils.operaVersion < 11) {
                    // Opera 10 doesn't always fire the 'input' event for cut, 
                    // paste, undo & drop operations. We can try to catch some 
                    // of those using 'keydown'.
                    onEvent('keydown', deferUpdateModel);
                } else if (utils.firefoxVersion < 4.0) {
                    // Firefox <= 3.6 doesn't fire the 'input' event when text 
                    // is filled in through autocomplete
                    onEvent('DOMAutoComplete', updateModel);

                    // Firefox <=3.5 doesn't fire the 'input' event when text 
                    // is dropped into the input.
                    onEvent('dragdrop', updateModel);       // <3.5
                    onEvent('drop', updateModel);           // 3.5
                }
            }

            // Bind to the change event so that we can catch programmatic 
            // updates of the value that fire this event.
            onEvent('change', updateModel);
            // Bind to the blur event so that we can update the model when the 
            // input element lose focus 
            onEvent('blur', updateModel);

            // Provide 2-ways binding
            ko.computed(updateView, null, {disposeWhenNodeIsRemoved: element});
        }
    };

})();