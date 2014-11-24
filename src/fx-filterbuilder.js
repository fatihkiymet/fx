(function ($) {

    $.jFilter = {};
    var a = $.jFilter;

    a.nodeType = {
        AND: 1,
        OR: 2
    };

    a.operatorType = {
        Equals: 1,
        LessThan: 2,
        GreaterThan: 3,
        Between: 4,
        Contains: 5,
        StartsWith: 6,
        EndsWith: 7,
        LessThanOrEqual: 8,
        GreaterThanOrEqual: 9,
        NotEqual: 10
    };

    //Base Class
    a.Predicate = function (field, operator, startsWith, endsWith) {
        this.id = null;
        this.parent = null;
        this.nodeType = a.nodeType.AND;
        this.field = field;
        this.startsWith = startsWith;
        this.endsWith = endsWith;
        this.operator = operator;
        this.remove = function () {
            var obj = $('#' + this.id);
            obj.prev().remove();
            $(obj).animate({ opacity: 0 }, 200, function () {
                obj.remove();
                $('.filter-item:first').prev('.operator-wrapper').remove();
            });

        };
        this.onRemove = null;
        this.render = function (filtersContainer) {

            var filterItem = $('<div class="filter-item"><span></span></div>');
            filterItem[0].id = this.id;
            filterItem.find('span').text(this.toString());
            filterItem.appendTo(filtersContainer);

            filterItem.click(function(e){
                $('.' + this.class).removeClass('selected');
                $(this).addClass('selected');
            });

            var self = this;

            var removeButton = $('<span></span>').addClass("remove-button").click(function (e) {
                self.remove();
                if (self.onRemove) {
                    self.onRemove(self.id);
                }
            });

            $(removeButton).appendTo(filterItem);
        };
    };

    //Derived Class
    //Base Class is Predicate 
    a.Equals = function (field, value) {
        a.Predicate.call(this, field, a.operatorType.Equals, value);
    };

    a.Equals.prototype.toString = function () {
        if (this.field.type == 'Text') {
            return this.field.caption + " == " + " '" + this.startsWith + "' ";
        } else if (this.field.type == 'Dropdown') {
            var store = $.dataStore[this.field.storeID];
            var value = this.startsWith;
            var el = $.grep(store, function (item, i) { return item.value == value });
            if (el.length > 0) {
                return this.field.caption + " == " + el[0].text;
            }
        }
        return this.field.caption + " == " + this.startsWith;
    };

    a.GreaterThan = function (field, value) {
        a.Predicate.call(this, field, a.operatorType.GreaterThan, value);
    };

    a.GreaterThan.prototype.toString = function () {
        return this.field.caption + " > " + this.startsWith;
    };

    a.LessThan = function (field, value) {
        a.Predicate.call(this, field, a.operatorType.LessThan, value);
    };

    a.LessThan.prototype.toString = function () {
        return this.field.caption + " < " + this.startsWith;
    };

    a.Contains = function (field, value) {
        a.Predicate.call(this, field, a.operatorType.Contains, value);
    };

    a.Contains.prototype.toString = function () {
        return "{0} Contains('{1}')".replace('{0}', this.field.caption).replace('{1}', this.startsWith);
    };

    a.Between = function (field, startsWith, endsWith) {
        a.Predicate.call(this, field, a.operatorType.Between, startsWith, endsWith);
    };

    a.Between.prototype.toString = function () {
        if (this.field.type == 'Text') {
            return "{0} between '{1}' and '{2}'".replace('{0}', this.field.caption).replace('{1}', this.startsWith).replace('{2}', this.endsWith);
        }
        return "{0} between {1} and {2}".replace('{0}', this.field.caption).replace('{1}', this.startsWith).replace('{2}', this.endsWith);

    };

    $.getById = function (id) {
        return $(document.getElementById(id));
    };

    $.expression = new function (logicalOperator, leftOperand, rightOperand) {
        this.logicalOperator = logicalOperator;
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    };


    $.filterBuilder = {
        template: null,
        model: null,
        renderTo: null,
        applyCallback: function () {
        },
        clearCallback: function () {
        },
        clearFilters: function () {
            this.filters = [];
            $('.operator-wrapper').remove();
            $('.filter-item').remove();
        },
        getOperators: function (type) {
            var arr = [];
            $.each(this.filterFieldType[type], function (i, val) {
                arr.push(i);
            });
            return arr;
        },
        calendarOptions: {
            showOn: "button",
            buttonImage: '',
            buttonImageOnly: true
        },
        createEditor: function (type, name, context) {
            var obj;
            switch (type) {
                case 'Date':
                    obj = $(document.createElement('input')).attr({ name: name, type: 'text' })
                    $(context).append(obj);
                    $(obj).datepicker(this.calendarOptions);
                    break;
                case 'Text':
                case 'Int':
                    obj = $(document.createElement('input')).attr({ name: name, type: 'text' })
                    $(context).append(obj);
                    break;
                case 'Dropdown':
                    obj = $(document.createElement('select')).attr({ name: name });
                    $(context).append(obj);
                    break;
            }

            return obj;
        },
        createFilterSection: function () {
            var template = this.template;
            var model = this.model;
            var applyCallback = this.applyCallback;
            var clearCallback = this.clearCallback;

            var builder = this;
            var operatorOptions = $('select[name="operators"]', template)[0];
            var fieldsOptions = $('select[name="fields"]', template)[0];

            $(fieldsOptions).empty();
            $.each(model, function (i, val) {
                var opt = document.createElement('option');
                $(opt).attr({ value: val.name }).text(val.caption).appendTo(fieldsOptions);
            });

            var $section = $(template).clone();
            $section.removeClass('hidden');

            var id = 'FilterSection' + ($('.filter-section').not('#FilterTemplate').length + 1);
            $section.attr({ id: id });
            $section.appendTo($(this.renderTo));

            fieldsOptions = $('select[name="fields"]', $section)[0];
            operatorOptions = $('select[name="operators"]', $section)[0];
            editCell = $('td.e', $section)[0];

            $(fieldsOptions).change(function (e) {
                $(operatorOptions).empty();
                var f = $(this).val();
                var ops = builder.getOperators(model[f].type);
                $(operatorOptions).html('');
                $.each(ops, function (i, val) {
                    var opt = document.createElement('option');
                    $(operatorOptions).append($(opt).attr({ value: val }).text(val));
                });
                $(operatorOptions).hide().show(); //ie fix
                $(operatorOptions).change();
            });

            $(fieldsOptions).addClass($section.id);
            $(operatorOptions).addClass($section.id);
            $(editCell).addClass($section.id);

            $(operatorOptions).change(function (e) {

                editCell = $('td.e', $section)[0];
                $(editCell).empty();

                var f = $(fieldsOptions).val();
                var op = $(this).val();
                if (op == 'Equals') {
                    switch (model[f].type) {
                        case 'Text':
                        case 'Int':
                            builder.createEditor('Text', 'startsWith', editCell);
                            break;
                        case 'Dropdown':
                            var dropDown = builder.createEditor('Dropdown', 'startsWith', editCell);
                            var store = $.dataStore[model[f].storeID];
                            if (store && store.length > 0) {
                                $.each(store, function (i, val) {
                                    var opt = document.createElement('option');
                                    $(opt).attr({ value: val.value }).text(val.text);
                                    $(dropDown).append(opt);
                                });
                                $(dropDown).hide().show();
                            }
                            break;
                        case 'Date':
                            builder.createEditor('Date', 'startsWith', editCell);
                            break;
                    }
                }
                else if (op == 'Between') {
                    switch (model[f].type) {
                        case 'Int':
                            builder.createEditor('Int', 'startsWith', editCell);
                            builder.createEditor('Int', 'endsWith', editCell);
                            break;
                        case 'Date':
                            builder.createEditor('Date', 'startsWith', editCell);
                            builder.createEditor('Date', 'endsWith', editCell);
                            break;
                    }
                }
                else if (op == 'Contains') {
                    switch (model[f].type) {
                        case 'Text':
                        case 'Int':
                            builder.createEditor('Text', 'startsWith', editCell);
                            break;
                    }
                }
                else if (op == 'GreaterThan' || op == 'LessThan') {
                    switch (model[f].type) {
                        case 'Text':
                        case 'Int':
                            builder.createEditor('Int', 'startsWith', editCell);
                            break;
                    }
                }
            });

            $(fieldsOptions).change();

            var filtersContainer = $('<div class="clearfix"></div').addClass('filter-expression-wrapper').appendTo($section);

            var addFilter = function (logicalOperatorType) {
                var logicalOperator = "AND";
                if (logicalOperatorType === a.nodeType.OR) {
                    logicalOperator = "OR";
                }

                var field = $('[name="fields"]', $section).val();
                var operator = $('[name="operators"]', $section).val();
                var value = $('[name="startsWith"]').val();
                var value2 = $('[name="endsWith"]').val();

                if (!value) {
                    $('[name="startsWith"]').focus();
                    return;
                }

                if ($('.filter-item').length > 0) {
                    $('<div>AND</div>').addClass('operator-wrapper').addClass(logicalOperator).appendTo(filtersContainer).text(logicalOperator);
                }

                var predicate = builder.createPredicate(operator, model[field], value, value2);
                predicate.nodeType = logicalOperatorType;
                predicate.render(filtersContainer);
                predicate.operator = a.operatorType[operator];
                predicate.field = predicate.field.name;
                builder.addFilter(predicate);
            };

            $('a:first', $section).click(function (e) {
                addFilter($.jFilter.nodeType.AND);
            });

            $('a:eq(1)', $section).click(function (e) {
                addFilter($.jFilter.nodeType.OR);
            });

            $('.Clear', $section).click(function (e) {
                builder.clearFilters();

                $('[name="startsWith"]').val('');
                $('[name="endsWith"]').val('');

                clearCallback(e);
            });

            $('.Apply', $section).click(function (e) {
                applyCallback(e);
            });

            return $section;
        },
        build: function (field) {

        },
        filterFieldType:
        {
            Int: {
                Equals: function () {
                    var obj = document.createElement('input')
                    var id = 'startsWith';
                    $(obj).attr({ id: id, name: id, type: 'text' });
                    return obj;
                },
                GreaterThan: function () {
                    return this.equal();
                },
                LessThan: function () {
                    return this.equal();
                },
                Between: function () {

                    var arr = this.equal();

                    var obj = document.createElement('input')
                    var id = 'endsWith';
                    $(obj).attr({ id: id, name: id, type: 'text' });

                    arr.push(obj);

                    return arr;
                }
            },
            Text: {
                Equals: function () {
                    var obj = document.createElement('input')
                    var id = 'startsWith';
                    $(obj).attr({ id: id, name: id, type: 'text' });
                    return obj;
                },
                Contains: function () {
                    return this.equal();
                }
            },
            Dropdown: {
                Equals: function () {
                    var obj = document.createElement('select')
                    var id = 'startsWith';
                    $(obj).attr({ id: id, name: id });
                    return obj;
                }
            },
            Date: {
                Equals: function () {
                    var obj = document.createElement('select')
                    var id = 'startsWith';
                    $(obj).attr({ id: id, name: id });
                    return obj;
                },
                Between: function () {

                    var obj = document.createElement('input')
                    var id = 'endsWith';
                    $(obj).attr({ id: id, name: id, type: 'text' });

                    arr.push(obj);

                    return arr;
                }
            }
        },
        newID: function () {
            var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 8;
            var randomstring = '';
            for (var i = 0; i < string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
            }
            return randomstring;
        },
        filters: [],
        createPredicate: function (type, field, startsWith, endsWith) {

            var filter = new $.jFilter[type](field, startsWith, endsWith);
            filter.id = this.newID();
            filter.operator = type;
            var self = this;
            filter.onRemove = function (id) {
                self.removeFilter(id);
                if ($('.filter-item').length == 1) { $('.operator-wrapper').remove(); }
                $('.Apply').click();
            };

            return filter;
        },
        addFilter: function (predicate) {
            this.filters.push(predicate);
        },
        getChildren: function (id) {
            return $.grep(this.filters, function (el, i) { return el.parent == id });
        },
        get: function (id) {
            return $.grep(this.filters, function (el, i) { return el.id == id });
        },
        removeFilter: function (id) {
            this.filters = $.grep(this.filters, function (el, i) { return el.parent != id && el.id != id });
        }
    };

})(jQuery);