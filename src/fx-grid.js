(function (fx) {
    
    if (!fx) {
        fx = {};
    }

    var customPagingTemplate =  '<div class="filetering_div paging-panel">'+
                '<div class="page_list_select">'+
                '<span>{0}: </span>'.format(fx.resources.grid.pagingCountLabel)+
                    '<select>'+
                     '<option value="5">5</option>'+
                     '<option value="10">10</option>' +
                     '<option value="50">50</option>' +
                     '<option value="100">100</option>' +
                    '</select>' +
                '</div>' +
            '<div class="right_side_buttons">' +
                '<a href="javascript:void()" class="first_page">İlk</a>' + 
                '<a href="javascript:void()" class="previous_page">Önceki</a>' +
                '<a href="javascript:void()" class="page_number">1</a>'+ 
                '<a href="javascript:void()" class="next_page" >Sonraki</a>' +
                '<a href="javascript:void()" class="last_page">Son</a>' +
            '</div>' +
        '</div>';

    if (!fx.grid)
    {
        fx.grid = {
            create: function (options) {

                var defaults = {
                    renderTo : '',
                    selection: {
                        mode: 'single'
                    },
                    noDataText: fx.resources.grid.noDataText,
                    paging: {
                        pageIndex: 0,
                        pageSize: 10,
                        enabled: true
                    },
                    sorting:{mode:'single'},
                    pager: {
                        showPageSizeSelector: true,
                        allowedPageSizes: [5, 10, 20]
                    },
                    //loadPanel : { enabled : true },
                    customPaging: {
                        enabled: false,
                        renderTo: '',
                        defaultPageSize : 5
                    },
                    rowClick: function (e) {
                        var component = e.component,
                       prevClickTime = component.lastClickTime;
                        component.lastClickTime = new Date();
                        if (prevClickTime && (component.lastClickTime - prevClickTime < 300)) {
                            if (options.onDoubleClick) {
                                options.onDoubleClick(e);
                            }
                        }
                        else {
                            if (options.onSingleClick)
                            {
                                options.onSingleClick(e);
                            }
                        }
                    },
                    rowAlternationEnabled: true,
                    height: 450
                }
                
                options = $.extend(true, defaults, options);
                
                if (!options.renderTo || options.renderTo.length == 0) {
                    alert('renderTo has not been specified');
                    return;
                }

                var $renderTo = $(options.renderTo)
                if ($renderTo.length == 0) {
                    alert('renderTo could not be found in the dom');
                    return;
                }

                if (options.columns.length == 0)
                {
                    alert('at least one column must be specified');
                    return;
                }
                
                var instance = $renderTo.dxDataGrid(options).dxDataGrid('instance');

                if (options.customPaging && options.customPaging.enabled)
                {
                    $(options.customPaging.renderTo).empty().append($(customPagingTemplate));
                    instance.customPaging = options.customPaging;                    

                    instance.activatePagingButtons = function (currentPageIndex) {                        
                        
                        var firstpageIndex = 0;
                        var lastpageIndex = Math.ceil(instance.total / instance.pageSize()) - 1;
                        
                        var $btnContainer = $('.right_side_buttons');
                        $btnContainer.find('a').removeClass("passive_btn");

                        if (firstpageIndex == lastpageIndex) 
                        {
                            $btnContainer.find('.last_page').addClass("passive_btn");
                            $btnContainer.find('.next_page').addClass("passive_btn");
                            $btnContainer.find('.first_page').addClass("passive_btn");
                            $btnContainer.find('.previous_page').addClass("passive_btn");
                        }
                        else if (currentPageIndex == lastpageIndex) {
                            $btnContainer.find('.last_page').addClass("passive_btn");
                            $btnContainer.find('.next_page').addClass("passive_btn");
                        }
                        else if (currentPageIndex == firstpageIndex) {
                            $btnContainer.find('.first_page').addClass("passive_btn");
                            $btnContainer.find('.previous_page').addClass("passive_btn");
                        }
                    }

                    //var obsrv = new fx.Observer(instance.pageIndex, instance.activatePagingButtons);
                    //obsrv.oldValue = -1;                    
                    //obsrv.observe();                                     

                    //paging buttons
                    var $currentPageElement = $('.right_side_buttons .page_number', options.customPaging.renderTo).text(instance.pageIndex() + 1);                    
                    $('.right_side_buttons a', options.customPaging.renderTo).on("click", function (e) {
                        
                        e.preventDefault();
                        var firstpageIndex = 0;
                        var lastpageIndex = Math.ceil(instance.totalCount() / instance.pageSize())  - 1;
                        var currentPageIndex = instance.pageIndex();
                        
                        $el = $(this);
                        if ($el.hasClass('first_page'))
                        {                            
                            instance.pageIndex(firstpageIndex);
                        }
                        else if ($el.hasClass('next_page')) {
                            if (lastpageIndex > currentPageIndex) {
                                instance.pageIndex(currentPageIndex + 1);
                            }
                        }
                        else if ($el.hasClass('previous_page')) {
                            if (firstpageIndex < currentPageIndex) {
                                instance.pageIndex(currentPageIndex - 1);
                            }
                        }
                        else if ($el.hasClass('last_page')) {
                            instance.pageIndex(lastpageIndex);
                        }

                        $currentPageElement.text(instance.pageIndex() + 1);


                        $el = null;
                    });
                   
                    instance.option('paging', {
                        pageIndex: 0,
                        pageSize: options.customPaging.defaultPageSize
                    });

                    //page sizing box
                    $('select', options.customPaging.renderTo).val(options.customPaging.defaultPageSize).change(function (e) {
                        instance.pageSize($(this).val());
                        $currentPageElement.text(instance.pageIndex() + 1);
                        instance.activatePagingButtons(instance.pageIndex());
                    });
                }

                return instance;       
            },
            authorizedColumn: {
                create: function (options) {
                    var defaults = {
                        alignment: 'center',
                        allowFiltering: false,
                        allowSorting: false
                    }                    

                    var defaultRenderer = options.cellTemplate;

                    var renderUnauthorizedCell = function (container, params) {                        
                        if (fx.resources.user.role == fx.resources.enums.roleType.None) {
                            options = $.extend(true, options, defaults);
                            container.addClass("restricted-area");
                            $('<a />').text('Kayıt Ol').addClass("signup_table_btn").on('click', function (e) {
                                $(".LiveHelpWrap, .login_popup").fadeIn(400);
                                $("#inline3").css("display", "block");
                            }).appendTo(container);
                        }
                        else if (fx.resources.user.role == fx.resources.enums.roleType.Under2000) {
                            options = $.extend(true, options, defaults);
                            container.addClass("restricted-area");
                            $('<span  />').text('Yetersiz Teminat').attr('title', 'Bu alanı görüntüleyebilmek için minimum 2000$ teminat miktarı gereklidir.').appendTo(container);
                        } else {
                            if (defaultRenderer) {
                                defaultRenderer(container, params);
                            } else {
                                container.text(params.value);
                            };
                        }
                    }

                    options.cellTemplate = renderUnauthorizedCell;
                    
                    return options;
                }
            },
            deleteColumn: { 
                create: function (options) {
                    return {
                        caption: 'İşlem',
                        dataField: 'Id',
                        width: 120,
                        alignment: 'center',
                        allowFiltering: false,
                        allowSorting: false,
                        cellTemplate: function (container, params) {
                            $('<a />').text('sil').addClass("delete-icon").on('click', function (e) {
                                if (confirm(fx.resources.msg.confirm)) {
                                    fx.ajax.post({
                                        url: options.url + '/' + params.value,
                                        showProgressBar : false,
                                        success: function (response) {
                                            if (response.IsSuccess) {
                                                if (options.onSuccess) {
                                                    options.onSuccess(response.Data);
                                                }
                                            }
                                            else {
                                                fx.ajax.handleError(response);
                                            }
                                        }
                                    });
                                }
                            }).appendTo(container);
                            
                            $('<a />').text('düzenle').addClass("edit-icon").on('click', function (e) {
                                container.parents('.dx-data-row').click();
                                container.parents('.dx-data-row').click();
                            }).appendTo(container);
                        }
                    }
                }
            }
        };
    }

})(fx);