var FULL = 1599;
var DESKTOP = 1439;
var TABLET = 1023;
var PHONE = 767;
var animLength = 400;

(function ($) {
  $(document).ready(function () {
    var settings = {
      basic: {
        accessibility: false,
        infinite: false,
        prevArrow: '<div class="owl-prev"></div>',
        nextArrow: '<div class="owl-next"></div>',
      },
      variable: {
        variableWidth: true,
        swipeToSlide: true,
        outerEdgeLimit: true,
        draggable: true,
      }
    };


    $(window).resize(function () {
      initRelated();
      initSlider();
      initSlider3();
      initSolutions();

    });


    $('body').on('click', '.product-type-button', function (e) {
      $('.product-type-button').removeClass('is-active');
      $(this).addClass('is-active');
      e.preventDefault();
      if ($(this).data('type') == 'sale') {
        $('.js-product-new').slideUp();
        $('.js-product-sale').slideDown();
        $('.product-info .js-product-info').prependTo('.product-right').hide().fadeIn();
        $('.product-right').addClass('product-right-sale');

        // $('.product-info').addClass('product-info_abs');
      } else {
        $('.js-product-new').slideDown(function () { initProductSlider(); });
        $('.js-product-sale').slideUp();
        $('.product-right .js-product-info').insertAfter('.product-type').hide().slideDown();
        $('.product-right').removeClass('product-right-sale');

        //$('.product-info').removeClass('product-info_abs');
      }
    });


    function closeSalePopup() {
      $('.product-sale-item-popup_active').removeClass('product-sale-item-popup_active');
    }

    $('.js-show-sale-popup').click(function (e) {
      e.preventDefault();
      closeSalePopup();
      $(this).parent().find('.product-sale-item-popup').addClass('product-sale-item-popup_active');
      initSaleSlider();
    });

    $('.js-sale-popup-close').click(function (e) {
      e.preventDefault();
      closeSalePopup();
    })



    function initSaleSlider() {
      if ($('.product-sale-item-popup_active .js-product-sale-item-slider').length) {
        $('.product-sale-item-popup_active  .js-product-sale-item-slider').each(function () {
          if ($(this).not('.slick-initialized')) {
            $(this).slick(Object.assign(settings.basic, {
              slidesToShow: 1,
              slidesToScroll: 1,
              dots: true,
              responsive: [
                {
                  breakpoint: DESKTOP,
                  settings: {

                    slidesToShow: 1,
                    slidesToScroll: 1,

                  }
                }]
            }));
          }
        });
      }
    }




    if ($('.js-compare-list').length) {
      $('.js-compare-list').on('init', function (event, slick) {
        setCompareHeight();
      });

      $('.js-compare-list').each(function () {
        $(this).slick(Object.assign(settings.basic, {
          slidesToShow: 6,
          slidesToScroll: 1,
          responsive: [
            {
              breakpoint: DESKTOP,
              settings: {

                slidesToShow: 4,
                slidesToScroll: 4,

              }
            },
            {
              breakpoint: TABLET,
              settings: {

                slidesToShow: 3,
                slidesToScroll: 3,

              }
            },

            {
              breakpoint: PHONE,
              settings: {

                slidesToShow: 2,
                slidesToScroll: 2,

              }
            }]
        }));
      });
    }


    function initRelated() {
      if ($('.js-related-carousel').length) {
        $('.js-related-carousel').each(function () {
          if ($(this).not('.slick-initialized')) {
            $(this).slick(Object.assign(settings.basic, {
              slidesToShow: 4,
              slidesToScroll: 4,
              responsive: [
                {
                  breakpoint: 10000,
                  settings: 'unslick'
                },
                {
                  breakpoint: TABLET,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    arrows: false,
                  }
                },
                {
                  breakpoint: PHONE,
                  settings: Object.assign(settings.variable, {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                  })
                },
              ]
            }));
          }
        });
      }
    }

    initRelated();




    function initSlider() {



      if ($('.js-slider-top').length) {
        $('.js-slider-top').each(function () {

          if ($(this).not('.slick-initialized')) {
            $(this).slick(Object.assign(settings.basic, {
              slidesToShow: 4,
              slidesToScroll: 4,
              responsive: [
                {
                  breakpoint: 10000,
                  settings: 'unslick'
                },
                {
                  breakpoint: DESKTOP,
                  settings: Object.assign(settings.variable, {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                  })
                },
                {
                  breakpoint: TABLET,
                  settings: {
                    draggable: true,
                    variableWidth: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                  }
                },
              ]
            }));
          }
        })
      }
    }

    initSlider();

    function initSolutions() {
      if ($('.js-solutions-left').length) {
        $('.js-solutions-left').each(function () {

          if ($(this).not('.slick-initialized')) {

            $(this).slick(Object.assign(settings.basic, {
              slidesToShow: 4,
              slidesToScroll: 4,
              responsive: [
                {
                  breakpoint: 10000,
                  settings: 'unslick'
                },
                {
                  breakpoint: TABLET,
                  settings: Object.assign(settings.variable, {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                  })
                },
                {
                  breakpoint: PHONE,
                  settings: Object.assign(settings.variable, {

                    slidesToShow: 1,
                    slidesToScroll: 1,
                  })
                }
              ]
            }));
          }
        })
      }
    }

    initSolutions();


    function initSlider3() {

      if ($('.js-slider-bottom3').length) {
        $('.js-slider-bottom3').each(function () {
          $(this).slick(Object.assign(settings.basic, {
            slidesToShow: 2,
            slidesToScroll: 2,
            responsive: [
              {
                breakpoint: 10000,
                settings: 'unslick'
              },

              {
                breakpoint: TABLET,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                  arrows: false,
                  dots: true,
                }
              },
              {
                breakpoint: PHONE,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  arrows: false,
                  dots: true,
                }
              }
            ]
          }));
        })
      }
    }

    initSlider3();



    if ($('.js-slider-bottom').length) {
      $('.js-slider-bottom').each(function () {
        $(this).slick(Object.assign(settings.basic, {
          slidesToShow: 4,
          slidesToScroll: 4,
          responsive: [
            {
              breakpoint: DESKTOP,
              settings: Object.assign(settings.variable, {
                slidesToShow: 1,
                slidesToScroll: 1,
              })
            },
            {
              breakpoint: TABLET,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                arrows: false,
                dots: true,
              }
            },
            {
              breakpoint: PHONE,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                dots: true,
              }
            }
          ]
        }));
      })
    }

    function initProductSlider() {
      $('.js-product-slider').each(function () {
        $(this).slick(Object.assign(settings.basic, {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          responsive: [
            {
              breakpoint: TABLET,
              settings: {
                dots: true
              }
            },
          ]
        }));
      });
    }

    if ($('.js-product-slider').length) {
      initProductSlider();

      $('.js-product-slider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        $('.js-product-slider-preview > li').eq(nextSlide).addClass('is-active').siblings().removeClass('is-active');
      });

      $('.js-product-slider-preview > li').on('mouseover click', function (e) {
        // e.preventDefault();
        console.log($(this).index());

        $('.js-product-slider').slick('slickGoTo', $(this).index(), true);

      });
    }

    if ($('.js-features').length) {
      $('.js-features').each(function () {
        $(this).slick(Object.assign(settings.basic, {
          slidesToShow: 4,
          slidesToScroll: 4,
          outerEdgeLimit: true,
          responsive: [
            {
              breakpoint: TABLET,
              settings: Object.assign(settings.variable, {
                slidesToShow: 2,
                slidesToScroll: 2,
                arrows: true,
              })
            },
          ]
        }));
      })
    }

    if ($('.js-carousel').length) {
      $('.js-carousel').each(function () {
        $(this).slick(Object.assign(settings.basic, {
          slidesToShow: 4,
          slidesToScroll: 4,

          responsive: [
            {
              breakpoint: DESKTOP,
              settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
                arrows: true,
                swipeToSlide: true,
                draggable: true,
              }
            },

            {
              breakpoint: TABLET,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                arrows: true,
                swipeToSlide: true,
                draggable: true,
              }
            },

            {
              breakpoint: PHONE,
              settings: Object.assign(settings.variable, {
                slidesToShow: 3,
                slidesToScroll: 3,

                arrows: false
              })
            },

          ]

        }));
      })
    }

    if ($('.js-partner-carousel').length) {
      $('.js-partner-carousel').each(function () {
        $(this).slick(Object.assign(settings.basic, {
          slidesToShow: 4,
          slidesToScroll: 1,
          responsive: [
            {
              breakpoint: DESKTOP,
              settings: Object.assign(settings.variable, {
                slidesToShow: 1,
                slidesToScroll: 1,
              })
            },
            {
              breakpoint: TABLET,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                arrows: false,
                dots: true,
              }
            },
            {
              breakpoint: PHONE,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                dots: true,
              }
            }
          ]
        }));
      })
    }


    function setCompareHeight() {
      setTimeout(function () {
        $('.compare-item-wrapper > div').css('height', 'auto');
        $('.compare-char').each(function (i) {
          $(this).css('height', 'auto');
          var maxH = [];
          var index = $(this).index();
          $('.compare-item-wrapper').each(function () {
            maxH.push($(this).children('div').eq(index).outerHeight());
          });
          var max = Math.max.apply(null, maxH);
          $('.compare-char').eq(index).css('height', max);
          $('.compare-item-wrapper').each(function () {
            $(this).children('div').eq(index).css('height', max);
          });
          if (i == 0) {
            $('.compare-item-wrapper').css('paddingTop', max);
          }

        });

      }, 700);

    }


    $(window).resize(function () {
      setCompareHeight();
    });

  });
})(jQuery);
