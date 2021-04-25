cpt.generic = {
    init: function(){
    },

    approveContent: function(e){
    	e.preventDefault();
        var record_id = cp.urlParams.record_id;
        var url = "index.php?module=webBasic_content&_spAction=approveContent&showHTML=0&tpl=0" +
        		  "&record_id=" + record_id;

        $.get(url, function(html){
			window.opener.location.reload(false);
        	window.close();
        });
    },

    unApproveContent: function(e){
    	e.preventDefault();
        var record_id = cp.urlParams.record_id;
        var url = "index.php?module=webBasic_content&_spAction=unApproveContent&showHTML=0&tpl=0" +
        		  "&record_id=" + record_id;

        $.get(url, function(html){
			window.opener.location.reload(false);
        	window.close();
        });
    }
}

var Forms = $.extend(Forms, {
   alertErrorsText: function(frmObj, json){
        $('.alert-block', frmObj).hide();
        var callbackFnFld = $('input[name=callbackFnOnError]', frmObj);

        errorText = "<h4 class='alert-heading'>The following error(s) occurred</h4><br>";

        $.each(json.errors, function() {
            errorText += '<p>' + this.msg + '</p>';
        });

        var htmlString = "\
        <div class='alert alert-danger alert-dismissable fade in'>\
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

        var frmId = frmObj.attr('id');
        $('.alert.alert-danger', frmObj).remove();
        frmObj.prepend(htmlString);
        $('html,body').animate({scrollTop: $("#"+frmId).offset().top - 50},'slow');
    }
});
/******** other modules sample ***********/
/*
Util.createCPObject('cpm.ecommerce.product');

cpm.ecommerce.product = {
    init: function(){
    },

    abc: function(){
    }
}
*/

/*
 * Global jquery functions and rule have to be defined here.
 *
 *
 */
$(document).ready(function(){
	$('#approveBtn').click(cpt.generic.approveContent);
	$('#unApproveBtn').click(cpt.generic.unApproveContent);

    function isIE8CompatMode() {
        return $.browser.msie
            && $.browser.version == 7.0
            && document.documentMode
            && document.documentMode == 7;
    }

    var ieCheck = isIE8CompatMode();
    if(ieCheck){
		//do stuff
    }
	var mCheck = (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i));
	if(mCheck){
		var contentInput = $('#content input, #content textarea, #content select'),
			mobileSearch = $('#searchStickyText, #searchMobile'),
			stickyNav = $('#head #stickyNav');
		contentInput.on('focus', function(){
			stickyNav.addClass('hidden');
		});
		contentInput.on('blur', function(){
		    stickyNav.removeClass('hidden');
		});
		mobileSearch.on('focus', function(){
			$("html, body").animate({ scrollTop: window.pageYOffset });
		});
	}

	$('#content .inputGroup select').selectric({
		disableOnMobile: false,
		arrowButtonMarkup:'<b class="button"></b>'
	});
	$('#content .inputGroup select').on('change', function(){
		setTimeout(function(){$('#content .inputGroup select').selectric('refresh');},500);
		if($(this).val()!=''){
			$(this).parents('.selectricWrapper').find('.selectric').removeClass('errorCustom');
		}
	});

	$('#social select').selectric({
		disableOnMobile: false
	});
	$('#social select').on('change', function(){
		setTimeout(function(){$('#social select').selectric('refresh');},500);
		if($(this).val()!=''){
			document.location = $(this).val();
		}
	});
});

/*! NOT MINIFIED FOR DEBUGGING IN IE
 *         ,/
 *       ,'/
 *     ,' /
 *   ,'  /_____,
 * .'____    ,'
 *      /  ,'
 *     / ,'
 *    /,'
 *   /'
 *
 * Selectric Ϟ v1.6.1 - http://lcdsantos.github.io/jQuery-Selectric/
 *
 * Copyright (c) 2013 Leonardo Santos; Dual licensed: MIT/GPL
 *
 */

