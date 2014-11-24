(function ($, fx) {
    if (!fx)
    {
        fx = {};
    }

    if (!fx.dialog)
    {
        fx.dialog = {};
    }


    var defaults = {
        dialogClass: 'fx-simple-dialog',
        content : null,
        modal: true,
        autoOpen: false,
        showTitle: false,
        resizable: false,
        width: 'auto',
        height : 'auto',
        buttons: [],
        open: function () {
            fx.scroll.enable();
        },
        close: function () {
            fx.scroll.disable();
        }
    };

    fx.dialog = {

        create: function (options) {

            options = $.extend({}, defaults, options);           

            $element = null;

            if (options.content) {
                $element = $(options.content);
            }
            else {
                $element = $('<div id="{0}"></div>'.replace('{0}', fx.newId()));
            }            

            var dialog = $element.dialog(options);

            return dialog;
        }
    };
})(jQuery, fx);
