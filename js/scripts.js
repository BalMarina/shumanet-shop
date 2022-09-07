var FULL = 1550;
var DESKTOP = 1379;
var TABLET = 1023;
var PHONE = 767;
var animLength = 400;


function update_basket_groups_quantity () {
	var postData = {};
	$('.cart-header-count input').each (function () {
		let $t = $(this);
		postData['GROUPS_QUANTITY-' + $t.data('id')] = $t.val();
	});
	$.ajax({
		type: 'POST',
		url: '/ajax/update_basket_groups_quantity.php',
		dataType: 'html',
		cache: false,
		data: postData,
		success: function(data) {
			if (data == 1) {
				console.log('success ' + data);
			}
		},
		fail: function (data){
			console.log ('fail' + data);
		}
	});
}

function number_format(number, decimals, dec_point, thousands_sep ) {	// Format a number with grouped thousands

	var i, j, kw, kd, minus = "";
	number = number.toString().replace(/\s/ig, '');
	
	if(number < 0){
		minus = "-";
		number = number*-1;
	}
	// input sanitation & defaults
	if( isNaN(decimals = Math.abs(decimals)) ){
		decimals = 2;
	}
	if( dec_point == undefined ){
		dec_point = ".";
	}
	if( thousands_sep == undefined ){
		thousands_sep = " ";
	}
	i = parseInt(number = (+number || 0).toFixed(decimals)) + "";
	kw = i.split( /(?=(?:\d{3})+$)/ ).join( thousands_sep );
	kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

	return minus + kw + kd;
}

