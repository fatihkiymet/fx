(function ($, fx) {

    if (!fx) {
        window.fx = {};
    }

    if (!fx.form) {
        fx.form = {};
    }

    var common = {
        dateFormat: "dd.mm.yy",
        thousandSeperator: ".",
        decimalSeperator: ","
    }

    fx.forms = [];
    //var simpleValTypes = ['int', 'string', 'dropdown', 'date', 'parity'];

    var defaults = {
        formId: 'jForm',
        detailUrl: null,
        saveUrl: null,
        onClearForm: null,
        onLoad: null,
        renderTo: 'body',
        onSuccess: false,
        onCompleted: false
    };

    fx.form.create = function (options) {

        options = $.extend(defaults, options);

        var el = document.getElementById(options.formId);
        if (el) { $(el).remove(); }
        var editForm = document.createElement('form');
        $(editForm).attr({
            id: options.formId,
            method: 'POST',
            action: options.saveUrl
        });
        $(options.renderTo).append(editForm);

        editForm.loadDetails = function (id) {
            fx.ajax.post({
                url: options.detailUrl + '/' + id,
                success: function (response) {
                    if (!response.IsSuccess) {
                        fx.ajax.handleError(response);
                    }

                    /*$.each(response.Value, function (i, val) {
                        var element = document.getElementsByName(i);

                        if (options.model[i].type == 'date') {
                            var d = parseSerializedJsonDate(val);
                            $(element).val($.datepicker.formatDate(common.dateFormat, d));
                        }
                        else {
                            $(element).val(val);
                        }
                    });*/

                    $.each(options.model, function (i, val) {
                        var el = editForm[val.name];                       

                        if (val.setter) {
                            val.setter(el, response.Value[val.name]);
                        }
                        else {
                            if (val.type == "radio") {
                                $(el).each(
                                    function (i, opts) {
                                        if (JSON.stringify(response.Value[val.name]) === $(this).val()) {
                                            $(this).attr("checked", "checked");
                                        }
                                    }
                                );
                            }
                            else if (val.type) {
                                $(el).val(response.Value[val.name] || '');
                            }
                        }
                    });

                    if (options.onLoad) {
                        options.onLoad(response.Value);
                    }
                }
            });
        };

        editForm.clearForm = function () {
            $.each(options.model, function (i, val) {
                var element = document.getElementById(val.name);
                $(element).val('');
            });

            if (options.onClearForm) {
                options.onClearForm();
            }
        };

        var table = document.createElement('table');

        var validator = {
            rules: {
            },
            messages: {
            },
            errorPlacement: function ($label, $el) {
                $el.parent().next().empty().append($label);
                if ($.fn.qtip) {
                    $label.find("span").qtip();
                }
            },
            addRule: function (field) {

                if (field.isPrimary) {
                    return;
                }

                this.rules[field.name] = {
                    required: field.required,
                    number: field.type === 'int',
                    date: field.type === 'date',
                    parity: field.type === 'parity'
                };

                if (field.regex) {
                    this.rules[field.name].regex = field.regex;
                }

                if (field.type == 'string' && field.maxLength) {
                    this.rules[field.name].maxlength = field.maxLength;
                }

            }
        };

        $.each(options.model, function (i, val) {
            var input = null;

            //add hidden for primary field
            if (val.isPrimary || val.hidden) {
                input = $('<input/>').attr({
                    name: val.name,
                    id: val.name,
                    type: 'hidden'
                });
                $(editForm).append(input);
                if (typeof val.defaultValue !== 'undefined') {
                    $(input).val(val.defaultValue);
                }
                return;
            }

            //create row
            var tr = document.createElement('tr');
            var tdl = $('<td class="l"><\/td>');
            var tde = $('<td class="e"><\/td>');
            var tdv = $('<td class="v"><\/td>');

            var $tr = $(tr).append(tdl).append(tde).append(tdv);
            $tr.addClass('row');

            //creates 
            var label = $('<label for="{name}">{caption}</label>'.replace('{name}', val.name).replace('{caption}', val.caption));
            
            input = fx.formFieldFactory(val);

            if (val.required) { $(input).addClass('required'); }
            if (val.type == "int" || val.number) { $(input).addClass('number'); }

            if (label) { $(tdl).append(label); }
            if (input) { $(tde).append(input); }

            if (val.onRendered) {
                val.onRendered(input);
            }

            $(table).append(tr).addClass('form-layout');

            validator.addRule(val);
        });

        $(editForm).append(table);
        $(editForm).validate(validator);

        $(editForm).submit(function () {
            $(editForm).ajaxSubmit({
                dataType: options.dataType || "json",
                beforeSubmit: function () {
                    if (!$(editForm).valid()) {
                        return false;
                    }
                    fx.progressbar.show();                    
                },
                success: function (response) {
                    if (response.IsSuccess) {
                        if (options.onSuccess) {
                            options.onSuccess(response);
                        }
                    } else {
                        fx.ajax.handleError(response);
                    }

                },
                error: function (msg) {
                    alert(msg);
                },
                complete: function () {
                    if (options.onCompleted) {
                        options.onCompleted();
                    }
                    fx.progressbar.hide();
                }
            });
            return false;
        });

        fx.forms.push(editForm);

        return editForm;
    };
})(jQuery, fx);

/*
Image: {
        type: 'image-upload',
        caption: 'Görsel',
        name : 'image',
        url: '@Url.Action("Index", "AsyncUpload")',
        noImagePath: fx.resources.noImagePath,
        temporaryPath : '/Content/UploadImages/Analysis/temporary/'
}*/