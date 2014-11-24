(function ($, fx) {
    if (!fx) {
        fx = {};
    }

    if (!fx.msg) {
        fx.msg = {};
    }

    var defaults = {
        type: "info",
        height: "auto",
        minHeight: "auto",
        dialogClass: "fx-info-dialog"
    }
   
    fx.msg = {
        create: function (options) {
            options.content = $("<div id='{0}'><span></span></div>".replace('{0}', fx.newId()));
            options.content.find('span').text(options.msg);

            if (fx.dialog) {
                
                options = $.extend(true, defaults, options)

                if (options.type == "error")
                {
                    options.dialogClass = "fx-error-dialog";
                    options.title = fx.resources.msg.errorTitle
                }
                if (options.type == "warning")
                {
                    options.title = fx.resources.msg.errorTitle
                }
                else
                {
                }

                var $dialog = fx.dialog.create(options);
                $dialog.dialog('open');
            }
        }
    }

})(jQuery, fx);
