var Globals = {};

var cpm = {}; // global object for modules
var cpp = {}; // global object for plugins
var cpw = {}; // global object for widgets
var cpt = {}; // global object for themes

//------------------------------------------------//
var Util = {
    createCPObject: function(objName){
        var arr = objName.split('.');

        var objStr = '';
        $(arr).each(function(i){
            var objNameTemp = arr[i];
            var objName = objStr + objNameTemp;
            eval("obj = " + objName);
            if (obj == undefined) {
                eval(objName + " = {}");
            }
            objStr += objNameTemp + '.';
        });
    },

    showProgressInd: function(message) {
        $("body").addClass("loading");
    },

    hideProgressInd: function() {
        $("body").removeClass("loading");
    },

    closeAllModals: function(){
        $('.modal').modal('hide')
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open');
        $('.modal').remove();
    },

    alert: function(message, callbackOnClose) {
        if ($('#cp-alert').length > 0){
            $('#cp-alert').modal('hide');
        }

        var htmlString = "\
        <div id='cp-alert' class='modal fade' tabindex='-1'>\
            <div class='modal-dialog'>\
                <div class='modal-content'>\
                    <div class='modal-body'>\
                        <div class='modal-body'>\
                            " + message + "\
                        </div>\
                        <div class='modal-footer'>\
                            <button type='button' class='btn btn-primary' \
                                data-dismiss='modal'>Close</button>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
        ";
        $('body').append(htmlString);

        var focusedElm = $(':focus');

        $('#cp-alert').modal({
            keyboard: true,
        });

        $('#cp-alert').on('hidden.bs.modal', function() {
            $(this).remove();
            focusedElm.focus();
            if (callbackOnClose){
                callbackOnClose.call(this);
            }
        });

    },

    confirm: function(message, callback, options) {
        var settings = jQuery.extend({
             btn1Label: 'Yes'
            ,btn2Label: 'Cancel'
            ,title: ''
        }, options);

        var title = settings.title;
        var focusedElm = $(':focus');

        bootbox.confirm({
            title: settings.title,
            message: message,
            callback: function(result) {
                if (result){
                    callback.call(this);
                    $('.modal-backdrop').remove();
                }
                focusedElm.focus();
            }
        });
    },

    openModalForLink: function(exp) {
        // Util.showProgressInd();
        exp = $.extend({
             url: ''
            ,title: ''
            ,isJson: ''
            ,width: ''
            ,callbackFn: ''
            ,callbackOnClose: ''
            ,showOuterOnly: false
            ,showFormSubmit: false
            ,submitFormLabel: 'Save Changes'
            ,extraData: {}
        }, exp || {});

        var linkObj = $(this);
        var modalId= ($(this).attr('id')) ? $(this).attr('id') + '_modal' : 'cpModal';

        url = exp.url ? exp.url : $(this).attr('url');
        if (!url) {
            url = $(this).attr('href');
        }

        if (exp.extraData) {
            url += exp.extraData;
        }

        var title           = exp.title ? exp.title                    : $(this).attr('title');
        var isJson          = exp.isJson? exp.isJson                   : $(this).attr('isJson');
        var callbackFn      = exp.callbackFn ? exp.callbackFn          : linkObj.attr('callbackFn');
        var callbackOnClose = exp.callbackOnClose ? exp.callbackOnClose: linkObj.attr('callbackOnClose');
        var width           = exp.width? exp.width                     : $(this).attr('w');
        var height          = exp.height? exp.height                   : $(this).attr('h');
        var height          = exp.height? exp.height                   : $(this).attr('h');
        var showFormSubmit  = exp.showFormSubmit ? exp.showFormSubmit  : $(this).attr('showFormSubmit');
        var submitFormLabel = $(this).attr('submitFormLabel') ? $(this).attr('submitFormLabel'):
            exp.submitFormLabel;
        // adds a scrollable class - cp-scroll
        var hasScrollBody  = exp.hasScrollBody ? exp.hasScrollBody : $(this).attr('hasScrollBody');
        var scrollBodyClass  = hasScrollBody ? "cp-scroll" : '';

        var dataType = isJson ? 'json' : 'html';

        var showModal = function(data, status, xhr){
            // Util.hideProgressInd();

            var htmlResponse = data;

            if (isJson) {
                htmlResponse = data.html;
            }

            var footerText = '';
            if (showFormSubmit){
                footerText = "\
                <div class='modal-footer'>\
                    <button type='button' class='btn btn-default closeBsFormModal' data-dismiss='modal'>Close</button>\
                    <button type='button' class='btn btn-primary submitBsFormModal'>" + submitFormLabel + "</button>\
                </div>\
                ";
            }

            if (exp.showOuterOnly){
                var htmlString = "\
                <div id='" + modalId + "' class='modal fade'>\
                    <div class='modal-dialog'>\
                        <div class='modal-content'>\
                            " + htmlResponse + "\
                        </div>\
                    </div>\
                </div>\
                ";
            } else {
                var htmlString = "\
                <div id='" + modalId + "' class='modal fade' data-keyboard='false'>\
                    <div class='modal-dialog'>\
                        <div class='modal-content'>\
                            <div class='modal-header'>\
                                <h4 class='modal-title'>" + title + "</h4>\
                                <button type='button' class='close' data-dismiss='modal' \
                                    aria-hidden='true'><i class='fa fa-times-circle fa-lg'></i></button>\
                            </div>\
                            <div class='modal-body " + scrollBodyClass + "'>\
                                " + htmlResponse + "\
                            </div>\
                            " + footerText + "\
                        </div>\
                    </div>\
                </div>\
                ";
            }

            if ($('#' + modalId).length > 0){
                $('#' + modalId).remove();
            }
            var focusedElm = $(':focus');

            $('body').append(htmlString);
            $('#' + modalId).modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('#' + modalId).on('shown.bs.modal', function () {
                Util.hideProgressInd();
                $('.modal-body').scrollTop(0);
            });

            $('#' + modalId).on('hidden.bs.modal', function () {
                if (callbackOnClose){
                    var callbackOnCloseFnName = eval(callbackOnClose);
                    callbackOnCloseFnName.call(this, linkObj, data);
                } else {
                    $(this).remove();
                }
                focusedElm.focus();
            });

            var modalDlgObj = $('#' + modalId + ' .modal-dialog');
            var modalBodyObj = $('.modal-body', modalDlgObj);
            if (!width){
                width = parseInt(modalDlgObj.css('width'));
            } else {
                if (width == 'screen'){
                    width = $(document).width() - 200;
                }
            }

            if (width != 0 && width != undefined){
                if (width > $(document).width()){
                    width = $(document).width() - 50;
                }

                width = $.isNumeric(width) ? width + 'px' : width;

                modalDlgObj.css({
                    'width': width,
                    'max-width': width,
                    'margin-left': 'auto',
                    'margin-right': 'auto',
                });
            }
            if (height) {
                //if a number is given for height then add a 'px' to it
                height = $.isNumeric(height) ? height + 'px' : height;

                //if a percentage is used in height
                if (height.indexOf("%") !== -1) {
                    var heightPerc = parseInt(height);
                    var heightWindow = $( window ).height();
                    height = heightWindow * (heightPerc / 100);
                }

                modalBodyObj.css({
                    'height': height,
                    'overflow-y': 'scroll',
                });
            }

            if (callbackFn){
                var callbackFnName = eval(callbackFn);
                callbackFnName.call(this, linkObj, data);
            }

            Util.hideProgressInd();
        } //showModal function

        $.get(url, showModal, dataType);

    },

    goToByScroll: function(id){
        $('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
    },

    loadDropdownByJSON: function(srcFld, srcValue, dstFld, dstRoom, formId, exp){
        var url = $('#scopeRootAlias').val() + 'index.php?room=' + dstRoom + '&_spAction=jsonForDropdown&showHTML=0'

        if (!formId){
            formId = 'frmEdit';
        }

        exp = $.extend({
             extraDestFlds: [] //for ex: we have category (source) and sub_category1, sub_category2, sub_category3 etc as destination fields
        }, exp || {});
        var callbackFn = exp.callbackFn ? exp.callbackFn : '';

        Util.showProgressInd();
        var firstOptionText = $('#' + formId + ' select#' + dstFld + ' option:first').text();
        var loadingJSON = [{'value':'', 'caption':'Loading...'}];

        var dtsFldObj = $('#' + formId + ' select#' + dstFld);

        dtsFldObj.cp_loadSelect(loadingJSON);
        for (var i = 0; i < exp.extraDestFlds.length; i++) {
            var dstFldExtra = exp.extraDestFlds[i];
            $('#' + formId + ' select#' + dstFldExtra).cp_loadSelect(loadingJSON);
        }
        $.getJSON(url, {srcFld: srcFld, srcValue: srcValue, firstOptionText: firstOptionText}, function(json) {
            /*
            when selected value is passed, the returned data will be in 3D array
            the dropdown data will be in json.data  ex: wingwah/serviceplan
            $json = array(
                'selectedValue' => 1,
                'data' => $json
            );
            */
            data = json.selectedValue ? json.data : json;
            dtsFldObj.cp_loadSelect(data);
            for (var i = 0; i < exp.extraDestFlds.length; i++) {
                var dstFldExtra = exp.extraDestFlds[i];
                $('#' + formId + ' select#' + dstFldExtra).cp_loadSelect(data);
            }

            if (json.selectedValue){
                dtsFldObj.val(json.selectedValue);
            }

            if (callbackFn){
                var callbackFnName = eval(callbackFn);
                callbackFnName.call(this);
            }

            Util.hideProgressInd();
        });
    },

    showTypeaheadDropdown: function(){
        var txtFldObj  = $(this);
        var fldName    = txtFldObj.attr('name');
        var dispFld    = txtFldObj.attr('dispFld');
        var valFld     = txtFldObj.attr('valFld');
        var useFts     = txtFldObj.attr('useFts'); // mysql full text search
        var searchFlds = txtFldObj.attr('searchFlds');
        var module     = txtFldObj.attr('module');
        var callback   = txtFldObj.attr('callback');
        var calledFrom = txtFldObj.attr('calledFrom');
        var calledFromRecId = $('#record_id').val();

        var room       = module     ? module     : $('#cpRoom').val();
        var dispFld    = dispFld    ? dispFld    : fldName;
        var valFld     = valFld     ? valFld     : fldName;
        var searchFlds = searchFlds ? searchFlds : dispFld;
        var useFts     = useFts     ? useFts     : 0;

        var remoteUrl = 'index.php?_spAction=jsonForAutoSuggest';
        txtFldObj.typeahead({
            ajax: {
                url: remoteUrl,
                preDispatch: function (query) {
                    return {
                        query: query,
                        room: room,
                        calledFrom: calledFrom,
                        dispFld: dispFld,
                        valFld: valFld,
                        searchFlds: searchFlds,
                        useFts: useFts,
                        calledFromRecId: calledFromRecId
                    }
                }
            },
            items: 50,
            onSelect: function(item) {
                // if from the link panel
                var selectedId = item.value;

                if(fldName == 'linkSrcDataSrch'){
                    // txtFldObj.attr('value', '');
                    var srcRoomRecId = $('#record_id').val();
                    var wrapper = txtFldObj.closest('.linkSrcDataWrapper')
                    var srcDataObj = $('#srcDataTbl', wrapper)
                    var resultUrl = txtFldObj.attr('resultUrl');
                    $.post(resultUrl, {'srchRecId': selectedId, 'srcRoomRecId':srcRoomRecId}, function(html){
                        srcDataObj.hide();
                        srcDataObj.html(html);
                        srcDataObj.slideDown();
                    });
                } else if(fldName == 'addItemBySrch'){
                    // txtFldObj.attr('value', '');
                    var srcRoomRecId = $('#record_id').val();
                    var wrapper = txtFldObj.closest('.linkPortalWrapper')
                    var linkName = wrapper.attr('id');
                    var lnkRoomActual = wrapper.attr('lnkRoomActual');
                    var url = txtFldObj.attr('addItemUrl') + '&record_id=' + srcRoomRecId + '&lnkRoomId=' + selectedId;
                    var exp = {
                        portalDiv: wrapper,
                        goToLastPage: true
                    }
                    $.post(url, function(data){
                        Links.reloadPortalRecords(linkName, lnkRoomActual, srcRoomRecId, 'edit', exp);
                    });

                } else {
                    if (callback){
                        var callbackFnName = eval(callback);
                        callbackFnName.call(this, selectedId);
                    }
                }
            }
        });
    },

    unique: function(arr) {
        var result = [];
        $.each(arr, function(i, e) {
            if ($.inArray(e, result) == -1) result.push(e);
        });
        return result;
    },

    addCommasToNumber: function(nStr){
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
}

//------------------------------------------------//
var Forms = {
    setupBsForm: function(frmId){
        frmObj = $('#' + frmId);
        var showProgBar = frmObj.attr('showProgBar');
        $(frmObj).find('input,select,textarea').not('[type=submit]').jqBootstrapValidation({
            submitSuccess: function ($form, event) {
                // will not trigger the default submission in favor of the ajax function
                event.preventDefault();

                if(showProgBar != 0){
                    Util.showProgressInd();
                }
                var cpCSRFToken = $('#cpCSRFToken').val();
                var postArr = $form.serializeObject();
                postArr['cpCSRFToken'] = cpCSRFToken;

                //if angularjs is loaded then submit the scope values as well
                if (typeof angular !== "undefined") {
                    var ngModels = $('[ng-model]', $form);
                    if (ngModels.length > 0) {
                        var scope = angular.element($(ngModels[0])).scope();
                        _.each(ngModels, function(ngModelFld) {
                            var modelName = $(ngModelFld).attr('ng-model');
                            postArr[modelName] = scope[modelName];
                        });
                    }
                }

                $.ajax({
                    type: 'POST',
                    url: $form.attr('action'),
                    data: postArr,
                    dataType: 'json',
                    success: function(json){
                        Forms.validateBsForm($form, json);
                    }
                });
            }
        });
    },

    setupJqFormxxx: function(frmId){
        frmObj = $('#' + frmId);
        var showProgBar = frmObj.attr('showProgBar');
        $(frmObj).find('input,select,textarea').not('[type=submit]').jqBootstrapValidation({
            submitSuccess: function ($form, event) {
                if(showProgBar != 0){
                    Util.showProgressInd();
                }

                var cpCSRFToken = $('#cpCSRFToken').val();
                var additionalData = {
                    cpCSRFToken: cpCSRFToken
                };

                var options = {
                    success: function(json, statusText, xhr, $form){
                        Forms.validateBsForm($form, json);
                    },
                    dataType: 'json',
                    data: additionalData
                };
                $form.ajaxSubmit(options);
                // will not trigger the default submission in favor of the ajax function
                event.preventDefault();
            }
        });
    },

    setupJqForm: function(frmId){
        frmObj = $('#' + frmId);
        var showProgBar = frmObj.attr('showProgBar');

        $(frmObj).submit(function(e) {
            e.preventDefault();
            Util.showProgressInd();

            var form = $(this);
            var cpCSRFToken = $('#cpCSRFToken').val();
            var postArr = form.find('input,select,textarea').serializeObject();
            // console.log(postArr);
            postArr['cpCSRFToken'] = cpCSRFToken;

            //if angularjs is loaded then submit the scope values as well
            if (typeof angular !== "undefined") {
                var ngModels = $('[ng-model]', form);
                if (ngModels.length > 0) {
                    var scope = angular.element($(ngModels[0])).scope();
                    _.each(ngModels, function(ngModelFld) {
                        var modelName = $(ngModelFld).attr('ng-model');
                        postArr[modelName] = scope[modelName];
                    });
                }
            }

            var formData = new FormData(form);
            for ( var key in postArr) {
                formData.append(key, postArr[key]);
            }

            // Attach file
            var files = $('input[type=file]');
            for ( var key in files) {
                //to avoid context:, length:, prevObject:, selector: etc properties
                if ($.isNumeric(key)) {
                    var fileElement = files[key];
                    formData.append(fileElement.name, fileElement.files[0]);
                }
            }

            $.ajax({
                type: 'POST',
                url: form.attr('action'),
                // data: postArr,
                data: formData,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function(json){
                    Forms.validateBsForm(form, json);
                }
            });
        });
    },

    validateBsForm: function(frmObj, json) {
        if (json.errorCount && json.errorCount > 0) {
            Util.hideProgressInd();
            Forms.alertErrorsText(frmObj, json);

            $('.reloadCaptcha', frmObj).click();
        } else if(json.errorCount == 0){

            var dontClearAfterSubmit = frmObj.attr('dontClearAfterSubmit');
            var returnUrlFld = $('input[name=returnUrl]', frmObj);

            if (dontClearAfterSubmit !== '1') {
                try{
                    grecaptcha.reset();
                }catch(err){
                    
                }
                frmObj.clearForm();
            }

            var refresh = $('[name=refresh]', frmObj).val();
            refresh = typeof refresh === "undefined" ? 1 : refresh;
            if (refresh == 0) {
                Forms.alertSuccessText(frmObj, json);
                Util.hideProgressInd();
            } else {
                if (json.returnUrl && json.returnUrl != "") {
                    frmObj.closest('.modal').modal('hide');
                    document.location = json.returnUrl;
                } else if (returnUrlFld.length != 0 && returnUrlFld.val() != '') {
                    document.location = returnUrlFld.val();
                } else {
                    Forms.alertSuccessText(frmObj, json);
                    Util.hideProgressInd();
                }
            }

            $('.reloadCaptcha', frmObj).click();

        }
    },

    alertErrorsText: function(frmObj, json){
        $('.alert-block', frmObj).hide();
        var callbackFnFld = $('input[name=callbackFnOnError]', frmObj);
        var showError = $('input[name=showError]', frmObj).val();

        if(!showError){
            showError = 1;
        }

        errorText = "<h4 class='alert-heading'>The following error(s) occurred</h4><br>";

        $.each(json.errors, function() {
            var urlHref = '#fld_' + this.name;
            errorText += "<p><a href='" + urlHref + "'>" + this.msg + "</a></p>";
        });

        var htmlString = "\
        <div class='alert alert-danger alert-dismissable fade show in validation-errors'>\
            <button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>\
            " + errorText + "\
        </div>\
        ";

        if ($(callbackFnFld).length > 0){
            if (callbackFnFld.val() != ''){
                var callbackFn = eval(callbackFnFld.val());
                callbackFn.call(this, json, frmObj);
            }
        }

        if (showError){
            var frmId = frmObj.attr('id');
            $('.alert.alert-danger', frmObj).remove();
            frmObj.prepend(htmlString);

            //if the form is on a modal
            if ($('#' + frmId).closest('.modal').length > 0) {
                $('.modal').animate({
                    scrollTop: 0
                },'slow');
            } else {
                $('html,body').animate({
                    scrollTop: $("#"+frmId).offset().top - 50
                },'slow');
            }

        }
    },

    alertSuccessText: function(frmObj, json){
        $('.alert', frmObj).hide();
        var successMsgFld = $('.successMessageLabel', frmObj);
        var dialogMsgFld = $('input[name=dialogMsg]', frmObj);
        var callbackFnFld = $('input[name=callbackFn]', frmObj);
        var hideFormOnSuccess = frmObj.attr('hideFormOnSuccess');

        if ($(dialogMsgFld).length > 0){
            Util.closeAllModals();
            Util.alert(dialogMsgFld.val());
        }

        if ($(successMsgFld).length > 0) {
            var msg = $(successMsgFld).get(0).innerHTML;
            var htmlString = "\
            <div class='alert alert-success alert-dismissable show fade in'>\
                <button type='button' class='close' data-dismiss='alert'>&times;</button>\
                " + msg + "\
            </div>\
            ";

            if (hideFormOnSuccess){
                frmObj.html(htmlString);
            } else {
                if (successMsgFld.attr('position') == 'bottom'){
                    frmObj.append(htmlString);
                } else {
                    frmObj.prepend(htmlString);
                }
            }
            Util.goToByScroll(frmObj.attr('id'));
        }

        var apply   = $('input[name=apply]').val();
        var refresh = $('input[name=refresh]').val();
        if ($(callbackFnFld).length > 0){
            if (callbackFnFld.val() != ''){
                var callbackFn = eval(callbackFnFld.val());
                callbackFn.call(this, json, frmObj);
            }
        } else if (apply == 1 && refresh == 1) {
            var url = document.location.toString();
            //if hash from boostrap tab is applied in the url then no need to reload
            if (!url.match('#')) {
                document.location = url;
            }
        }
    },

    submitQuickSearchForm: function(event) {
        event.preventDefault();

        var $form = $(this);

        var postArr = $form.serializeObject();

        //if angularjs is loaded then submit the scope values as well
        if (typeof angular !== "undefined") {
            var ngModels = $('[ng-model]', $form);
            if (ngModels.length > 0) {
                var scope = angular.element($(ngModels[0])).scope();
                _.each(ngModels, function(ngModelFld) {
                    var modelName = $(ngModelFld).attr('ng-model');
                    var modelValue = scope[modelName];
                    // if (typeof modelValue == 'object') {
                    //     //if it's a typeahead field
                    //     if ($(ngModelFld).attr('uib-typeahead')) {
                    //         //modelValue is supposed to be ex: {id:1234, name:'Abc Company'}
                    //         // modelValue = modelValue.id;
                    //     }
                    // }
                    postArr[modelName] = modelValue;
                });
            }
        }

        var url = $form.attr('action') + '?' + $.param(postArr);
        document.location = url;

    },

}
//------------------------------------------------//
var Lang = {
    get: function(key, defaultVal) {
        defaultVal = (defaultVal) ? defaultVal : key;
        var data = '';
        if (typeof Lang.data !== 'undefined') {
            data = (Lang.data[key]) ? Lang.data[key] : defaultVal;
        } else {
            data = defaultVal;
        }
        return data;
    }
}

//------------------------------------------------//
var Cfg = {
    get: function(key) {
        return Cfg.data[key];
    }
}

//------ Called on load ready -----//
$(function() {
    $('form.bsForm').livequery(function(){
        var formId = $(this).attr('id');
        Forms.setupBsForm(formId);
    });

    $('form.cpJqForm').livequery(function(){
        var formId = $('form.cpJqForm').attr('id');
        Forms.setupJqForm(formId);
    });

    $('.reloadCaptcha').click(function(e){
        e.preventDefault();
        var captchaId = $(this).attr('captcha_id');
        var captchaCode = $(this).parents('form').find('input[name=captcha_code]');
        captchaCode.val('');

        reloadUrl = $('#libraryPathAlias').val() + 'lib_php/securimage/securimage_show.php?' + Math.random();
        $('#' + captchaId).attr('src', reloadUrl);
    });

    //quick search bar
    $('form.quick-search-form').submit(Forms.submitQuickSearchForm);

    $(document).on('click', '.cpModal', function(e){
        e.preventDefault();
        e.stopPropagation();
        Util.openModalForLink.call(this)
    });

    $.fn.clearForm = function() {
        return this.each(function() {
            var type = this.type, tag = this.tagName.toLowerCase();
            if (tag == 'form')
                return $(':input',this).clearForm();
            if (type == 'text' || type == 'password' || type == 'textarea' || type == 'email')
                this.value = '';
            else if (type == 'checkbox' || type == 'radio')
                this.checked = false;
            else if (type == 'select')
                this.selectedIndex = -1;
        });
    };

    //form time picker (bootstrap-datetimepicker plugin)
    if ($('.cpDateTimepicker').length > 0) {
        $('.cpDateTimepicker').datetimepicker({
        });
    }

    $('.cpDatepicker').livequery(function(){
        var defaultDate = $(this).attr('defaultDate');
        var pickTime = $(this).attr('pickTime') == 1 ? true : false;
        $('.cpDatepicker').datetimepicker({
            defaultDate: defaultDate,
        })
        .on('dp.change', function(e) {
            var wrapper = $(this).closest('.linkPortalDataWrapper');
            if(wrapper.length > 0){
                Links.updateGridData.call($(this));
            };
            //$(this) is a div
            $(this).find("input").trigger('input');
        });

        // $('.cpDatepicker input').focus(function(e){
        //     $(this).blur();
        // });
    });

    $('input.cpTypeahead').livequery(function(){
        Util.showTypeaheadDropdown.call($(this));
    });

    $('a.clearTypeahead').livequery('click', function(e){
        e.preventDefault();
        var parent = $(this).closest('.linkSrcDataWrapper');
        $('input.cpTypeahead', parent).attr('value', '');
        $('#srcDataTbl table', parent).remove();

    });

    $('.cpTimepicker').livequery(function(){
        $('.cpTimepicker').datetimepicker({
            pickDate: false
        });
    });

    $('.submitBsForm').on('click', function(e){
        e.preventDefault();

        var frmId = $(this).attr('frmId');
        if(frmId){
            $('#' + frmId).submit();
        } else {
            // for backward compatibilty
            $(this).closest('form.bsForm').submit();
        }
    });

    $('.submitBsFormModal').livequery('click', function(e){
        e.preventDefault();
        $('form.cpJqForm', $(this).closest('.modal')).submit();
    });

    $('.cpBack').on('click', function(e){
        e.preventDefault();
        history.back();
    });

    if ($(".fancybox").length > 0){
        $(".fancybox").fancybox({
        });
    }

    if ($(".footable").length > 0){
    	$(".footable").footable({
    	});
    }

    if ($('a.cpZoom').length > 0){
        $('a.cpZoom').colorbox();
    }

    $("a[rel='cpZoomGallery']").livequery(function() {
        $("a[rel='cpZoomGallery']").colorbox({'maxHeight': $(window).height(), 'maxWidth': $(window).width()});
    });

    $(document).on('click', '.panel-heading.clickable', function(e){
        var $this = $(this);
        if(!$this.hasClass('panel-collapsed')) {
            $this.closest('.panel').find('.panel-body').slideUp();
            $this.addClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        } else {
            $this.closest('.panel').find('.panel-body').slideDown();
            $this.removeClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        }
    })

    $('.panel-heading.clickable').livequery(function(){
        var $this = $(this);
        if($this.hasClass('panel-collapsed')) {
            $this.closest('.panel').find('.panel-body').hide();
        }
    });

    $(".clearDate").livequery(function() {
        $(this).click(function(){
            $('input', $(this).closest('.cpDatepicker')).val('');
        });
    });


});

(function ($) {
// VERTICALLY ALIGN FUNCTION
$.fn.vAlign = function(opts) {
    opts = opts || {};

    var defaults = {
        marginTopDiff: 0
    }
    opts = $.extend({}, defaults, opts);

	return this.each(function(i){
        opts.marginTopDiff;
    	var ah = $(this)[0].height;
    	var ph = $(this).parent().height();
    	var mh = Math.ceil((ph-ah) / 2);
    	mh = mh + opts.marginTopDiff;
        $(this).animate({
            'padding-top' : mh
          }, "slow");
    });
};
})(jQuery);

(function($) {
    $.fn.cp_emptySelect = function() {
      return this.each(function(){
        if (this.tagName=='SELECT') this.options.length = 0;
      });
    }

    $.fn.cp_loadSelect = function(optionsDataArray) {
        return this.cp_emptySelect().each(function(){
            if (this.tagName=='SELECT') {
                var selectElement = this;
                $.each(optionsDataArray,function(index,optionData){
                    var option = new Option(optionData.caption, optionData.value);
                    // if ($.browser.msie) {
                    //   selectElement.add(option);
                    // } else {
                    //   selectElement.add(option,null);
                    // }
                    selectElement.add(option,null);
                });
            }
        });
    }
})(jQuery);

(function($){
     $.fn.extend({
          center: function (options) {
               var options =  $.extend({ // Default values
                    inside:window, // element, center into window
                    transition: 0, // millisecond, transition time
                    minX:0, // pixel, minimum left element value
                    minY:0, // pixel, minimum top element value
                    withScrolling:true, // booleen, take care of the scrollbar (scrollTop)
                    vertical:true, // booleen, center vertical
                    horizontal:true // booleen, center horizontal
               }, options);
               return this.each(function() {
                    var props = {position:'absolute'};
                    if (options.vertical) {
                         var top = ($(options.inside).height() - $(this).outerHeight()) / 2;
                         if (options.withScrolling) top += $(options.inside).scrollTop() || 0;
                         top = (top > options.minY ? top : options.minY);
                         $.extend(props, {top: top+'px'});
                    }
                    if (options.horizontal) {
                          var left = ($(options.inside).width() - $(this).outerWidth()) / 2;
                          if (options.withScrolling) left += $(options.inside).scrollLeft() || 0;
                          left = (left > options.minX ? left : options.minX);
                          $.extend(props, {left: left+'px'});
                    }
                    if (options.transition > 0) $(this).animate(props, options.transition);
                    else $(this).css(props);
                    return $(this);
               });
          }
     });

    //serialize object
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

})(jQuery);