(function ($) {
	var pluginName = 'selectric',
			// Replace diacritics
			_replaceDiacritics = function(s) {
				// /[\340-\346]/g, // a
				// /[\350-\353]/g, // e
				// /[\354-\357]/g, // i
				// /[\362-\370]/g, // o
				// /[\371-\374]/g, // u
				// /[\361]/g, // n
				// /[\347]/g, // c
				// /[\377]/g // y
				var k, d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' ');
                for (k in d){
					s = s.toString().toLowerCase().replace(RegExp('[' + d[k] + ']', 'g'), 'aeiouncy'.charAt(k));
                }

				return s;
			},
			init = function(element, options) {
				var options = $.extend({
							onOpen: $.noop,
							onClose: $.noop,
							onChange: $.noop,
							maxHeight: 300,
							keySearchTimeout: 500,
							arrowButtonMarkup: '<b class="button">&#x25be;</b>',
							disableOnMobile: true,
							openOnHover: false,
							expandToItemText: false
						}, options);

				if (options.disableOnMobile && /android|ip(hone|od|ad)/i.test(navigator.userAgent)) return;

				var $original = $(element),
						_input = $('<input type="text" class="' + pluginName + 'Input"/>'),
						$wrapper = $('<div class="' + pluginName + '"><p class="label"/>' + options.arrowButtonMarkup + '</div>'),
						$items = $('<div class="' + pluginName + 'Items" tabindex="-1"></div>'),
						$outerWrapper = $original.data(pluginName, true).wrap('<div>').parent().append($wrapper.add($items).add(_input)),
						selectItems = [],
						isOpen,
						$label = $('.label', $wrapper),
						$li,
						bindSufix = '.sl',
						$doc = $(document),
						$win = $(window),
						clickBind = 'click' + bindSufix,
						resetStr,
						classOpen = pluginName + 'Open',
						classDisabled = pluginName + 'Disabled',
						tempClass = pluginName + 'TempShow',
						selectStr = 'selected',
						selected,
						currValue,
						itemsHeight,
						closeTimer,
						finalWidth,
						optionsLength,
						inputEvt = 'oninput' in _input[0] ? 'input' : 'keyup';

				function _populate() {
					var $options = $original.wrap('<div class="' + pluginName + 'HideSelect">').children(),
							_$li = '<ul>',
							visibleParent = $items.closest(':visible').children(':hidden'),
							maxHeight = options.maxHeight,
							selectedIndex = $options.filter(':' + selectStr).index();

					currValue = (selected = ~selectedIndex ? selectedIndex : 0);

					if ( optionsLength = $options.length ) {
						// Build options markup
						$options.each(function(i){
							var $elm = $(this),
									optionText = $elm.html(),
									selectDisabled = $elm.prop('disabled');

							selectItems[i] = {
								value: $elm.val(),
								text: optionText,
								//slug: _replaceDiacritics(optionText),
								disabled: selectDisabled
							};

							_$li += '<li class="' + (i == currValue ? selectStr : '') + (i == optionsLength - 1 ? ' last' : '') + (selectDisabled ? ' disabled' : '') + '">' + optionText + '</li>';
						});

						$items.html(_$li + '</ul>');

						$label.html(selectItems[currValue].text);
					}

					$wrapper.add($original).off(bindSufix);
					$outerWrapper.data(pluginName, true).prop('class', pluginName + 'Wrapper ' + $original.prop('class') + ' ' + classDisabled);

					if ( !$original.prop('disabled') ){
						// Not disabled, so... Removing disabled class and bind hover
						$outerWrapper.removeClass(classDisabled).hover(function(){
							$(this).toggleClass(pluginName + 'Hover');
						});

						// Click on label and :focus on original select will open the options box
						options.openOnHover && $wrapper.on('mouseenter' + bindSufix, _open);

						// Toggle open/close
						$wrapper.on(clickBind, function(e){
							isOpen ? _close() : _open(e);
						});

						function _handleSystemKeys(e){
							// Tab / Enter / ESC
							if ( /^(9|13|27)$/.test(e.keyCode || e.which) ) {
								e.stopPropagation();
								_select(selected, true);
							}
						}

						_input.on({
							keypress: _handleSystemKeys,
							keydown: function(e){
								_handleSystemKeys(e);

								// Clear search
								clearTimeout(resetStr);
								resetStr = setTimeout(function(){
									_input.val('');
								}, options.keySearchTimeout);

								var key = e.keyCode || e.which;

								// If it's a directional key
								// 37 => Left
								// 38 => Up
								// 39 => Right
								// 40 => Down
								if ( key > 36 && key < 41 )
									_select( key < 39 ? previousEnabledItem() : nextEnabledItem() );
							},
							focusin: function(e){
								// Stupid, but necessary... Prevent the flicker when
								// focusing out and back again in the browser window
								_input.one('blur', function(){
									_input.blur();
								});

								isOpen || _open(e);
							}
						}).on(inputEvt, function(){
							if ( _input.val().length ){
								// Search in select options
								$.each(selectItems, function(i, elm){
									if ( RegExp('^' + _input.val(), 'i').test(elm.slug) && !elm.disabled ){
										_select(i);
										return false;
									}
								});
							}
						});

						// Remove styles from items box
						// Fix incorrect height when refreshed is triggered with fewer options
						$li = $('li', $items.removeAttr('style')).click(function(){
							// The second parameter is to close the box after click
							_select($(this).index(), true);

							// Chrome doesn't close options box if select is wrapped with a label
							// We need to 'return false' to avoid that
							return false;
						});
					} else
						_input.prop('disabled', true);

					// Calculate options box height
					// Set a temporary class on the hidden parent of the element
					visibleParent.addClass(tempClass);

					var itemsWidth = $items.outerWidth(),
							wrapperWidth = $wrapper.outerWidth() - (itemsWidth - $items.width());

					// Set the dimensions, minimum is wrapper width, expand for long items if option is true
					if ( !options.expandToItemText || wrapperWidth > itemsWidth )
						finalWidth = wrapperWidth;
					else {
						// Make sure the scrollbar width is included
						$items.css('overflow', 'scroll');

						// Set a really long width for $outerWrapper
						$outerWrapper.width(9e4);
						finalWidth = itemsWidth;
						// Set scroll bar to auto
						$items.css('overflow', '');
						$outerWrapper.width('');
					}

					$items.width(finalWidth).height() > maxHeight && $items.height(maxHeight);

					// Remove the temporary class
					visibleParent.removeClass(tempClass);
				}

				_populate();

				// Open the select options box
				function _open(e) {
					e.preventDefault();
					e.stopPropagation();

					// Find any other opened instances of select and close it
					$('.' + classOpen).removeClass(classOpen);

					isOpen = true;
					itemsHeight = $items.outerHeight();

					_isInViewport();

					// Give dummy input focus
					_input.val('').is(':focus') || _input.focus();

					$doc.on(clickBind, _close);

					// Delay close effect when openOnHover is true
					if (options.openOnHover){
						clearTimeout(closeTimer);
						$outerWrapper.one('mouseleave' + bindSufix, function(){
							closeTimer = setTimeout(_close, 500);
						});
					}

					// Toggle options box visibility
					$outerWrapper.addClass(classOpen);
					_detectItemVisibility(selected);

					options.onOpen(element);
				}

				// Detect is the options box is inside the window
				function _isInViewport() {
					if (isOpen){
						$items.css('top', ($outerWrapper.offset().top + $outerWrapper.outerHeight() + itemsHeight > $win.scrollTop() + $win.height()) ? -itemsHeight : '');
						setTimeout(_isInViewport, 100);
					}
				}

				// Close the select options box
				function _close(e) {
					if ( !e && currValue != selected ){
						var text = selectItems[selected].text;

						// Apply changed value to original select
						$original
							.prop('selectedIndex', currValue = selected)
							.data('value', text)
							.trigger('change', [text, currValue]);

						options.onChange(element);

						// Change label text
						$label.html(text);
					}

					// Remove click on document
					$doc.off(bindSufix);

					// Remove visible class to hide options box
					$outerWrapper.removeClass(classOpen);

					isOpen = false;

					options.onClose(element);
				}

				// Select option
				function _select(index, close) {
					// If element is disabled, can't select it
					if ( !selectItems[selected = index].disabled ){
						// If 'close' is false (default), the options box won't close after
						// each selected item, this is necessary for keyboard navigation
						$li.removeClass(selectStr).eq(index).addClass(selectStr);
						_detectItemVisibility(index);
						close && _close();
					}
				}

				// Detect if currently selected option is visible and scroll the options box to show it
				function _detectItemVisibility(index) {
					var liHeight = $li.eq(index).outerHeight(),
							liTop = $li[index].offsetTop,
							itemsScrollTop = $items.scrollTop(),
							scrollT = liTop + liHeight * 2;

					$items.scrollTop(
						scrollT > itemsScrollTop + itemsHeight ? scrollT - itemsHeight :
							liTop - liHeight < itemsScrollTop ? liTop - liHeight :
								itemsScrollTop
					);
				}

				function nextEnabledItem(next) {
					if ( selectItems[ next = (selected + 1) % optionsLength ].disabled )
						while ( selectItems[ next = (next + 1) % optionsLength ].disabled ){}

					return next;
				}

				function previousEnabledItem(previous) {
					if ( selectItems[ previous = (selected > 0 ? selected : optionsLength) - 1 ].disabled )
						while ( selectItems[ previous = (previous > 0 ? previous : optionsLength) - 1 ].disabled ){}

					return previous;
				}

				$original.on({
					refresh: _populate,
					destroy: function() {
						// Unbind and remove
						$items.add($wrapper).remove();
						$original.removeData(pluginName).removeData('value').off(bindSufix + ' refresh destroy open close').unwrap().unwrap();
					},
					open: _open,
					close: _close
				});
			};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function(args, options) {
		return this.each(function() {
			if ( !$(this).data(pluginName ))
				init(this, args || options);
			else if ( ''+args === args )
				$(this).trigger(args);
		});
	};
}(jQuery));
$(document).ready(function() {
var sNav = $('#stickyNav');

	// PERSISTENT SERVICE WIDGET ACTION
	(function(){
		/*if widget exists on the page, distance var should be widget top + widget height, else 120*/
		var moduleForm, distance = 120,
		$window = $(window);

		var moduleForm = $('.service-module');
		if(moduleForm.length > 1){
			var contentSection = '';
			if($('#overview').length > 0){
				contentSection = $('#overview').offset();
			} else {
				contentSection = $('#content').offset();
			}
			distance = contentSection.top + 40;
		} else {
			distance = 0;
		}

		$window.scroll(function() {
			if ($window.scrollTop() > (distance + 60) ) {
				$('#stickyNav ul li.service-widget-btn').fadeIn();
				$('#stickyNav ul li.service-widget-btn').addClass('active');
			} else {
				$('#stickyNav ul li.service-widget-btn').fadeOut();
				$('#stickyNav ul li.service-widget-btn').removeClass('active');
				$('#global-wizard').addClass('inactive').removeClass('active');
				$('#stickyNav ul.nav').fadeIn();
			}
		});

		$('#stickyNav ul li.service-widget-btn').on('click', function(e){
		    $('#global-wizard').addClass('active').removeClass('inactive');
		    $('#stickyNav ul.nav').fadeOut();
		    $(this).removeClass('active');
		    $('#searchStickyInput').addClass('hidden');
		    $('#global-wizard select').selectric('refresh');
		    sendContentModData('service module popup');
		    e.preventDefault();
		});

		$('#global-wizard .wizard-close-btn').on('click', function(e){
		    $('#global-wizard').removeClass('active').addClass('inactive');
		    $('#stickyNav ul li.service-widget-btn').addClass('active');
		    $('#stickyNav ul.nav').fadeIn();

		    e.preventDefault();
		});
	})();

	//SELECTED STATES
	function selectState() {
		var linkStr, elem, elemContent;
		$('#primary .nav a').each(function( index, value ) {
			elem = $(this);
			elemContent = elem.html().toLowerCase();
			linkStr = document.location.href.indexOf(elemContent);
			if (linkStr > -1) {
			    elem.addClass('selected');
			}
		});
		$('#stickyNav .nav a').each(function( index, value ) {
			elem = $(this);
			elemContent = elem.html().toLowerCase();
			linkStr = document.location.href.indexOf(elemContent);
			if (linkStr > -1) {
			    elem.addClass('selected');
			}
		});
	};
	selectState();

	//GLOBAL NAV STICKY ACTION
	(function(){
	      var distance = 120,
		  $window = $(window);

	      $window.scroll(function() {
		  if ($window.scrollTop() > distance) {
		      sNav.addClass('active');
		  } else {
		      sNav.removeClass('active');
		  }
	      });
	})();

	//Click outside search container
	function outerClick(cs) {
		$(document).mouseup(function (e) {
			var container = $(cs);
			if (e.target.nodeName != 'INPUT' && e.target.nodeName != 'BUTTON') {
				if(cs == '#searchPrimaryInput'){
                    if( !$(cs).hasClass('hidden')){
						closePrimary();
                    }
				} else {
					container.addClass('hidden');
				}
			}
		});
	}

	/*Primary nav*/
    var primaryWidth = '0';
	function closePrimary() {
		/*$('#searchPrimaryInput #searchPrimaryText').animate({
		    width: primaryWidth
		}, 100, 'linear', function() {
			$('#searchPrimaryInput').addClass('hidden');
			$('#primary .nav li').not('.search').fadeIn(100);
		});*/
		$('#searchPrimaryInput').addClass('hidden');
		$('#primary .nav li').not('.search').fadeIn(100);
	};

	$('#searchPrimary').bind('click', function(e){
        var animCheck = 0;
		if($('#searchPrimaryInput').hasClass('hidden')){
            $('#searchPrimaryInput').css({width:primaryWidth, height:'40px'});
			$('#primary .nav li').not('.search').fadeOut(100, function(){
                if(animCheck == 0){
                    $('#searchPrimaryInput').removeClass('hidden');
                    $('#searchPrimaryInput').animate({
                        width: "210px"
                    }, 100, 'linear' );
                    $('#searchPrimaryText').focus();
                    animCheck = 1;
                }
			});
		} else {
			closePrimary();
		}
		e.preventDefault();
		outerClick('#searchPrimaryInput');
	});


	/*Sticky nav*/
	$('#searchSticky').bind('click', function(e){
		if($('#searchStickyInput').hasClass('hidden')){
			$('#searchStickyInput').removeClass('hidden');
			$('#searchStickyText').focus();
		} else {
			$('#searchStickyInput').addClass('hidden');
		}
		e.preventDefault();
		outerClick('#searchStickyInput');
	});

	/*Mobile nav*/
	$('#searchMobile').bind('click', function(e){
		if($('#searchMobileInput').hasClass('hidden')){
			$('#searchMobileInput').removeClass('hidden');
			$('#searchMobileText').focus();
		} else {
			$('#searchMobileInput').addClass('hidden');
		}
		e.preventDefault();
		outerClick('#searchMobileInput');
	});

    /*Service Wizard functions*/
	function cascadeFormInit(ctxt){//Added context to support multiple instances

        if(ctxt.parents('#global-wizard').length == 0){//test for global-wizard and exclude from mobile show/hide code

            //Home toggle button
            var homeWizardBtn = ctxt.parent().find('.wizard-mobile-btn');

            homeWizardBtn.bind('click', function(){

                if ( ctxt.hasClass('closed') ) {
                    ctxt.slideDown(500, 'easeInOutCirc').removeClass('closed');
                    $('body,html').animate({scrollTop: 400}, 500, 'easeInOutCirc');
                    homeWizardBtn.find('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
                } else {
                    ctxt.slideUp(500, 'easeInOutCirc').addClass('closed');
                    homeWizardBtn.find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
                }

            });

            //homeWizardBtn.trigger('click');

        }

		//CASCADING SELECT BOXES
		function cascadeSelect(parent, child){
		var childOptions = child.find('option:not(.static)');

		   child.data('options',childOptions);
		   childOptions.not( '.static, .sub_' + parent.val() ).remove();
		   var parentStatic = parent.find('option.static'),
		       childStatic = child.find('option.static');


			parent.change(function(e){

				parentSelected = parent.find('option:selected');

				 childOptions.remove();
				 child
				     .append(child.data('options').filter('.sub_' + this.value))
				     .prepend( childStatic )
				     .prop('selectedIndex',0)
				     .selectric('refresh');
				if( child.children().length !== 1 ){

				child.closest('.form-group').show();

				} else {
				child.closest('.form-group').hide();
				}

			}); //end change

	       };//end cascadeSelect

		// define form and form steps
	       var stepA = ctxt.find('.select-type-of-product'),
		   stepB = ctxt.find('.select-portal'),
		   stepC = ctxt.find('.select-walmart-protection-plan');


	       //hide all but 'Step 1'
	       ctxt.find('.form-group:not(:first)').hide();

	       //init cascadeSelect method
	       cascadeSelect(stepA, stepB);
	       cascadeSelect(stepB, stepC);


		// Walmart Logic
		stepA.change(function(){
		    ctxt.find('.form-group-B').hide();
		    if( stepA.val() == 'A-MobilePhone'){
			stepB.find('option[name="walmart"]').attr('value', 'B-Walmart');
		    } else {
		       stepB.find('option[name="walmart"]').attr('value', '');
		    }
		    if(stepA.val() == 'A-TV')
		    {
		    	stepB.find('option[name="MilExchange"]').attr('value', 'MilitaryExchange');
		    }
		    if(stepA.val() == 'A-Tablet')
		    {
		    	stepB.find('option[name="OfficeMax"]').attr('value', 'OfficeMax');
		    }

		});


		function appendButton(){
			var formGroupA = ctxt.find('.form-group-A'),
			formGroupB = ctxt.find('.form-group-B');

			if(formGroupB.css('display') !== 'none') {
			//if(  formGroupB.is(":visible") ){
				ctxt.find('.submit-btn').appendTo(formGroupB);
			}
			else{
				ctxt.find('.submit-btn').appendTo(formGroupA);
			}
		};

		//go to selected portal when submitted
		ctxt.find('a.btn').on('click', function(e){
		 var linkdata="", selected;
		 var stepAfind="";
		     //step A is mobile and step B is Walmart AND step C isn't selected
		    if( stepB.val() == 'B-Walmart' && stepC.val() == 'static' ){
		    } else {
			if( stepC.val() !== 'static' ){
			  selected = stepC.find(':selected').attr('data-url');
			  linkdata="srvmod:mobile phone>pay as you go";
			}
			else{
			  selected = stepB.find(':selected').attr('data-url');
			  stepAfind = stepA.find(':selected').val();
			  stepAfind = stepAfind.replace("A-","");
			  linkdata="srvmod:"+stepAfind;
				}
		    }//END ELSE


		    if( selected ){
		       //Code for sitecatalyst tracking
		    	var selectPortal=stepB.find(':selected').val();
		    	if(selectPortal==""){
		    		selectPortal=stepB.find(':selected').attr('name');
		    	}else if(selectPortal=='B-Walmart'){
		    		selectPortal='walmart';
		    	}
		    	var evt="event46";
                if(stepC.find(':selected').val()!='static'){
                    if(stepC.find(':selected').attr('id') == "C-verizon"){
                        evt="event45";
                        selectPortal='vzw';

                    }else if(stepC.find(':selected').attr('id') == "C-ATT"){
                        evt="event45";
                        selectPortal='att';
                    }else if(stepC.find(':selected').attr('id') == "C-Walmart"){
                        evt="event45";
                        selectPortal='wmt';
                    }
                } else {
					if(stepB.find(':selected').attr('data')=="mobile"){
		    			evt="event45";
		    		}
                }
                if(stepB.val() == 'MilitaryExchange')
    		    {
    		    	linkdata="srvmod:TV>military exchange popup";
    		    	selectPortal="";
    		    	evt="event0";
    		    }
                if(stepB.val() == 'OfficeMax')
    		    {
    		    	linkdata="srvmod:Tablet>Office Depot/OfficeMax popup";
    		    	selectPortal="";
    		    	evt="event0";
    		    }

		       $(this).attr('data',linkdata+"~"+selectPortal+"~"+evt);
			   trackFunction($(this));
			   //End of sitecatalyst code

			function modalInit(rowClass){
				$('#servicerModal .serviceSection').addClass('hidden');
				$('#servicerModal .'+rowClass).removeClass('hidden');
				$('#servicerModal .btnContinue').attr('href', '');
				$('#servicerModal').modal();
			};
			var modalTest = selected.split(':');
			if( modalTest[0] === 'modal'){
				modalInit(modalTest[1]);
			} else {
				window.open (selected, '_blank');
			}
		    } else{
			ctxt.addClass('whoops');
			ctxt.find("select option:selected[value='static']").closest('.selectricWrapper').find('.selectric').addClass('whoops');
			ctxt.find('.form-alert').fadeIn().delay(1000).fadeOut();
		    }

			appendButton();
			e.preventDefault();
		});//end click

		ctxt.find('select').change(function(){
		    x = $(this).find('.static').detach();
		});

		ctxt.find('select').selectric({
			'disableOnMobile': 1
		});

	        ctxt.find('select').change(function(){
			if( $(this).val() !== 'static' ){
				$(this).closest('.selectricWrapper').find('.selectric').removeClass('whoops');
			}

			appendButton();

			ctxt.find('select').selectric('refresh');

		});

	       /*function centerUnderHero(){
		  var serviceMod = $('.service-module'),
		      elemH = serviceMod.outerHeight(),
		      heroH = $('#hero').outerHeight(),
		      elemOffset = heroH - (elemH/2)
		  if( isMobile == 0){
		    serviceMod.css('top', elemOffset );
		  }
	       };*/
	ctxt.removeClass('hidden');
	$('body').removeClass('pg-load');
	ctxt.find('select').selectric('refresh');
    };/*End Init function*/

    /*Initialize service wizard widget*/
	$(function(){

		var cascadeForm = $('.service-module');
		if(cascadeForm.length >= 1){
			cascadeForm.each( function(idx, elemVal) {
				var thisForm = $(elemVal);
				cascadeFormInit(thisForm);
			});
		} else {
			cascadeFormInit(cascadeForm);
		}

	});
});

/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
(function(k){k.transit={version:"0.9.9",propertyMap:{marginLeft:"margin",marginRight:"margin",marginBottom:"margin",marginTop:"margin",paddingLeft:"padding",paddingRight:"padding",paddingBottom:"padding",paddingTop:"padding"},enabled:true,useTransitionEnd:false};var d=document.createElement("div");var q={};function b(v){if(v in d.style){return v}var u=["Moz","Webkit","O","ms"];var r=v.charAt(0).toUpperCase()+v.substr(1);if(v in d.style){return v}for(var t=0;t<u.length;++t){var s=u[t]+r;if(s in d.style){return s}}}function e(){d.style[q.transform]="";d.style[q.transform]="rotateY(90deg)";return d.style[q.transform]!==""}var a=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;q.transition=b("transition");q.transitionDelay=b("transitionDelay");q.transform=b("transform");q.transformOrigin=b("transformOrigin");q.transform3d=e();var i={transition:"transitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",WebkitTransition:"webkitTransitionEnd",msTransition:"MSTransitionEnd"};var f=q.transitionEnd=i[q.transition]||null;for(var p in q){if(q.hasOwnProperty(p)&&typeof k.support[p]==="undefined"){k.support[p]=q[p]}}d=null;k.cssEase={_default:"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};k.cssHooks["transit:transform"]={get:function(r){return k(r).data("transform")||new j()},set:function(s,r){var t=r;if(!(t instanceof j)){t=new j(t)}if(q.transform==="WebkitTransform"&&!a){s.style[q.transform]=t.toString(true)}else{s.style[q.transform]=t.toString()}k(s).data("transform",t)}};k.cssHooks.transform={set:k.cssHooks["transit:transform"].set};if(k.fn.jquery<"1.8"){k.cssHooks.transformOrigin={get:function(r){return r.style[q.transformOrigin]},set:function(r,s){r.style[q.transformOrigin]=s}};k.cssHooks.transition={get:function(r){return r.style[q.transition]},set:function(r,s){r.style[q.transition]=s}}}n("scale");n("translate");n("rotate");n("rotateX");n("rotateY");n("rotate3d");n("perspective");n("skewX");n("skewY");n("x",true);n("y",true);function j(r){if(typeof r==="string"){this.parse(r)}return this}j.prototype={setFromString:function(t,s){var r=(typeof s==="string")?s.split(","):(s.constructor===Array)?s:[s];r.unshift(t);j.prototype.set.apply(this,r)},set:function(s){var r=Array.prototype.slice.apply(arguments,[1]);if(this.setter[s]){this.setter[s].apply(this,r)}else{this[s]=r.join(",")}},get:function(r){if(this.getter[r]){return this.getter[r].apply(this)}else{return this[r]||0}},setter:{rotate:function(r){this.rotate=o(r,"deg")},rotateX:function(r){this.rotateX=o(r,"deg")},rotateY:function(r){this.rotateY=o(r,"deg")},scale:function(r,s){if(s===undefined){s=r}this.scale=r+","+s},skewX:function(r){this.skewX=o(r,"deg")},skewY:function(r){this.skewY=o(r,"deg")},perspective:function(r){this.perspective=o(r,"px")},x:function(r){this.set("translate",r,null)},y:function(r){this.set("translate",null,r)},translate:function(r,s){if(this._translateX===undefined){this._translateX=0}if(this._translateY===undefined){this._translateY=0}if(r!==null&&r!==undefined){this._translateX=o(r,"px")}if(s!==null&&s!==undefined){this._translateY=o(s,"px")}this.translate=this._translateX+","+this._translateY}},getter:{x:function(){return this._translateX||0},y:function(){return this._translateY||0},scale:function(){var r=(this.scale||"1,1").split(",");if(r[0]){r[0]=parseFloat(r[0])}if(r[1]){r[1]=parseFloat(r[1])}return(r[0]===r[1])?r[0]:r},rotate3d:function(){var t=(this.rotate3d||"0,0,0,0deg").split(",");for(var r=0;r<=3;++r){if(t[r]){t[r]=parseFloat(t[r])}}if(t[3]){t[3]=o(t[3],"deg")}return t}},parse:function(s){var r=this;s.replace(/([a-zA-Z0-9]+)\((.*?)\)/g,function(t,v,u){r.setFromString(v,u)})},toString:function(t){var s=[];for(var r in this){if(this.hasOwnProperty(r)){if((!q.transform3d)&&((r==="rotateX")||(r==="rotateY")||(r==="perspective")||(r==="transformOrigin"))){continue}if(r[0]!=="_"){if(t&&(r==="scale")){s.push(r+"3d("+this[r]+",1)")}else{if(t&&(r==="translate")){s.push(r+"3d("+this[r]+",0)")}else{s.push(r+"("+this[r]+")")}}}}}return s.join(" ")}};function m(s,r,t){if(r===true){s.queue(t)}else{if(r){s.queue(r,t)}else{t()}}}function h(s){var r=[];k.each(s,function(t){t=k.camelCase(t);t=k.transit.propertyMap[t]||k.cssProps[t]||t;t=c(t);if(k.inArray(t,r)===-1){r.push(t)}});return r}function g(s,v,x,r){var t=h(s);if(k.cssEase[x]){x=k.cssEase[x]}var w=""+l(v)+" "+x;if(parseInt(r,10)>0){w+=" "+l(r)}var u=[];k.each(t,function(z,y){u.push(y+" "+w)});return u.join(", ")}k.fn.transition=k.fn.transit=function(z,s,y,C){var D=this;var u=0;var w=true;if(typeof s==="function"){C=s;s=undefined}if(typeof y==="function"){C=y;y=undefined}if(typeof z.easing!=="undefined"){y=z.easing;delete z.easing}if(typeof z.duration!=="undefined"){s=z.duration;delete z.duration}if(typeof z.complete!=="undefined"){C=z.complete;delete z.complete}if(typeof z.queue!=="undefined"){w=z.queue;delete z.queue}if(typeof z.delay!=="undefined"){u=z.delay;delete z.delay}if(typeof s==="undefined"){s=k.fx.speeds._default}if(typeof y==="undefined"){y=k.cssEase._default}s=l(s);var E=g(z,s,y,u);var B=k.transit.enabled&&q.transition;var t=B?(parseInt(s,10)+parseInt(u,10)):0;if(t===0){var A=function(F){D.css(z);if(C){C.apply(D)}if(F){F()}};m(D,w,A);return D}var x={};var r=function(H){var G=false;var F=function(){if(G){D.unbind(f,F)}if(t>0){D.each(function(){this.style[q.transition]=(x[this]||null)})}if(typeof C==="function"){C.apply(D)}if(typeof H==="function"){H()}};if((t>0)&&(f)&&(k.transit.useTransitionEnd)){G=true;D.bind(f,F)}else{window.setTimeout(F,t)}D.each(function(){if(t>0){this.style[q.transition]=E}k(this).css(z)})};var v=function(F){this.offsetWidth;r(F)};m(D,w,v);return this};function n(s,r){if(!r){k.cssNumber[s]=true}k.transit.propertyMap[s]=q.transform;k.cssHooks[s]={get:function(v){var u=k(v).css("transit:transform");return u.get(s)},set:function(v,w){var u=k(v).css("transit:transform");u.setFromString(s,w);k(v).css({"transit:transform":u})}}}function c(r){return r.replace(/([A-Z])/g,function(s){return"-"+s.toLowerCase()})}function o(s,r){if((typeof s==="string")&&(!s.match(/^[\-0-9\.]+$/))){return s}else{return""+s+r}}function l(s){var r=s;if(k.fx.speeds[r]){r=k.fx.speeds[r]}return o(r,"ms")}k.transit.getTransitionValue=g})(jQuery);
(function(d){var p={},e,a,h=document,i=window,f=h.documentElement,j=d.expando;d.event.special.inview={add:function(a){p[a.guid+"-"+this[j]]={data:a,$element:d(this)}},remove:function(a){try{delete p[a.guid+"-"+this[j]]}catch(d){}}};d(i).bind("scroll resize",function(){e=a=null});!f.addEventListener&&f.attachEvent&&f.attachEvent("onfocusin",function(){a=null});setInterval(function(){var k=d(),j,n=0;d.each(p,function(a,b){var c=b.data.selector,d=b.$element;k=k.add(c?d.find(c):d)});if(j=k.length){var b;
if(!(b=e)){var g={height:i.innerHeight,width:i.innerWidth};if(!g.height&&((b=h.compatMode)||!d.support.boxModel))b="CSS1Compat"===b?f:h.body,g={height:b.clientHeight,width:b.clientWidth};b=g}e=b;for(a=a||{top:i.pageYOffset||f.scrollTop||h.body.scrollTop,left:i.pageXOffset||f.scrollLeft||h.body.scrollLeft};n<j;n++)if(d.contains(f,k[n])){b=d(k[n]);var l=b.height(),m=b.width(),c=b.offset(),g=b.data("inview");if(!a||!e)break;c.top+l>a.top&&c.top<a.top+e.height&&c.left+m>a.left&&c.left<a.left+e.width?
(m=a.left>c.left?"right":a.left+e.width<c.left+m?"left":"both",l=a.top>c.top?"bottom":a.top+e.height<c.top+l?"top":"both",c=m+"-"+l,(!g||g!==c)&&b.data("inview",c).trigger("inview",[!0,m,l])):g&&b.data("inview",!1).trigger("inview",[!1])}}},250)})(jQuery);

/*
	Masked Input plugin for jQuery
	Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
	Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
	Version: 1.3.1
*/
(function(e){function t(){var e=document.createElement("input"),t="onpaste";return e.setAttribute(t,""),"function"==typeof e[t]?"paste":"input"}var n,a=t()+".mask",r=navigator.userAgent,i=/iphone/i.test(r),o=/android/i.test(r);e.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},dataName:"rawMaskFn",placeholder:"_"},e.fn.extend({caret:function(e,t){var n;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof e?(t="number"==typeof t?t:e,this.each(function(){this.setSelectionRange?this.setSelectionRange(e,t):this.createTextRange&&(n=this.createTextRange(),n.collapse(!0),n.moveEnd("character",t),n.moveStart("character",e),n.select())})):(this[0].setSelectionRange?(e=this[0].selectionStart,t=this[0].selectionEnd):document.selection&&document.selection.createRange&&(n=document.selection.createRange(),e=0-n.duplicate().moveStart("character",-1e5),t=e+n.text.length),{begin:e,end:t})},unmask:function(){return this.trigger("unmask")},mask:function(t,r){var c,l,s,u,f,h;return!t&&this.length>0?(c=e(this[0]),c.data(e.mask.dataName)()):(r=e.extend({placeholder:e.mask.placeholder,completed:null},r),l=e.mask.definitions,s=[],u=h=t.length,f=null,e.each(t.split(""),function(e,t){"?"==t?(h--,u=e):l[t]?(s.push(RegExp(l[t])),null===f&&(f=s.length-1)):s.push(null)}),this.trigger("unmask").each(function(){function c(e){for(;h>++e&&!s[e];);return e}function d(e){for(;--e>=0&&!s[e];);return e}function m(e,t){var n,a;if(!(0>e)){for(n=e,a=c(t);h>n;n++)if(s[n]){if(!(h>a&&s[n].test(R[a])))break;R[n]=R[a],R[a]=r.placeholder,a=c(a)}b(),x.caret(Math.max(f,e))}}function p(e){var t,n,a,i;for(t=e,n=r.placeholder;h>t;t++)if(s[t]){if(a=c(t),i=R[t],R[t]=n,!(h>a&&s[a].test(i)))break;n=i}}function g(e){var t,n,a,r=e.which;8===r||46===r||i&&127===r?(t=x.caret(),n=t.begin,a=t.end,0===a-n&&(n=46!==r?d(n):a=c(n-1),a=46===r?c(a):a),k(n,a),m(n,a-1),e.preventDefault()):27==r&&(x.val(S),x.caret(0,y()),e.preventDefault())}function v(t){var n,a,i,l=t.which,u=x.caret();t.ctrlKey||t.altKey||t.metaKey||32>l||l&&(0!==u.end-u.begin&&(k(u.begin,u.end),m(u.begin,u.end-1)),n=c(u.begin-1),h>n&&(a=String.fromCharCode(l),s[n].test(a)&&(p(n),R[n]=a,b(),i=c(n),o?setTimeout(e.proxy(e.fn.caret,x,i),0):x.caret(i),r.completed&&i>=h&&r.completed.call(x))),t.preventDefault())}function k(e,t){var n;for(n=e;t>n&&h>n;n++)s[n]&&(R[n]=r.placeholder)}function b(){x.val(R.join(""))}function y(e){var t,n,a=x.val(),i=-1;for(t=0,pos=0;h>t;t++)if(s[t]){for(R[t]=r.placeholder;pos++<a.length;)if(n=a.charAt(pos-1),s[t].test(n)){R[t]=n,i=t;break}if(pos>a.length)break}else R[t]===a.charAt(pos)&&t!==u&&(pos++,i=t);return e?b():u>i+1?(x.val(""),k(0,h)):(b(),x.val(x.val().substring(0,i+1))),u?t:f}var x=e(this),R=e.map(t.split(""),function(e){return"?"!=e?l[e]?r.placeholder:e:void 0}),S=x.val();x.data(e.mask.dataName,function(){return e.map(R,function(e,t){return s[t]&&e!=r.placeholder?e:null}).join("")}),x.attr("readonly")||x.one("unmask",function(){x.unbind(".mask").removeData(e.mask.dataName)}).bind("focus.mask",function(){clearTimeout(n);var e;S=x.val(),e=y(),n=setTimeout(function(){b(),e==t.length?x.caret(0,e):x.caret(e)},10)}).bind("blur.mask",function(){y(),x.val()!=S&&x.change()}).bind("keydown.mask",g).bind("keypress.mask",v).bind(a,function(){setTimeout(function(){var e=y(!0);x.caret(e),r.completed&&e==x.val().length&&r.completed.call(x)},0)}),y()}))}})})(jQuery);
