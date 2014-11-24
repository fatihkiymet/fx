(function(fx, $) {

    var template = {
        text: '<input type="text" name="{0}" id="{1}" class="{2}"/>',
        textArea: '<textarea id="{0}" name="{1}" class="{2}"></textarea>',
        select : '<select id="{0}" name="{1}" class="{2}"/>',
		imageUpload : '<input type="file" name="{0}" id="{1}" class="{2}"/>'
    }

    var pleaseSelectText = 'Lütfen seçiniz.';

    fx.FormField = function (options) {
        this.id = options.name;
        this.name = options.name;
        this.element = $(options.template.format(this.id, this.name, options.cssClass || 'text-element'));
        this.render = function (renderTo) {
            this.element.appendTo(renderTo);
        }
    }

    fx.TextField = function (options) {
        var self = this;
        options.template = template.text;        
        fx.FormField.call(this, options);

        options.maxlength = options.maxlength || 150;
        this.element.attr({ maxlength: self.maxlength });
    };

    fx.NumericField = function (options) {
        var self = this;
        options.cssClass = options.cssClass || 'numeric-element';
        fx.TextField.call(this, options);
        this.element.attr('number');
    };

    fx.DateField = function (options) {
        var self = this;
        options.cssClass = options.cssClass || 'date-element';
        fx.TextField.call(this, options);
    };

    fx.TextAreaField = function(options) {
        var self = this;
        options.template = template.textArea;
        fx.FormField.call(this, options);
        options.maxlength = options.maxlength || 10000;
        this.element.attr({ maxlength: options.maxlength });
    };

    fx.DropdownField = function (options) {
        var self = this;
        options.cssClass = options.cssClass || 'dropdown-element';
        fx.FormField.call(this, options);

        this.render = function (renderTo) {
            var sb = [];

            if (options.hasPleaseSelectText) {
                sb.push('<option value="{0}">{1}</option>'.format('', options.pleaseSelectText || pleaseSelectText));
            }

            if (options.items && options.items.length > 0) {
                for (var j = 0; j < options.items.length; j++) {
                    sb.push('<option value="{0}">{1}</option>'.replace('{1}', options.items[j].Text).replace('{0}', options.items[j].Value));
                }
            }

            this.element.html(sb.join('')).appendTo(renderTo);
        }
    }
	
	fx.ImageUpload = function(options){
		var self = this;		
		
		var defaults = {
			name  = 'image-upload',
			width = 300,
			height = 175,
			noImagePath = '',
			temporaryPath = ''
		}
		
		options = $.extend(defaults, options, true)
		
		this.render = function(renderTo){		
			var wrapper = $('<div></div>');
			var fileInput = document.createElement('input');
			$(fileInput).css('display', 'none').attr({ type: 'file', name: options.name + "_file", id: options.name + "_file", disable: 'disabled' });
			wrapper.append(fileInput);
			var addButton = document.createElement('a');
			$(addButton).click(function (e) { e.preventDefault();
				fileInput.click();
			}).addClass('btn-add-image').text(fx.resources.btn.addImage).appendTo(wrapper);
						
			self.element = $('<a id="LnkFileWrapper"><img src="{0}" width="{1}" height="{2}" alt="no image"></a>'.replace('{0}', options.noImagePath).replace("{1}", options.width || 150).replace("{2}", options.height || 150));
			self.element.append(wrapper);
			
			$(fileInput).fileupload({
				url: val.url,
				dataType: 'json',
				done: function (e, data) {
					var info = data.result.Data;
					var thumpPath = options.temporaryPath + info.thumb;
					input.find('img').attr({ src: thumpPath });
					$('<input type="hidden" id="{0}" name="{1}" value="{2}"/>'.format(options.name, options.name, info.baseFileName)).appendTo(renderTo);
				}
			});
		
			self.element.appendTo(renderTo);
		}
	}
	
	fx.FreeHtmlEditor = function(options)
	{
		fx.FormField.call(this, options);
	}

    fx.formFieldFactory = function (options) {
        var constructor = fx.TextField;
        if (options.type == 'date') {
            constructor = fx.DateField;
        }
        else if (options.type == 'number')
        {
            constructor = fx.NumberField;
        }
        else if (options.type == 'textarea') {
            constructor = fx.TextAreaField;
        }
        else if (options.type == 'imageupload') {
            constructor = fx.ImageUpload;
        }
		else if (options.type == 'freehtmleditor')
		{
			constructor = fx.FreeHtmlEditor;
		}

        return new constructor(options).element;
    }

}(fx, jQuery));