function search(keyword, callback) {
    // A simplified search function
    // Use setTimeout to emulate Ajax request
    setTimeout(function() {
        callback(
            (keyword.toLowerCase().indexOf("hello") !== -1)? 
                'Are you searching "Hello World"?': 
                'No suggestion available. Please enter the whole keyword.'
        );
    }, 500);
}

var ViewModel = function() {
    var self = this;

    var geneateSubscribeCallback = function(parentEl) {
        var inputEl = parentEl.getElementsByTagName('input')[0];
        var resultEl = parentEl.getElementsByClassName('query-result')[0];
        var counterEl = parentEl.getElementsByClassName('counter-result')[0];
        var clearBtnEl = parentEl.getElementsByClassName('clear-btn')[0];
        var counter = 0;

        var refreshCounterUI = function() {
            // Display the search result
            counterEl.innerText = counter;
        }
        refreshCounterUI();

        clearBtnEl.addEventListener('click', function() {
            counter = 0;
            inputEl.value = '';
            resultEl.innerText = '';
            refreshCounterUI();
        });

        return function(value) {
            // increment the Ajax request counter
            counter++;
            refreshCounterUI();
            // Display the search result
            search(value, function(resultStr) {
                resultEl.innerText = resultStr;
            });
        }
    }

    this.queryImmediate = ko.observable('');
    this.queryImmediate.subscribe(geneateSubscribeCallback(
        document.getElementById('textInput')
    ));
    this.query300ms = ko.observable('');
    this.query300ms.subscribe(geneateSubscribeCallback(
        document.getElementById('textInputComplete-300ms')
    ));
    this.query1000ms = ko.observable('');
    this.query1000ms.subscribe(geneateSubscribeCallback(
        document.getElementById('textInputComplete-1000ms')
    ));
};
ko.applyBindings(new ViewModel());