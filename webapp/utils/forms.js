define(function(require) {
    var _ = require("underscore");

    return {
        serializeForm: function($form) {
            var data = $form.serializeArray();
            return _(data).chain().map(function(d) {
                return [d.name, d.value];
            })
            .object().value();
        }
    } 
});