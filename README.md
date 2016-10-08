# Knockout.js textInputComplete custom binding
The textInputComplete binding keeps tracks of changes in a text input (`<input>` and `<textarea>`) and update the viewmodel observable only when user stops typing. It is useful when the the changes of input will trigger a series of resource-consuming actions like Ajax request in a search bar. It is compatible with all modern browsers and Internet Explorer 8 or above. Take a look at the [Demo Page](https://yuhlau.github.io/knockout-textInputComplete) to better understand what it is.
  
## Index
* [The Problem](#the-problem)
* [Features](#features)
* [Installation](#installation)
* [Examples](#examples)
* [Browser Support](#browser-support)
* [Dependency](#dependency)
* [History](#history)
* [License](#license)

## The problem
The majore difference between `textInputComplete` and the build-in `textInput` binding is that the latter update the observable immediately when changes occur. In some situations, instant update may no be a good idea. For example the input field of a search bar, firing Ajax request for every single letter inputted is just a waste of server resrouce, especially when the query is just a simple keyword.

## Features
* Keep tracks of changes from typing, copy-and-paste, drag-and-drop, cut all
* Adjustable inactive delay before updating observable (Default 300 millisecond)
* Immediate update to observable when input lose focus
* Cross-Browser Compatibility (Support most of the modern browsers)

## Installation
1. Make sure you include Knockout.js library in your HTML
2. Extract `knockout.textInputComplete.js` to your site directory  
3. add the following code inside the ```<head>``` section of the webpage.  
``` html
<script src="knockout.textInputComplete.js" />
```

## Examples
There is no better way to explain how it works by giving examples, and [Demo Page](https://yuhlau.github.io/knockout-textInputComplete)
### 1. Bind `textInputComplete` to a text box `<input>`
``` html
<input type="text" data-bind="textInputComplete: query" />

<script>
var ViewModel = function() {
    this.query = ko.observable("");
    this.query.subscribe(function(value) {
        // process the value, fire the Ajax, etc.
    }
}
ko.applyBindings(new ViewModel());
</script>
```

### 2. Customize Inactive Delay time
`textInputComplete` detects completion of input by checking the inactive time of the input element. The observable is updated only when there is no new changes to the input element for an adjustable delay time. The default delay time is 300 milliseconds but you can customize it for every input element.
``` html
<!-- textInputCompleteDelay is measured in millisecond -->
<input type="text" data-bind="textInputComplete: query, textInputCompleteDelay: 500" />
```

### 3. Setting a Global Inactive Delay time
Although each input element can have a customized inactive delay time. Sometimes it is much more conveient to simply set a global delay time and apply to all input elements.
``` html
<script>
// Setting a global delay time of 500 milliseconds
ko.bindingHandlers['textInputComplete']['delay'] = 500;
</script>

<input type="text" data-bind="textInputComplete: query" />
```

## Browser Support
* Google Chrome (latest)
* Mozilla Firefox (latest)
* Apple Safari (latest)
* Microsoft Edge (latest)
* Internet Explorer (8+)
* Opera (latest)
* Android Browser (latest)
* Google Chrome on Android (latest)
* Apple Safari on iOS (latest)
* Google Chrome on iOS (latest)

## Dependency
* Knockout.js 3.0.0 or above

## History
* 8 Oct, 2016. Version 1.0.0
  * Initial Commit

## Credit
This project is base on the `textInput` binding implementation. All credits to the Knockout.js developers for developing an impressive framework.
  
## License
Copyright (c) Yu H.  
Published under The MIT License (MIT)
