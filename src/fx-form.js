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
            
            if (val.type == 'string') {
                input = fx.formFieldFactory(val);
            } else if (val.type == 'parity') {
                input = $('<input id="{name}" name="{name}" maxlength="{maxLength}" type="text" class="text-element"/>'.replace('{name}', val.name).replace('{name}', val.name).replace('{maxLength}', val.maxLength));

                if (val.type == 'parity') {
                    input.addClass('parity-element');
                }
            } else if (val.type == 'textarea') {
                $tr.addClass('textarea-row');
                input = fx.formFieldFactory(val);
            } else if (val.type == 'int') {
                input = $('<input id="{name}" name="{name}" maxlength="{maxLength}" type="text" class="text-element int"/>'.replace('{name}', val.name).replace('{name}', val.name).replace('{maxLength}', 10));
            } else if (val.type == 'radio') {
                input = $('<div class="radio-wrapper"></div>');
                $(val.items).each(function(i, opts) {
                    $('<span></span>').text(opts.Text).appendTo(input);
                    $('<input id="{name}" name="{name}" type="radio" class="radio-element"/>'.replace('{name}', val.name + i).replace('{name}', val.name)).val(opts.Value).attr('checked', !!opts.Selected).appendTo(input);
                });
            } else if (val.type == 'dropdown') {
                input = $('<select id="{id}" name="{name}" class="dropdown-element"/>'.replace('{id}', val.name).replace('{name}', val.name));
                var sb = [];
                if (val.hasPleaseSelect) {
                    sb.push('<option value="{0}">{1}</option>'.replace('{1}', val.hasPleaseSelectText || 'Lütfen seçiniz.').replace('{0}', ''));
                }

                if (val.items && val.items.length > 0) {

                    for (var j = 0; j < val.items.length; j++) {
                        sb.push('<option value="{0}">{1}</option>'.replace('{1}', val.items[j].Text).replace('{0}', val.items[j].Value));
                    }
                    input.html(sb.join(''));
                }
            } else if (val.type == 'date') {
                input = $('<input id="{id}" name="{name}" type="text" class="date-element"/>'.replace('{id}', val.name).replace('{name}', val.name));
            } else if (val.type == 'image-upload') {
                input = $('<a id="LnkFileWrapper"><img src="{0}" width="{1}" height="{2}" alt="no image"></a>'.replace('{0}', val.noImagePath).replace("{1}", val.width || 150).replace("{2}", val.height || 150));
                var wrapper = $('<div></div>');
                var fileInput = document.createElement('input');
                $(fileInput).css('display', 'none').attr({ type: 'file', name: val.name + "_file", id: val.name + "_file", disable: 'disabled' });
                wrapper.append(fileInput);
                var addButton = document.createElement('a');
                $(addButton).click(function(e) {
                    e.preventDefault();
                    fileInput.click();
                }).addClass('btn-add-image').text(fx.resources.btn.addImage).appendTo(wrapper);
                input.append(wrapper);

                $(fileInput).fileupload({
                    url: val.url,
                    dataType: 'json',
                    done: function(e, data) {
                        var info = data.result.Data;
                        var thumpPath = val.temporaryPath + info.thumb;
                        input.find('img').attr({ src: thumpPath });
                        $('<input type="hidden" id="{0}" name="{1}" value="{2}"/>'.format(val.name, val.name, info.baseFileName)).appendTo(editForm);
                    }
                });
            } else if (val.type === 'custom') {
                input = null;
                if (val.renderer) {
                    input = val.renderer();
                } else {
                    throw ("custom type should have render method");
                }
            }

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

        $(function () {
            $.validator.addMethod(
                "date",
                function (value, element) {
                    var b = true;
                    try {
                        $.datepicker.parseDate(common.dateFormat, value);
                    }
                    catch (err) {
                        b = false;
                    }

                    return b;
                },
                "<span title='Lütfen geçerli bir tarih giriniz.'></span>", "Lütfen yanda belirtilen formatta giriniz: " + common.dateFormat
            );

            $(".date-element").datepicker({
                dateFormat: common.dateFormat
            });

            $.validator.addMethod(
                "parity",
                function (value, element) {
                    var isFloat = new RegExp(/^\d+(\,\d{1,4})?$/i).test(value);

                    return isFloat;
                },
                "<span title='{0}'></span>".replace('{0}', "Lütfen 0,0000 formatında parite giriniz.")
            );
        });

        fx.forms.push(editForm);

        return editForm;
    };
})(jQuery, fx);


$.extend($.validator.messages, {
    required: "<span title='Bu alan zorunludur.'></span>",
    remote: "Lütfen bu alanı düzeltiniz.",
    email: "<span title='Lütfen geçerli bir mail adresi giriniz.'></span>",
    url: "<span title='{0}'></span>".replace('{0}', "Geçerli bir URL giriniz."),
    date: "<span title='Lütfen geçerli bir tarih giriniz.'></span>",
    dateISO: "<span title='Lütfen geçerli bir tarih giriniz (ISO).'></span>",
    number: "<span title='{0}'></span>".replace('{0}', "Lütfen geçerli bir sayı giriniz."),
    digits: "<span title='Lütfen geçerli bir değer giriniz.'></span>",
    creditcard: "<span title='{0}'></span>".replace('{0}', "Lütfen geçerli bir kredi kartı numarası giriniz."),
    equalTo: "<span title='{0}'></span>".replace('{0}', "Lütfen aynı değeri giriniz."),
    accept: "<span title='{0}'></span>".replace('{0}', "Lütfen geçerli bir uzantı giriniz."),
    maxlength: "<span title='{0}'></span>".replace('{0}', jQuery.validator.format("Girdiğiniz değer {0} karakterden fazla olamaz.")),
    minlength: "<span title='{0}'></span>".replace('{0}', jQuery.validator.format("Lütfen en az {0} karakter giriniz.")),
    rangelength: "<span title='{0}'></span>".replace('{0}', jQuery.validator.format("Girdiğiniz değer {0} ve {1} karakter uzunlugu arasında olmalıdır.")),
    range: "<span title='{0}'></span>".replace('{0}', jQuery.validator.format("Lütfen {0} ve {1} arasında bir değer giriniz.")),
    max: "<span title='{0}'></span>".replace('{0}', jQuery.validator.format("Girdiğiniz değer {0} den küçük veya eşit olmalıdır.")),
    min: "<span title='{0}'></span>".replace('{0}', jQuery.validator.format("Girdiğiniz değer {0} den büyük ya da eşit olmalıdır.")),
    regex : "<span title='Lütfen geçerli bir formatta değer giriniz.'></span>"
});


/*
Image: {
        type: 'image-upload',
        caption: 'Görsel',
        name : 'image',
        url: '@Url.Action("Index", "AsyncUpload")',
        noImagePath: fx.resources.noImagePath,
        temporaryPath : '/Content/UploadImages/Analysis/temporary/'
}*/