(function ($) {
    $(document).ready(function () {

	$('label').click (function (e){
		if ($(this).hasClass('disabled')){
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	});

    $('body').on('click', '.expand-parent', function(e){
        e.preventDefault();
        $(this).find('a').toggleClass('is-open');
        $(this).next().toggleClass('tab-content-active');

    });

	// Глюк при переключении доставки в корзине:
	$('#order_form_div').on("click", 'div.radioArea', function() {
		// alert('1');
		if(!$(this).parent().parent().hasClass('payment-list')) {
			// alert('2');
			$('#CURRENT_STEP').val('1');submitForm();
		}
	});
	$('#order_form_div').on("keyup", '#INN', function() {
		var inn = $(this).val();
		if(inn.indexOf(' ') + 1) {
			inn = inn.replace(/\s+/g,'');
			$(this).val(inn);
		}
	});

	//Каталог сортировка:
	$(".actions-list.catalog-sort-list a").click(function(){
		let $this = $(this);
		if(!$this.closest('li').hasClass('is-active')) {
			url = '/ajax/change_catalog_sort.php?ajax_query=Y&sort=' + $this.data('sort') + '&order=' + $this.data('order');
			$.ajax({
			  type: "GET",
			  url: url,
			  dataType: "html",
			  success: function(out){
			  	if (out == 1) {
					window.location.reload();
				}
			  }
			});
			return false;
		}
	});

	//Страница витрины - обработка "В сравнение":
	$("a.add2compare, .js-delete-compare").click(function() {
		$this = $(this);
		url = $this.attr('href') + '&ajax_query=Y';
		window.clicked = $this;
		$.ajax({
			type: "GET",
			url: url,
			dataType: "html",
			success: function (out) {
				out = out.split('|||');
				id = parseInt(out.pop());
				if (!$this.hasClass('js-delete-compare')) {
					$('.compare_quantity').text(out);
					$('.product-top-compare__count, .product-top-compare  .js_compare_quantity').text(out);
					$('.compare' + id).hide();
					$('.div-compare' + id).show();
				} else {
					$('.compare' + id).show().removeClass('is-active').attr('href', $('.compare' + id).data('href'));
					$('.div-compare' + id).hide();
					$('.product-top-compare__count, .product-top-compare  .js_compare_quantity').text(out);
				}
			}
		});
		return false;
	});

	$('.catalog-item-compare.product-top-compare').on('click touchend',function (e) {
		$target = $(e.target);
		if (!$target.closest('.list-info').length && !$(this).hasClass('add2compare')) {
			if (e.type == 'click') {
				window.location.href = $(this).attr('href');
			} else if (e.type == 'touchend') {
				e.stopPropagation();
				e.preventDefault();
			}
		}
	});

	// Удаление элемента из сравнения:
	$(".compare-block-buttons .delete-button").click(function() {
		if($(this).attr("href")) {
		  window.clicked = $(this);
		  $.ajax({
			type: "GET",
			url: $(this).attr("href")+'&ajax_query=Y',
			dataType: "html",
			success: function(out){
				window.clicked.parent().prev().removeClass('is-active');
			}
		  });
		}
		return false;
	});

	$('.js-add-name').click(function () {
		$('.overlay-add-name').fadeIn();
		// alert($(this).attr('rel'));
		$('.add-name-button').attr('rel',$(this).attr('rel'));
		return false;
	});

	//Перенос значений href в rel, для совместной работы ajax и no-javascript:
	buy_btns = $('a[href*="ADD2BASKET"]');
	buy_btns.each(
		function(){
		  $(this).attr("rel", $(this).attr("href")+'&ajax_query=Y');
		}
	);
	buy_btns.attr("href","javascript:void(0);");

	//Передача значения количества в ссылку "В корзину":
	function change_link_quantity (that){
	    if (!that.closest('#basket_form').length && !that.closest('.quick-group__item-count').length) {
            id = that.attr("id");
            id = id.substring(8);
            addurl = $('.addlink' + id).attr("rel");
            qpos = addurl.indexOf('&quantity');
            if (qpos > 0) {
                addurl = addurl.substring(0, qpos);
            }
            $('.addlink' + id).attr("rel", addurl + '&quantity=' + that.val());
        } else if (that.closest('.quick-group__item-count').length){
	        that.trigger('change');
        }
	}

	//Добавление в корзину:
	$(document).on("click", 'a[rel*="ADD2BASKET"]', function() {
	// $('a[rel*="ADD2BASKET"]').click(
	// function(event){
	  if($(this).attr("rel")) {
		$(this).css({"opacity":"0.5","cursor":"wait"});
		if($(this).hasClass('add-name-button')) {
			window.clicked = $('.js-add-name');
			//hde begin
			if(!$('.add-name-input').val())
				$('.add-name-input').val($('.add-name-input').attr('placeholder'));
			//hde end
			$(this).attr("rel",$(this).attr("rel")+'&title='+$('.add-name-input').val()+' ('+$('#estimate-count').val()+' м2)');
		}
		else {
			window.clicked = $(this);
		}
		if($(this).closest('.js-catalog-item-buy').find('.product-item-count').length) {
			$(this).attr("rel",$(this).attr("rel")+'&quantity='
                + $(this).closest('.js-catalog-item-buy').find('.product-item-count').val());
		}
		$.ajax({
		  type: "GET",
		  url: $(this).attr("rel"),
		  dataType: "html",
		  success: function(out){
		    out = out.split('|||');
		    id = parseInt(out.pop());

		    if(id == 1) {
		  	  photo = window.clicked.closest('.tab-content').find(".est-table-info img");
		    }
		    else if(id) {
			  photo = window.clicked.closest('.catalog-item_list.l-table').find(".catalog-item-image img");
		    }
			if(!photo.length) {
			  photo = window.clicked.closest('.product-card-main').find(".gallery-item.is-active img");
			}
			if(photo.length) {
				photo.each(function(index,value){//it will be only one photo
				  $(value)
					.clone()
					.css({'marginTop' : (0-$('#bx-panel').height())+'px', 'position' : 'absolute', 'z-index' : '1000', 'top' : $(value).offset().top+'px', 'left' : $(value).offset().left+'px'})
					.appendTo('#wrapper')
					.animate({
						  opacity: 0.7,
						  marginTop: ($('#basket-block').offset().top.toFixed()-$(value).offset().top+35),
						  marginLeft: ($('#basket-block').offset().left.toFixed()-$(value).offset().left+85),
						  width: 50,
						  height: 50}, 1000, function() {
					  $(this).remove();
				  });
				});
			}
			baskethtml = out.pop();
              if(baskethtml) {
                $('#basket-block').removeClass('empty').addClass('full').html(baskethtml);
              }

			if($('.addlink'+id).hasClass('smallbutton') || $('.addlink'+id).hasClass('search2basket')) {
				if(!$('.addlink'+id).hasClass('product-item-buy'))
					$('.addlink'+id).html('Добавлено');
			}
			$('.addlink'+id).addClass('is-active').attr('href','/personal/cart/').css({"opacity":"","cursor":""}).attr('rel','');

			// alert
			// window.clicked.removeClass('.js-add-name');
			$('.overlay').fadeOut();
		  }
		});
	  }
	});

	// Форма авторизации:
	$("#auth-div-popup").on('click',"input[type='submit']",function(){
		$.post( "/ajax/auth.php", $("#system_auth_form_popup").serialize(), function(data) {
			if(data == 'OK')
				window.location.reload();
			else
				$('#auth-div-popup').html(data);
		});
		return false;
	});
	$("#reg-div-popup").on('click',"input[type='submit']",function(e){

	$.post( "/ajax/reg.php", $("#system_reg_form_popup").serialize(), function(data) {
		//console.log('+');
			if(data == 'OK')
				window.location.reload();
			else {
				$('#reg-div-popup').html(data);
              Recaptchafree.reset();
            }
		});


		return false;
	});

        $(document).scroll(function () {
            var w = window.innerWidth;
            var bodyOffset = window.pageYOffset;
            if ($('.cab-save').length) {
                var footerOffset = document.querySelector('.footer').getBoundingClientRect().top;
                var saveOffset = window.innerHeight;
                if (saveOffset > footerOffset) {
                    $('.cab-save').addClass('pinned');
                } else {
                    $('.cab-save').removeClass('pinned');
                }
            }
        });

        if ($(".slider-range").length) {
            $(".slider-range").each(function () {
                $slider = $(this).parent();

                var min = parseInt($slider.find('.min').val());
                var max = parseInt($slider.find('.max').val());

                var $slider_min = $slider.find(".min-current");
                var $slider_max = $slider.find(".max-current");

                var minCurrent = $slider_min.val();
                var maxCurrent = $slider_max.val();

                var slider = $(this).slider({
                    range: true,
                    min: min,
                    max: max,
                    values: [minCurrent, maxCurrent],
                    slide: function (event, ui) {
                        $slider_min.val(ui.values[0]);
                        $slider_max.val(ui.values[1]);

                    }
                });

                $slider.find('.slider-current-value').on('input', function () {
                    function isMinVal($el) {
                        return $el.hasClass('min-current');
                    }

                    this.value = this.value.replace(/[^\d]/g, '');

                    if (isMinVal($(this))) {
                        min = Math.max(min, minCurrent);
                    } else {
                        max = Math.min(max, maxCurrent);
                    }

                    if (maxCurrent < minCurrent) {
                        if (isMinVal($(this))) {
                            minCurrent = maxCurrent;
                        } else {
                            maxCurrent = minCurrent;
                        }
                    }

                    $slider_min.val(min);
                    slider_max.val(max);
                    slider.slider("values", [minCurrent, maxCurrent]);
                });
            });
        }



        function zoomVideo() {
            var $iframe, ratio, w, h;
            $('.video-wrapper').each(function () {
                if ($(this).find('iframe').length) {
                    $iframe = $(this).find('iframe');
                    ratio = $iframe.attr("width") / $iframe.attr("height");
                    w = $iframe.width();
                    h = w / ratio;
                    $iframe.css('height', h);
                }
            });
        }

        function change_group_quantity($this,q,nvalue = 'n') {
			let old_val = parseInt($this.closest('.cart-header-count').find('input').val()),
				last_id,
				new_group_input_val = old_val + q;
			if (q != 0 && old_val != 0 && new_group_input_val != 0) {
				if (nvalue == 'y') {
					new_group_input_val = q;
					old_val = $this.data('oldval');
				}
				$this.closest('.cart-group').find('.cart-body input').each(function () {
					let $input = $(this),
						new_val = parseInt($input.val()) * new_group_input_val / old_val;
					last_id = $input.data('id');
					$('#QUANTITY_INPUT_' + $input.data('id')).val(new_val);
					BX('QUANTITY_' + last_id).value = new_val;
					$input.val(new_val);
				});
				$this.closest('.cart-header-count').find('input').val(new_group_input_val);
				$this.closest('.cart-header-count').find('input').data('oldval',new_group_input_val);
				$('#QUANTITY_INPUT_' + last_id).trigger('change');
				update_basket_groups_quantity();
			}
		}


        $('body').on('click', '.js-show-fulltext', function (e) {
            e.preventDefault();
            $(this).hide().parent().find('.js-fulltext').addClass('is-open');

        });

        $('body').on('click', '.js-plus', function (e) {
        	let $this = $(this);
        	e.preventDefault();
        	if ($this.closest('.cart-header-count').length) {
        		change_group_quantity ($this,1);
			} else {
				var $input = $this.parent().find('.js-input');
				$input.val(1 + parseInt($input.val()));
				change_link_quantity($input);
			}
        });

        $('body').on('click', '.js-minus', function (e) {
        	let $this = $(this);
        	e.preventDefault();
        	if ($this.closest('.cart-header-count').length) {
        		change_group_quantity ($this,-1);
			} else {
				var $input = $this.parent().find('.js-input');
				if (!$input.closest('.quick-group__item-count').length) {
					$input.val($input.val() - 1 > 1 ? $input.val() - 1 : 1);
				} else {
					$input.val($input.val() - 1 >= 1 ? $input.val() - 1 : 0);
				}
				change_link_quantity($input);
			}
        });

        $('.js-group-number').on('input', function () {
        	let $this = $(this);
            change_group_quantity ($this,$this.val(),'y');
        });

        $('body').on('input', '.js-number', function () {
            $(this).val($(this).val().replace(/[^.\d]+/g, "").replace(/^([^\.]*\.)|\./g, '$1'));
                change_link_quantity($(this));
        });

        $('.js-expand').click(function (e) {
            if (e.target.nodeName != 'SPAN') {
                $(this).toggleClass('is-open').find('ul').slideToggle(300);
                if ($(e.target).closest('.t-arrow-down').length) {
                    e.preventDefault();
                    return false;
                }
            }
        });

        $('.js-solution-link').hover(function (e) {
            $('.js-solution-num').eq($(this).closest('li').index()).addClass('hover');
        }, function () {
            $('.js-solution-num').eq($(this).closest('li').index()).removeClass('hover');
        });

        $('.js-solution-num').hover(function (e) {
            $('.solution-parts > li').eq($(this).index()).find('.js-solution-link').addClass('hover');
        }, function () {
            $('.solution-parts > li').eq($(this).index()).find('.js-solution-link').removeClass('hover');
        });


        $('.js-toggle').click(function (e) {
            e.preventDefault();
            $(this).toggleClass('is-closed');
            $(this).closest('.js-block').find('.js-expandable').slideToggle();
            initCustomForms();
        });

        var menuTimeout,
            menuIndex = null;

        $('.header-menu-left > li').on('mouseover', function (e) {
            menuIndex = $(this).index();
            var $that = $(this);
            menuTimeout = setTimeout(function(){
                var w = getWidth();
                if (w > PHONE) {
                    $that.addClass('is-active').siblings().removeClass('is-active');
                    $('.header-menu-right-block').eq($that.index()).slideDown().siblings().slideUp();
                }
            }, 200);
        });

        $('.header-menu-left > li').on('mouseout', function (e) {
            if (menuIndex == $(this).index() && menuTimeout ) {
                clearTimeout(menuTimeout);
                menuIndex = null;
            }
        });

        $('body').on('click', '.catalog-type-link', function (e) {
            $(this).addClass('active').siblings().removeClass('active');
            if ($(this).hasClass('catalog-type-link-right')) {
                $('.catalog-type').addClass('catalog-type-right');
            } else {
                $('.catalog-type').removeClass('catalog-type-right');
            }

            if ($(this).hasClass('solution-type-link')) {
                if ($(this).hasClass('js-show-slider')) {
                    $('.solution-slider').slideDown();
                    $('.solution-info').slideUp();
                } else {
                    $('.solution-slider').slideUp();
                    $('.solution-info').slideDown();
                }

            }
        });


        $('body').on('click', '.l-tabs > li > a', function (e) {


            var $list = $(this).parents('.l-tabs');

            if ($list.hasClass('no-tabs')) {
                return true;
            }

            e.preventDefault();
            var $tabs = $list.parent().parent().find('.tabs-container');


            $list.find('.active-tab').removeClass('active-tab');
            $tabs.find('.tab-content').removeClass('tab-content-active').eq($(this).parent().index()).addClass('tab-content-active');
            $(this).parent().addClass('active-tab');
            $(window).trigger('resize');
            //initScrolls('.js-scroll');

            return false;
        });
		
		$('.solution-calc').click(function (e) {
			e.preventDefault ();
            $('html, body').stop().animate({
                scrollTop: $('#estimate').offset().top
            }, 500);
            $('#estimate').click();
        });
		
		function estimateCalc() {

				function setPrice($element, val) {
						$element.html(number_format(val));
				}

				function getPrice($element) {
						p = parseFloat($element.html().replace(/\s/ig, ''));
						return p;
				}

				var price,
				rate,
				sum,
				all = 0;
				var count = parseFloat($('#estimate-count').val()).toFixed(2);
				var addstr = '?action=ADD2BASKET&ajax_query=Y';
				$('.materials-table').each(function () {
						var total = 0;
						var tab = $(this);
						$(this).find('.estimate-price').each(function (i, e) {
								price = getPrice($(this));
								rate = parseFloat(tab.find('.estimate-rate').eq(i).html());
								measureRatio = parseFloat(tab.find('.measure_ratio').eq(i).html());
								//console.log(price);
								//console.log(rate);
								//console.log(measureRatio);
								var rateCount = Math.ceil(parseFloat(rate * count * 1.05) / measureRatio) * measureRatio;
								material_id = $(this).attr('rel');
								if ((measureRatio < 1) || (!Number.isInteger(measureRatio)))
									rateCount = parseFloat(rateCount).toFixed(1);
								if (measureRatio < 0.1)
									rateCount = parseFloat(rateCount).toFixed(2);
								tab.find('.estimate-total-rate.etr' + material_id).html(rateCount);
								addstr = addstr + '&id[]=' + material_id + '&q[]=' + Math.ceil(rateCount);
								sum = parseFloat(parseFloat(rateCount) * price).toFixed(2);
								setPrice(tab.find('.estimate-total.et' + material_id), sum);
								total += getPrice(tab.find('.estimate-total.et' + material_id));
								//console.log(total);
						});
						var $total = $(this).parent().next().find('.materials-item-total-value');
						setPrice($total, total);
						all += total;
				});
				var $all = $('.materials-item-total-value');
				setPrice($all, all);
				//console.log(all);
				$('.materials-add-button').attr('rel', addstr);
		}		
		
		$('#estimate-count').bind("keyup", function () { //change keyup input click
			this.value = this.value.replace(/,/, '.');
			this.value = this.value.replace(/\.(?=.*\.)|[^\d\.]/g, '');
			estimateCalc();
			$('.total-square').html(this.value);
			let url = new URL($('.button-pdf').attr('href'), document.location.protocol+document.location.host+document.location.pathname);
			url.searchParams.set('m',this.value);
			url.searchParams.delete('analog[]');
			$('.est-row .estimate-price').each(function(){
				if ($(this).attr('rel') != $(this).attr('data-base')) {
					let bid = $(this).attr('data-base');
					let aid = $(this).attr('rel');
					url.searchParams.append('analog[]',`${bid},${aid}`);
				}
			});
			$('.button-pdf').attr('href', url);
		});
		
		$('.js-analog-choose').click(function () {
			$m = $('#material-'+$(this).attr('rel'));
			$m.find('.est-table-info img').attr('src',$(this).attr('image'));
			$m.find('.est-table-info-text-link').attr('href',$(this).attr('link'));
			$m.find('.est-table-info-text-link').html($(this).attr('aname'));
			$m.find('.catalog_measure_name').html($(this).attr('mname'));
			
			$m.find('.materials-item-img img').attr('src',$(this).attr('image'));
			$m.find('a.materials-item-img').attr('href',$(this).attr('link'));
			$m.find('.materials-item-name a').attr('href',$(this).attr('link'));
			$m.find('.materials-item-name a').html($(this).attr('aname'));
			$m.find('.materials-item-measure').html($(this).attr('mname'));
			
			mid = $m.find('.estimate-price').attr('rel');
			bid = $m.find('.estimate-price').attr('data-base');
			aid = $(this).attr('aid');
			
			$m.find('.estimate-price').attr('rel',aid);
			$m.find('.estimate-total-rate').removeClass('etr'+mid).addClass('etr'+aid);
			$m.find('.estimate-total').removeClass('et'+mid).addClass('et'+aid);
			$m.find('.estimate-price').html($(this).closest('.analogs-item').find('.analogs-item-price__val span').html());
			$m.find('.estimate-rate').html($(this).attr('rate'));
			$m.find('.measure_ratio').html($(this).attr('mr'));
			estimateCalc();

			let url = new URL($('.button-pdf').attr('href'), document.location.protocol+document.location.host+document.location.pathname);
			let params = [];
			if(!!url.searchParams.getAll('analog[]').length) {

				let analog = [];
				url.searchParams.getAll('analog[]').forEach(function(item) {
					let ar = item.split(',');
					let pair = {base:ar[0],analog:ar[1]};
					analog.push(pair);
				});
				url.searchParams.delete('analog[]');
				let flag = true;
				analog.forEach(function(obj) {
					if ((obj.base == bid) && (obj.base != aid)) {
						url.searchParams.append('analog[]',`${obj.base},${aid}`);
						flag = false;
					} else if (obj.base != aid){
						url.searchParams.append('analog[]',`${obj.base},${obj.analog}`);
					}
				});
				if (flag && (bid != aid))
					url.searchParams.append('analog[]',`${bid},${aid}`);

			} else {
				if (bid != aid)
					url.searchParams.set('analog[]',`${bid},${aid}`);
				else
					url.searchParams.delete('analog[]');
			}
			$('.button-pdf').attr('href', url);

            $(this).closest('.analogs').find('.analogs-item.analogs-item_checked .icon-svg').attr("class", "icon-svg icon-payed d-none");
            $(this).closest('.analogs').find('.analogs-item.analogs-item_checked').removeClass('analogs-item_checked');
            $(this).parents('.analogs-item').addClass('analogs-item_checked');
            $(this).parents('.analogs-item').find('.icon-svg').attr("class", "icon-svg icon-payed");
            
			$('.overlay').fadeOut();
            return false;
        });
		
		//Кнопки "Выгрузить в PDF" и "Переслать на e-mail" на странице решения
		$('#calc-email-send').click(function(){
			$('.overlay-calc-email .popup-body').css({"opacity":"0.5","cursor":"wait"});
			var e = '';
			if($(this).attr('name') == 'calc-email-send')
				e = $('#calc-email-input').val();
			let url = new URL($('.button-pdf').attr('href'), document.location.protocol+document.location.host+document.location.pathname);				
			$.ajax({
				type: 'POST',
				url: '/ajax/solution-calc.php',
				dataType: 'html',
				cache: false,
				data: {id: $('#solution-id').val(), m: $('#estimate-count').val(), email: e, analog:url.searchParams.getAll('analog[]')},
				success: function(data) {
					$('.overlay-calc-email .popup-header-text').remove();
					$('.overlay-calc-email .popup-body').html('<h2>'+data+'</h2>').css({"opacity":"","cursor":""});
				}
			});
			return false;
		});
        $('.button-email').click(function() {
            $('.overlay-calc-email').fadeIn();
            return false;
        });		
		


        function setInput($element) {
            if ($element.hasClass('hasLabel')) {
                $element.addClass('dirty');
                return;
            }

            var placeholder = $element.attr('placeholder');

            if (placeholder == undefined) return;
            var $parent = $element.parent();
            $parent.css('position', 'relative').find('.note').remove();

            if (placeholder && $element.val().length) {
                var style = "padding-top:" + $parent.css('paddingTop') + ";" + "padding-left:" + $parent.css('paddingLeft') + ";";
                $element.addClass('dirty');
                $parent.append('<div class="note" style="' + style + ';">' + placeholder + '</div>');

            } else {
                $element.removeClass('dirty');
            }
        }

        $('.form-list input, .form-list textarea').keyup(function () {
            setInput($(this));
        });

        function forceSetInput() {
            $('.form-list input, .form-list textarea').each(function () {
                setInput($(this));
            });
        }

        forceSetInput();


        $('input, textarea').blur(function () {
            var $element = $(this);
            setTimeout(function () {
                if (!$element.val().length && !$element.hasClass('hasLabel')) {
                    $element.removeClass('dirty');
                    $element.parent().css('position', 'relative').find('.note').remove();
                }
            }, 100);
        });




        var leftMenuTop = 63;
        $('.header-menu-left > li.parent').on('click', function (e) {
            var w = getWidth();
            if (w <= PHONE) {

                function openMenuFirstLevel() {
                    $('.menu-header').slideUp();

                    $(this).addClass('is-open').siblings().slideUp();

                    $('.header-menu-left').addClass('is-open').animate({
                        top: leftMenuTop - 62
                    }, animLength);
                    $('.header-menu-right').animate({
                        top: leftMenuTop
                    }, animLength);
                }

                function closeMenuFirstLevel() {

                    $('.menu-header').slideDown();

                    $(this).removeClass('is-open').siblings().slideDown();

                    $('.header-menu-left').removeClass('is-open').animate({
                        top: leftMenuTop
                    }, animLength);
                    $('.header-menu-right').animate({
                        top: '100%'
                    }, animLength);
                }

                $('.header-menu-right-block').eq($(this).index()).addClass('is-active').siblings().removeClass('is-active');

                if (!$(this).hasClass('is-open')) {
                    if (e.target.tagName == 'A') return true;
                    openMenuFirstLevel.call(this);
                } else {
                    closeMenuFirstLevel.call(this);
                }

            }

        });

        $('.header-menu-first > li.parent').on('click', function (e) {

            var w = getWidth();
            if (w <= PHONE) {

                function openMenuSecondLevel() {
                    $(this).addClass('is-open').siblings().slideUp();
                    $('.header-menu-left').slideUp();
                    $('.header-menu-right').css({
                        position: 'relative'
                    }).animate({
                        top: leftMenuTop - 62
                    }, animLength);
                    $(this).find('.header-menu-second').slideDown();
                }

                function closeMenuSecondLevel() {
                    $('.header-menu-left').slideDown();
                    $(this).removeClass('is-open').siblings().slideDown();
                    $('.header-menu-right').css({
                        position: 'absolute'
                    }).animate({
                        top: leftMenuTop
                    }, animLength);
                    $(this).find('.header-menu-second').slideUp();
                }

                if (!$(this).hasClass('is-open')) {
                    if (e.target.tagName == 'A') return true;
                    openMenuSecondLevel.call(this);
                } else {
                    closeMenuSecondLevel.call(this);
                }
            }
        });
        
        
        
        $('body').on('click', '.mobile .topmenu-parent', function (e) {

            var w = getWidth();
          

                function openTopMenuSecondLevel() {
                    console.log('copy?');
                    
                    $(this).addClass('is-open').siblings().slideUp();
                //    $(this).animate()
                    
                    $(this).find('.topmenu-submenu').slideDown();
                    
                    
                    $(this).css({
                        position: 'relative'
                    }).animate({
                        top:  -40
                    }, animLength);
                    
                    $('.mobile-topmenu').addClass('opened');
                    
                }

                function closeTopMenuSecondLevel() {
                  //  $('.header-menu-left').slideDown();
                    $(this).removeClass('is-open').siblings().slideDown();
                    $(this).find('.topmenu-submenu').slideUp();
                    
                    $(this).css({
                        position: 'relative'
                    }).animate({
                        top:  0
                    }, animLength);
                    
                    $('.mobile-topmenu').removeClass('opened');
                }

                if (!$(this).hasClass('is-open')) {
                    if (e.target.tagName == 'A') return true;
                    openTopMenuSecondLevel.call(this);
                } else {
                    closeTopMenuSecondLevel.call(this);
                }
           
        });


        $('.js-show-phone').click(function (e) {
            e.preventDefault();
            $('.header-phone-left').slideToggle();
        });





        function closeMenu(fast) {
            $('.catalog-button').removeClass('is-active');
            $('.header-menu').slideUp();

            if (fast) {
                $('.header').removeClass('is-menu-open');
            } else {
                $('#overlay').animate({
                    'top': '100%'
                }, 500, function () {
                    $('.header').removeClass('is-menu-open');
                });
            }
        }

        function openMenu() {
        	$('.js-menu-close').trigger ('click');
            $('.catalog-button').addClass('is-active');
            $('.header').addClass('is-menu-open');
            $('#overlay').stop().show().css({
                top: '100%',
                bottom: '0'
            }).animate({
                'top': 0
            }, 500);
            $('.header-menu').slideDown();
			$('.bx-filter-popup-result').hide();
        }

        function openMobile(selector, auto) {
            $('body').css('overflow','hidden');
            
            var w = getWidth();

            if (auto) {
                $(selector).show().css({
                    'top': 'auto',
                    'bottom': '-100%'
                }).animate({
                    'bottom': 0
                }, 600);
            } else {
                var top = 30;
                if (w <= PHONE) {
                    top = 25;
                }

                $(selector).show().css({
                    'top': '100%'
                }).animate({
                    'top': top
                }, 400);
            }

            $('#overlay').stop().show().css({
                bottom: '100%',
                top: 0
            }).animate({
                'bottom': 0
            }, 500, 'linear');
            $('.bx-filter-popup-result').hide();
        }

        function closeMobile() {
            $('body').css('overflow','initial');
            $('.mobile').animate({
                'top': '100%'
            }, 400);

            $('#overlay').stop().animate({
                'bottom': '100%'
            }, 500);
            $('.bx-filter-popup-result').hide();
        }

        $('.catalog-button').click(function (e) {
            e.preventDefault();
            if ($('.catalog-button').hasClass('is-active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        $('#overlay').click(function (e) {
            if ($('.catalog-button').hasClass('is-active')) {
                closeMenu();
            } else {
                closeMobile();
            }


        });


        $('body').on("touchstart", '.product-top-compare', function(e){
            e.preventDefault();
            $('.product-top-compare').removeClass('active');
            $(this).addClass('active');
        });

        $('body').on("touchstart", function(e){
            if (clickOutside(e, $('.product-top-compare, .list-view'))) {
                $('.product-top-compare').removeClass('active');
            }
        });
        

        $('body').on('click', '.phone-expand > .footer-col-header', function (e) {
            e.preventDefault();
            $(this).toggleClass('is-open').parent().find('.footer-col-body').slideToggle();

        });


        $('body').on('click', '.js-menu-show', function (e) {
            e.preventDefault();
            openMobile('.mobile-topmenu', false);
            closeMenu(true);

        });

        $('body').on('click', '.js-show-mobile-filter', function (e) {
            e.preventDefault();
            openMobile('.mobile-filter', false);
            closeMenu(true);

        });

           $('body').on('click', '.js-menu-close', function (e) {
               e.preventDefault();
               closeMobile();
           });

		$('.js-open-mobile-menu-catalog').click (function (e) {
			$('.catalog-button').trigger ('click');
			e.preventDefault();
		});


        function getClickY(event) {
            var mobileClose = 0;
            console.log(event);
            if (!event.pageX) { //тач
                mobileClose = event.originalEvent.targetTouches[0].pageY;
            } else { // мышь
                mobileClose = event.pageY;
            }
            return mobileClose;
        }

        var mobileClose = 0;

        $('body').on('touchstart mousedown', '.js-menu-close', function (event) {
            event.preventDefault();
            mobileClose = getClickY(event);
        });

        $('body').on('touchmove mousemove', '.js-menu-close', function (event) {
            event.preventDefault();
            if (mobileClose > 0 && getClickY(event) > mobileClose + 10) {
                closeMobile();
                mobileClose = 0;
            }
        });


        $('body').on('click', '.js-like', function (e) {
            e.preventDefault();
            var $svg = $(this).find('svg use');
            $(this).toggleClass('is-active');

            var href = $svg[0].getAttribute('xlink:href');

            var newhref = '';
            if ($(this).hasClass('is-active')) {
                newhref = href.replace('#like', '#likeblue');
            } else {
                newhref = href.replace('#likeblue', '#like');
            }

            $svg[0].setAttribute('href', newhref);

        });


        function getWidth() {
            return window.innerWidth;
        }

        function cutText(text, length) {
            var textArr = text.split(' ');
            var newtext = '';
            for (var i in textArr) {
                if ((newtext + textArr[i]).length > length) {
                    return newtext + "...";
                } else {
                    newtext += " " + textArr[i];
                }
            }
            return newtext;
        }


        function moveItemTo(item, to) {
            if ($(item).length && $(item).closest(to).length == 0) {
                $(item).appendTo(to);
            }
        }

        function moveCabFilters() {
            var w = getWidth();
            var item = '.cab-filters__list';
            if (w <= TABLET) {
                moveItemTo(item, '.mobile-cab-filters');
            } else {
                moveItemTo(item, '.cab-filters');
            }
        }


        function movePhoneMenu() {
            var w = getWidth();
            var item = '.header-bottom-buttons';

            if (w <= PHONE) {
                moveItemTo(item, '.mobile-panel');
            } else {
                if ($(item).length && $(item).closest('.header').length == 0) {
                    $(item).insertAfter('.catalog-button');
                }
            }
        }

        function moveUserMenu() {
            var w = getWidth();
            var item = '.cab-menu2';

            if (w <= PHONE) {
               // moveItemTo(item, '.mobile-cab-menu');
                moveItemTo(item, '.js-cab-menu');
            } else if (w => DESKTOP) {
                moveItemTo(item, '.js-enter');
            }
        }

        function moveSolInfo() {
            var w = getWidth();
            if (w <= PHONE) {
                $('.solution-info').insertAfter('.solution-slider');
            } else {
                $('.solution-info').insertAfter('.solution-right');
            }

        }

        function moveReviewsSort() {
            var w = getWidth();
            if (w <= PHONE) {
                moveItemTo('.product-tabs-reviews-sort', '.mobile-rev-sorts');
                moveItemTo('#api-reviews-filter', '.mobile-rev-filters');
            } else {
                moveItemTo('.product-tabs-reviews-sort', '.api-block-header');
                moveItemTo('#api-reviews-filter', '.api-block-filter');
            }

        }
        
        function moveCatalogSort() {
            var w = getWidth();
            var item = '.catalog-sort-list';
            if (w <= TABLET) {
                moveItemTo(item, '.mobile-catalog-sorts');
            } else {
                moveItemTo(item, '.catalog-sort');
            }
        }
        
        function moveCitiesList() {
            var w = getWidth();
            var item = '#region-select';
            if (w <= PHONE ) {
                moveItemTo(item, '.mobile-cities');
            } else {
                moveItemTo(item, '.header-city');
            }
        }


        function resetState() {

            console.log('resetState?');

            var w = getWidth();
            zoomVideo();

            moveUserMenu();
            moveCabFilters();
            movePhoneMenu();
            moveSolInfo();
            moveReviewsSort();
            moveCatalogSort();
            moveCitiesList();

            setEqualHeight($('.js-carousel'), '.catalog-item-name', '.catalog-item-name');
            setEqualHeight($('.js-carousel'), '.catalog-item-image__wrapper', '.catalog-item-image__wrapper');
            
            setEqualHeightGrid('.catalog_grid, .catalog-sol_grid');
            setEqualHeightGrid('.carousel-catalog', '.catalog-item', false);
            setEqualHeightGrid('.js-compare-list', '.catalog-item-name');
            setEqualHeightGrid('.js-compare-list', '.catalog-item-img');
            // setEqualHeight($('.footer'), '.js-footer-body', '.js-footer-body');

            console.log(w);

            /*  if (w < 1550) {
                  $('.carousel-item-name').each(function(){
                      $(this).text(cutText($(this).text(), 50));    
                  });
                  
              } */

            if (w <= DESKTOP) {
                $('.header .header-topmenu').appendTo('.mobile-menus');
                $('.left-column .catalog-filter').appendTo('.mobile-filter .mobile-content');


            } else {
                $('.mobile-menus .header-topmenu').insertAfter('.header-phone');
                $('.mobile-filter  .catalog-filter').prependTo('.left-column');

            }


            if (w <= TABLET) {
                $('.footer-left .footer-col-apps').insertAfter('.footer-col-link');
                if (w > PHONE) {
                    $('.footer-col-email').appendTo('.footer-col-phone');
                } else {
                    $('.footer-col-email').insertAfter('.footer-col-phone');
                }
            } else {
                $('.footer-left-bottom .footer-col-apps').insertAfter('.footer-col-store');
                $('.footer-col-phone .footer-col-email').insertAfter('.footer-col-phone');
            }


            if (w <= PHONE) {
                $('.footer-bottom-menu').insertAfter('.copyright');

                $('.footer-left-bottom .footer-col-phone').appendTo('.footer-left');
                $('.footer-left-bottom .footer-col-email').appendTo('.footer-left');


                $('.footer-col-link').insertAfter('.footer-col-apps');

                $('.catalog-item_list-right .catalog-item-reviews').each(function () {
                    $(this).appendTo($(this).closest('.catalog-item').find('.catalog-item-image'));
                });

                $('.catalog-sol-item_list-buyblock .catalog-sol-item_list-compare').each(function () {
                    $(this).appendTo($(this).closest('.catalog-item').find('.catalog-sol-item_list-image'));
                });

            } else {

                closeMobile();

                if (!$('.footer-bottom-menu').parent().attr('id')) {
                    $('.footer-bottom-menu').appendTo('.footer-bottom > .inner');
                }
                $('.footer-left .footer-col-phone').prependTo('.footer-left-bottom');
                if (w <= TABLET) {
                    $('.footer-col-link').insertBefore('.footer-col-apps');
                } else {
                    $('.footer-left > .footer-col-email').insertAfter('.footer-col-phone');
                }
                //  $('.footer-left-bottom .footer-col-phone').appendTo('.footer-left');

                $('.catalog-item-image .catalog-item-reviews').each(function () {
                    $(this).appendTo($(this).closest('.catalog-item').find('.catalog-item_list-right'));
                });

                $('.catalog-sol-item_list-image .catalog-sol-item_list-compare').each(function () {
                    $(this).appendTo($(this).closest('.catalog-item').find('.catalog-sol-item_list-buyblock'));
                });


            }


            if (w < PHONE) {
                //        $('.header .header-bottom-search').appendTo('.mobile-full-header');
            } else {
                //       $('.mobile-full-header .header-bottom-search').appendTo('.header-bottom-inner');
            }




        }
        resetState();


        function setEqualHeight(element, reset, heights) {
            setTimeout(function () {
                element.each(function(){
                    var w = getWidth();
                    $(this).find(reset).css('height', 'auto');

                    var maxH = [];
                    $(this).find(heights).each(function () {
                        maxH.push($(this).outerHeight());
                    });

                    if (Math.max.apply(null, maxH) == 0) {
                        setEqualHeight($(this), reset, heights);
                    } else {
                        $(this).find(reset).css('height', Math.max.apply(null, maxH));
                    }
                });    
            }, 400);
        }


        $('body').on('click', '.mobile .menu > li.parent > a', function (e) {
            e.preventDefault();
            if ($(this).parent().hasClass('selected')) {
                $(this).parent().removeClass('selected').siblings().slideDown();
                $('.header-topmenu').show();

            } else {
                $(this).parent().addClass('selected').siblings().slideUp();
                $('.header-topmenu').hide();
            }

        });


        $('.js-show-all').click(function (e) {
            e.preventDefault();
            $(this).hide().siblings().slideDown();
        });









        function setEqualHeightGrid(selector, itemsSelector = '.catalog-item', bPerRow = true) {
            setTimeout(function () {
                $(selector).each(function () {
                    var widthAll = $(this).width() - 20;
                    var $items = $(this).find(itemsSelector);
                    var width = $items.height('auto').eq(0).outerWidth();

                    //var w = getWidth();

                    var itemsPerRow = parseInt(widthAll / width);
                    var heights = [];
                    var max = 0;

					var number = 1;
					if (bPerRow) {
						number = Math.ceil($items.length / itemsPerRow);
					} else{
						itemsPerRow = $items.length
					}

                    for (var i = 0; i < number; i++) {
                        for (var j = 0; j < itemsPerRow; j++) {
                            heights.push($items.eq(itemsPerRow * i + j).height());
                        }
                        max = Math.max.apply(null, heights);
                        for (var j = 0; j < itemsPerRow; j++) {
                            $items.eq(itemsPerRow * i + j).height(max);
                        }
                        heights = [];
                    }
                });
            }, 200);
        }

        /*   if ($('.js-carousel').length) {
               $('.js-carousel').each(function(){
                   $(this).slick({
                         draggable: true,
                         accessibility: false,
                         centerMode: false,
                         variableWidth: true,
                         slidesToShow: 1,
                         slidesToScroll:1,
                         arrows: true,
                         dots: true,
                         swipeToSlide: true,
                         infinite: false,
                         outerEdgeLimit: true,
                           prevArrow :'<div class="owl-prev"></div>',
                           nextArrow :'<div class="owl-next"></div>',
                       });
               })
           } */



        /*



                if ($('.js-project-slider').length) {
                    var $project_slider = $('.js-project-slider').owlCarousel({
                        nav: true,
                        dots: true,
                        margin: 0,
                        autoHeight: false,
                        navText: ['', ''],
                        autoplayTimeout: 4000,
                        autoplay: false,
                        rewind: false,
                        items: 1,
                        onChanged: setActiveSlide
                    }).addClass('owl-carousel');

                    var $project_carousel = $('.js-project-carousel').owlCarousel({
                        nav: true,
                        dots: false,
                        margin: 12,
                        autoHeight: false,
                        navText: ['', ''],
                        autoplayTimeout: 4000,
                        autoplay: false,
                        rewind: false,
                        items: 9,
                        responsive: {
                            0: {
                                items: 3,
                                margin: 6,
                            },
                            440: {
                                items: 4,
                            },


                            1000: {
                                items: 5,

                            },

                            1260: {
                                items: 6
                            },

                            1360: {
                                items: 8
                            }
                        },
                        onInitialized: setActiveSlide,
                        onChanged: setActiveSlide

                    }).addClass('owl-carousel');

                    function setActiveSlide(e) {
                        console.log(e);
                        if ($project_carousel) {

                            $project_carousel.find('.owl-item').eq(e.item.index).addClass('selected').siblings().removeClass('selected');
                            if (e.target.classList.contains('js-project-carousel')) {
                                $project_slider.trigger('to.owl.carousel', e.item.index);
                            } else {
                                $project_carousel.trigger('to.owl.carousel', e.item.index);
                            }

                        } else {
                            $('.js-project-carousel').find('.owl-item').eq(0).addClass('selected');
                        }

                    }

                    $('body').on('click', '.js-project-carousel .owl-item', function () {
                        $(this).addClass('selected').siblings().removeClass('selected');
                        $project_slider.trigger('to.owl.carousel', $(this).index());
                    });



                }




        */




        /* function setFeaturesHeight() {
             if ($('.features-list').length) {
                 var maxH = 0;
                 $('.features-list-item').each(function () {
                     if ($(this).height() > maxH) {
                         maxH = $(this).height();
                     }
                 });

                 if (maxH > 0) {
                     $('.features-list-item').height(maxH);
                 } else {
                     setFeaturesHeight();
                 }
             }
         } */



        $(window).resize(function () {
            var w = getWidth();


            resetState();
            // doubleScroll($('.table-wrapper'));
			if(!$('#bx-soa-order-form').length)
				initCustomForms();
        });

        function afterChanges() {
            initCustomForms();
            forceSetInput();
        }

        function doubleScroll($elements) {
            var w = getWidth();
            if (w < TABLET || $elements.eq(0).parent().hasClass('est-block') && w < DESKTOP) {
                if (!$('.d-scroll').length) {
                    $elements.each(function (i, element) {
                        if (element.scrollWidth != 0) {
                            var scrollbar = document.createElement('div');
                            scrollbar.className += 'd-scroll';
                            scrollbar.appendChild(document.createElement('div'));
                            scrollbar.style.overflow = 'auto';
                            scrollbar.style.overflowY = 'hidden';
                            scrollbar.firstChild.style.width = element.scrollWidth + 'px';
                            scrollbar.firstChild.style.paddingTop = '1px';
                            scrollbar.firstChild.appendChild(document.createTextNode('\xA0'));
                            scrollbar.onscroll = function () {
                                element.scrollLeft = scrollbar.scrollLeft;
                            };
                            element.onscroll = function () {
                                scrollbar.scrollLeft = element.scrollLeft;
                            };
                            element.parentNode.insertBefore(scrollbar, element);
                        }
                    });
                }
            } else {
                $('.d-scroll').remove();
            }

        }

        //   doubleScroll($('.table-wrapper'));



        $('body').on('click', '.js-switcher', function (e) {
            e.preventDefault();
            $(this).parents('.side').toggleClass('is-closed');
        });


        function setInput($element) {
            if ($element.hasClass('hasLabel')) {
                $element.addClass('dirty');
                return;
            }

            var placeholder = $element.attr('placeholder');

            if (placeholder == undefined) return;
            var $parent = $element.parent();
            $parent.css('position', 'relative').find('.note').remove();

            if (placeholder && $element.val().length) {
                var style = "padding-top:" + $parent.css('paddingTop') + ";" + "padding-left:" + $parent.css('paddingLeft') + ";";
                $element.addClass('dirty');
                $parent.append('<div class="note" style="' + style + ';">' + placeholder + '</div>');

            } else {
                $element.removeClass('dirty');
            }
        }

        $('.form-list input, .form-list textarea').keyup(function () {
            setInput($(this));
        });

        function forceSetInput() {
            $('.form-list input, .form-list textarea').each(function () {
                setInput($(this));
            });
        }

        forceSetInput();


        $('input, textarea').blur(function () {
            var $element = $(this);
            setTimeout(function () {
                if (!$element.val().length && !$element.hasClass('hasLabel')) {
                    $element.removeClass('dirty');
                    $element.parent().css('position', 'relative').find('.note').remove();
                }
            }, 100);
        });


        $("[name='phone']").mask("+7 (999) 999-99-99");
        $(".cab-profile input[placeholder='Телефон']").mask("+7 (999) 999-99-99");


        $('body').on('click', '.js-expand-tasks', function (e) {
            e.preventDefault();
            $(this).toggleClass('is-open');
            var text = $(this).data('name');
            $(this).data('name', $(this).text());
            $(this).text(text);

            $('.tasks-list-item:not(.tasks-list-item:first-child)').slideToggle();

        });

        function showPopup(className,url='',title = '') {
            $popup = $(className);
            $popup.fadeIn();
            if (url != '') {
            	$.ajax({
					type: "GET",
					url: url,
					dataType: "html",
					beforeSend: function () {
						if (title != '') {
							$popup.find('.popup-header__text').text (title);
						}
						$popup.find('.popup-body').text ('Загрузка...');
					},
					success: function(out){
						$popup.find('.popup-body').html (out);
					},
					error: function (jqXHR, textStatus, errorThrown) {
						$popup.find('.popup-body').text ('Произошла ошибка ' + textStatus + ' , ' + errorThrown);
					}
				})
			}
            afterChanges();
        }


        $('body').on('click', '.js-popup-close', function (e) {
            e.preventDefault();
            $('.overlay').fadeOut();
        });





        $('body').on('click', '.js-price-block-switcher', function (e) {
            e.preventDefault();
            $(this).parents('.price-block').toggleClass('is-inactive');
        });

        $('body').on('click', '.js-filter-block-toggle', function (e) {
            e.preventDefault();
            $(this).parents('.filter-block').toggleClass('is-open');
        });



        $('body').on('click', '.js-notifications-switcher > label', function () {
            var id = $(this).data('id');
            $(this).addClass('active').siblings().removeClass('active');
            $(this).parent().find('.notifications-switcher').attr('data-id', id);
        });

        $('body').on('click', '.js-notifications-switcher > .notifications-switcher', function () {
            var id = 1 - $(this).attr('data-id');
            console.log(id);

            $(this).parent().find('label').not('.active').addClass('active').siblings().removeClass('active');
            $(this).attr('data-id', id);

        });


        function setSliderHeight() {
            var w = getWidth();


            if (w >= TABLET) {
                setTimeout(function () {
                    var height = $('.main-cols-right').outerHeight();
                    $('.js-slider .slider-item').height(height);
                }, 100);
            } else {
                $('.js-slider .slider-item').height('375px');
            }
        }


        function mobileMenu() {
            var w = getWidth();
            if (w >= TABLET) {
                if ($('.mobile-menus .main-menu').length > 0) {
                    $('.main-menu').appendTo('.header-menu');
                }

                $('.footer-menus-item').each(function () {
                    if ($(this).parents('.mobile-footer').length > 0) {
                        $(this).appendTo('.footer-menus');
                    }
                });

                if ($('.mobile-footer .header-phone').length > 0) {
                    $('.header-phone').prependTo('.header > .inner');
                }


                $('.main-menu .parent ul').hide();
                $('.mobile-fullscreen').hide();



            } else {
                if ($('.mobile-menus .main-menu').length == 0) {
                    $('.main-menu').appendTo('.mobile-menus');
                }

                $('.footer-menus-item').each(function () {
                    if ($(this).parents('.mobile-footer').length == 0) {
                        $(this).appendTo('.mobile-footer');
                    }
                });

                if ($('.mobile-footer .header-phone').length == 0) {
                    $('.header-phone').appendTo('.mobile-footer');
                }

                if ($('.mobile-footer .soc-list').length == 0) {
                    $('.soc-list').clone().appendTo('.mobile-footer');
                }



            }
        }



        $('.js-show-form').click(function () {
            $('.overlay-form').fadeIn();
            return false;
        });


        function clickOutside(e, $div) {
            if (!$div.is(e.target) &&
                $div.has(e.target).length === 0) {
                //$div.hide();
                return true;
            } else {
                return false;
            }
        }

        $('.overlay').click(function (e) {
            if (clickOutside(e, $('.popup'))) {
                //  $(this).fadeOut();
            }


        });


        $('body').click(function (e) {
            if (clickOutside(e, $('.js-actions-block'))) {
                $(this).find('.actions-list').hide();
            }

            var w = getWidth();
            
            if (clickOutside(e, $('.js-cab-save-info-show'))) {
                if (w <= PHONE) {
                    $(this).find('.cab-save-info span').hide();
                }
            }


        });


        $('.js-mobile-close').click(function (e) {
            e.preventDefault();
            $('.bx-filter-popup-result').hide();
            $('.mobile').slideUp();
        });

        $('body').on('click', '.js-show-actions', function (e) {
            e.preventDefault();
            var w = getWidth();
            if (w <= PHONE && $(this).hasClass('catalog-sort-current')) {
               openMobile('.mobile-catalog-sort', true);
            } else {
                $(this).closest('.js-actions-block').find('.actions-list').toggle();    
            }
            
            
        });

        window.personal_touched = 0;

        $('.js-enter').on ('touchend', function () {
			$(this).toggleClass('ontouched');
		});

        $('.js-enter').click(function (e) {
        	if (!$(this).hasClass('js-mob-user-menu')) {
				$('.overlay').hide();
				var w = getWidth();
				e.preventDefault();
				closeMenu(true);
				if (w <= PHONE) {
					openMobile('.mobile-auth', true);
				} else {
					showEnterOverlay();
				}
			}
        });

        $('.js-mob-user-menu').click(function(e){
        	$('.overlay').hide();
            var w = getWidth();
            if ($(this).hasClass('ontouched') && w > PHONE) {
				if (!$(e.target).closest('.cab-menu2').length) {
					e.preventDefault();
					e.stopPropagation();
				}
			}
            if (w <= PHONE) {
            	if (window.personal_touched == 0) {
					e.preventDefault();
					window.personal_touched++;
                	openMobile('.mobile-cab', false);
				}else {
					window.personal_touched = 0;
					showEnterOverlay();
				}
            }
        });

		function showEnterOverlay() {
            $('.overlay-enter').fadeIn();
            closeMobile();
            Recaptchafree.reset();
        }


        $('.js-show-enter').click(function(e){
            e.preventDefault();
            showEnterOverlay();
            $('#enterLink').click();
        });

        $('.js-show-register').click(function(e){
            e.preventDefault();
            showEnterOverlay();
            $('#registerLink').click();
        });



        $('.js-show-cab-filter').click(function (e) {
            e.preventDefault();
            var title = $(this).find('span').text();
            $('.mobile-cab-filter h3').text(title);
            openMobile('.mobile-cab-filter', true);
        });


        $('.js-show-rev-sort').click(function (e) {
            e.preventDefault();
            openMobile('.mobile-rev-sort', true);
        });


        $('.js-show-rev-filter').click(function (e) {
            e.preventDefault();
            openMobile('.mobile-rev-filter', true);
        });


        $('.js-cab-save-info-show').click(function () {
            var w = getWidth();
            if (w <= PHONE) {
                $(this).closest('.cab-save-info').find('span').toggle();
            }
        });
        
        $('#region-div').click(function () {
            var w = getWidth();
            console.log(w);
            if (w <= PHONE ) {
                openMobile('.mobile-city', false);
            }
        });
        

        $('.question').click(function (e) {
            e.preventDefault();
        });

        $('.js-show-popup').click(function (e) {
            e.preventDefault();
            showPopup('.' + $(this).data('popup'));
        });

        $('.js-show-popup-ajax').click(function (e) {
            e.preventDefault();
            $this = $(this);
            showPopup('.' + $this.data('popup'),$this.attr('href'),$this.attr('title'));
        });

        /* not for prod */
        $('.bx-soa-pp-company').click(function () {
            $('.bx-soa-pp-company').removeClass('bx-selected').find('.checkboxArea').removeClass('checkboxAreaChecked');;
            $(this).addClass('bx-selected').siblings();
            $(this).find('.checkboxArea').addClass('checkboxAreaChecked');
        });



        // Выбор региона:
        $("#region-select li a, #region-select2 li a").click(function(){
			$('.overlay-choose-city').fadeOut();
            var location = $(this).text();
            var choose = $(this);
            //console.log(document.location.pathname);

            if(
                    (document.location.pathname == '/personal/cart/') ||
                    (document.location.pathname == '/personal/order/make/') ||
                    (document.location.pathname == '/personal/order/make_new/')
                )
            {
                $('.overlay-change-city').fadeIn();
                $('.overlay-change-city .js-popup-close').click(function () {
					$('.overlay').fadeOut(function(){
						$.ajax({
							type: "GET",
							url: choose.parent().parent().attr('jhref')+encodeURIComponent(location),
							dataType: "html",
							success: function(out){
								$('#region-name').html(out).show();
								window.location.reload();
							}
						})
					});
					return false;
                });
            } else {
                $.ajax({
                    type: "GET",
                    url: $(this).parent().parent().attr('jhref')+encodeURIComponent(location),
                    dataType: "html",
                    success: function(out){
                        $('#region-name').html(out).show();
                        window.location.reload();
                    }
                });
            }

        });
        // профили юрлиц: имя профиля юрлица из названия компании
        $('#sppd-property-22').change(function(){
            $('#sppd-name').val($(this).val());
        });
        $('#sppd-name').val($('#sppd-property-22').val());//в момент загрузки страницы, на случай ранее заполненных данных

        if (document.location.hash && $(document.location.hash).length) {
            $(document.location.hash).trigger('click');    
        }

    });
})(jQuery);
