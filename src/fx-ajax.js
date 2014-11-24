(function ($, fx) {
    if (!fx)
    {
        window.fx = {};
    }
    
    fx.ajax = {
        handleError : function(response) {
            if (response.ErrorType == fx.resources.enums.errorType.Business) {
                fx.msg.create({
                    msg: response.ErrorMessage
                });
            } else {
                fx.msg.create({
                    msg: fx.resources.msg.temporaryErrorMsg
                });
            }
        },
        get: function (options) {
            options = $.extend({
                type: 'GET',
                url: null,
                async: true,
                cache: false,
                dataType: 'json'
            }, options);

            $.ajax(options);
        },
        post: function (options) {
            ///	<summary>
            ///		Makes ajax request through POST.
            ///	</summary>
            ///	<param name="options" type="Function">ajax options</param>
            if (options.onSuccess)
            {
                options.success = options.onSuccess;
            }

            var defaults = {
                type: 'POST',
                url: null,
                async: true,
                cache: false,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: null,
                showProgressBar: true
            };



            options = $.extend(defaults, options);

            if (!$.isFunction(options.beforeSend)) {
                options.beforeSend = function () {
                    if (options.showProgressBar) {
                        fx.progressbar.show();
                    }
                };
            }

            if (!$.isFunction(options.complete)) {
                options.complete = function() {
                    if (options.showProgressBar) {
                        setTimeout(function() {
                            fx.progressbar.hide();
                        }, 300);
                    }
                };
            }


            options.data = JSON.stringify(options.data);

            $.ajax(options);
        }
    };
})(jQuery, fx);