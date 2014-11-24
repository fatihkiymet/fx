/// <reference path="jQueryExtention/fk.ajax.js" />
(function ($, fx) {

    if (!fx.dxCustomDataSource) { fx.dxCustomDataSource = {}; }
    if (!fx.dataSource) { fx.dataSource = {}; }

    fx.dxCustomDataSource = {
        create: function (options) {            

            var defaults = {
                sort: [{ selector: "Id", desc: true }],
                filter : []
            }

            options = $.extend(true, defaults, options);

            var ds = {
                total : 0,
                key: ["Id"]
            };

            ds.totalCount = function() {
                return ds.total;
            };

            ds.load = function(loadOptions) {
                var self = ds;
                var d = new $.Deferred();
                var filterOptions = loadOptions.filter ? loadOptions.filter : options.filter; // Getting filter options
                var sortOptions = loadOptions.sort ? loadOptions.sort : options.sort; // Getting sort options
                var groupOptions = loadOptions.group ? loadOptions.group : ""; // Getting group options

                fx.ajax.post({
                    url: options.url,
                    showProgressBar: false,
                    data: {
                        PageIndex: loadOptions.pageIndex + 1,
                        PageSize: loadOptions.take,
                        SortExpression: sortOptions,
                        FilterExpression: filterOptions
                    },
                    success: function(result) {
                        self.total = result.Total;
                        if (options.onSuccess) {
                            options.onSuccess.apply(self, [result.Rows]);
                        }

                        d.resolve(result.Rows);
                    }
                });

                return d.promise();
            };

            return ds;
        }
    }


    fx.dataSource = function (options) {

        var defaults = {
            pageIndex: 1,
            pageSize: 25,
            filterList: [],
            sortList: [],
            data: {},
            onDataBound: function () {
            },
            onError: function (msg) {
                if (window.console) window.console.log(msg);
            }
        };

        options = $.extend(defaults, options);

        this.url = options.url;
        this.pageIndex = options.pageIndex || defaults.pageIndex;
        this.pageSize = options.pageSize || defaults.pageSize;
        this.sortList = options.sortList || defaults.sortList;
        this.filterList = options.filterList || defaults.filterList;
        this.onDataBound = options.onDataBound;
        this.onError = options.onError;

        var self = this;

        this.load = function () {

            $.fk.ajax.post({
                url: self.url,
                data: {
                    pageIndex: self.pageIndex,
                    pageSize: self.pageSize,
                    sortList: self.sortList,
                    filterList: self.filterList
                },
                success: function (response) {
                    if (!response) {
                        alert("response is undefined");
                    }

                    if (response.IsSuccess && response.Value) {
                        self.data = response.Value;
                        if (self.onDataBound) {
                            self.onDataBound(response.Value);
                        }
                    }
                    else {
                        self.onError(response.ErrorMessage);
                    }
                },
                error: function (a, b, c) {
                    alert(a);
                }
            });
        };
    };


})(jQuery, fx);