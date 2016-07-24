/**
 * Mock the essential parts of socket.io by
 * returning a mock socket on io.connect().
 */

var SocketMock = function(){
    var handlers = {};

    this.on = jasmine.createSpy("on")
        .and.callFake(function (eventName, handler) {
            // Store references to all callback functions:
            handlers[eventName] = handlers[eventName] || [];
            handlers[eventName].push(handler);
        });

    /**
     *  Helper to call all stored references to handlers for an event
     */
    this.callHandler = function (eventName, arg) {
        handlers[eventName].forEach(function (handler) {
            handler(arg);
        });
    };

    this.emit = jasmine.createSpy("emit");
};

module.exports = SocketMock;
