;(function($){

  $(document).ready(function(){
  
  //========== HEADER ACTIVE STRATS ============= //
    var windowOn = $(window);
    windowOn.on('scroll', function () {
      var scroll = windowOn.scrollTop();
      if (scroll < 100) {
        $("#vl-header-sticky").removeClass("header-sticky");
      } else {
        $("#vl-header-sticky").addClass("header-sticky");
      }
    });
    
  //========== HEADER ACTIVE ENDS ============= //
  
  //========== MOBILE MENU STARTS ============= //
  var vlMenuWrap = $('.vl-mobile-menu-active > ul').clone();
  var vlSideMenu = $('.vl-offcanvas-menu nav');
  vlSideMenu.append(vlMenuWrap);
  if ($(vlSideMenu).find('.sub-menu, .vl-mega-menu').length != 0) {
    $(vlSideMenu).find('.sub-menu, .vl-mega-menu').parent().append('<button class="vl-menu-close"><i class="fas fa-chevron-right"></i></button>');
  }
  
  var sideMenuList = $('.vl-offcanvas-menu nav > ul > li button.vl-menu-close, .vl-offcanvas-menu nav > ul li.has-dropdown > a');
  $(sideMenuList).on('click', function (e) {
    console.log(e);
    e.preventDefault();
    if (!($(this).parent().hasClass('active'))) {
      $(this).parent().addClass('active');
      $(this).siblings('.sub-menu, .vl-mega-menu').slideDown();
    } else {
      $(this).siblings('.sub-menu, .vl-mega-menu').slideUp();
      $(this).parent().removeClass('active');
    }
  });
  
  
  $(".vl-offcanvas-toggle").on('click',function(){
  $(".vl-offcanvas").addClass("vl-offcanvas-open");
  $(".vl-offcanvas-overlay").addClass("vl-offcanvas-overlay-open");
  });
  
  $(".vl-offcanvas-close-toggle,.vl-offcanvas-overlay").on('click', function(){
  $(".vl-offcanvas").removeClass("vl-offcanvas-open");
  $(".vl-offcanvas-overlay").removeClass("vl-offcanvas-overlay-open");
  });
  
  //========== MOBILE MENU ENDS ============= //
  
  //========== SIDEBAR/SEARCH AREA ============= //
  // $(".header-search-btn").on("click", function (e) {
  //   e.preventDefault();
  //   $(".header-search-form-wrapper").addClass("open");
  //   $('.header-search-form-wrapper input[type="search"]').focus();
  //   $('.body-overlay').addClass('active');
  // });
  // $(".tx-search-close").on("click", function (e) {
  //   e.preventDefault();
  //   $(".header-search-form-wrapper").removeClass("open");
  //   $("body").removeClass("active");
  //   $('.body-overlay').removeClass('active');
  // });
  //========== SIDEBAR/SEARCH AREA ============= //
  
  //========== PROGRESS ACTIVE ENDS ============= //
  
  //========== PRICING AREA ============= //
  
  
  //========== PAGE PROGRESS STARTS ============= // 
    var progressPath = document.querySelector(".progress-wrap path");
    var pathLength = progressPath.getTotalLength();
    progressPath.style.transition = progressPath.style.WebkitTransition =
    "none";
    progressPath.style.strokeDasharray = pathLength + " " + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition =
      "stroke-dashoffset 10ms linear";
    var updateProgress = function () {
      var scroll = $(window).scrollTop();
      var height = $(document).height() - $(window).height();
      var progress = pathLength - (scroll * pathLength) / height;
      progressPath.style.strokeDashoffset = progress;
    };
    updateProgress();
    $(window).scroll(updateProgress);
    var offset = 50;
    var duration = 550;
    jQuery(window).on("scroll", function () {
      if (jQuery(this).scrollTop() > offset) {
        jQuery(".progress-wrap").addClass("active-progress");
      } else {
        jQuery(".progress-wrap").removeClass("active-progress");
      }
    });
    jQuery(".progress-wrap").on("click", function (event) {
      event.preventDefault();
      jQuery("html, body").animate({ scrollTop: 0 }, duration);
      return false;
    });
  //========== PAGE PROGRESS STARTS ============= // 
  
  //========== VIDEO POPUP STARTS ============= //
     if ($(".popup-youtube").length > 0) {
      $(".popup-youtube").magnificPopup({
      type: "iframe",
      });
      }
  //========== VIDEO POPUP ENDS ============= //
  AOS.init;
  AOS.init({disable: 'mobile'});
  
  //========== NICE SELECT ============= //
  $('select').niceSelect();
  
  //========== CASE IMAGE ============= //
  $('.cs_hover_active').hover(function () {
    $(this).addClass('active').siblings().removeClass('active');
    });
  
    $('.images-content-area').hover(function () {
      $(this).addClass('active').siblings().removeClass('active');
      });
  
  });
  //========== COUNTER UP============= //
  const ucounter = $('.counter');
  if (ucounter.length > 0) {
   ucounter.countUp();  
  };
  
  //========== TESTIMONIAL AREA ============= //
  
  // SLIDER //
  $('.speakers-slider-area').owlCarousel({
    loop:true,
    margin:30,
    nav:false,
    dots:true,
    items:10,
    autoplay:true,
    smartSpeed:2000,
    autoplayTimeout:3000,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:false,
        },
        600:{
            items:2,
        },
        1000:{
            items:3,
        }
    }
  });
  
  // SLIDER //
  var rev = $('.rev_slider');
  rev.on('init', function(event, slick, currentSlide) {
    var
      cur = $(slick.$slides[slick.currentSlide]),
      next = cur.next(),
      prev = cur.prev();
    prev.addClass('slick-sprev');
    next.addClass('slick-snext');
    cur.removeClass('slick-snext').removeClass('slick-sprev');
    slick.$prev = prev;
    slick.$next = next;
  }).on('beforeChange', function(event, slick, currentSlide, nextSlide) {
  
    var
      cur = $(slick.$slides[nextSlide]);
  
    slick.$prev.removeClass('slick-sprev');
    slick.$next.removeClass('slick-snext');
    next = cur.next(),
      prev = cur.prev();
    prev.prev();
    prev.next();
    prev.addClass('slick-sprev');
    next.addClass('slick-snext');
    slick.$prev = prev;
    slick.$next = next;
    cur.removeClass('slick-next').removeClass('slick-sprev');
  });
  
  rev.slick({
    speed: 1000,
    arrows: true,
    dots: false,
    focusOnSelect: true,
    prevArrow: '<button class="prev-next"><i class="fa-solid fa-angle-left"></i></button>',
    nextArrow: '<button class="next-prev"> <i class="fa-solid fa-angle-right"></i></button>',
    infinite: true,
    centerMode: true,
    slidesPerRow: 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerPadding: '0',
    swipe: true,
    autoplaySpeed:2500,
    speed:1500,
    autoplay:true,
    customPaging: function(slider, i) {
      return '';
    },
  
  });
  
  // SLIDER //
  $(".all-galler-images").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay:true,
    autoplaySpeed:2000,
    loop: true,
    focusOnSelect: true,
    vertical:false,
    asNavFor: ".bottom-galler-images",
    infinite: true,
    fade:true,
  });
  
  $(".bottom-galler-images").slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: ".all-galler-images",
    dots: false,
    arrows: false,
    centerMode: false,
    focusOnSelect: true,
    loop: true,
    autoplay:true,
    autoplaySpeed:2000,
    infinite: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          infinite: true,
        }
      },
      {
        breakpoint: 769,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      }
    ]
  });
  
  // SLIDER //
  $('.brand-slider-area').owlCarousel({
    loop:true,
    margin:30,
    nav:false,
    dots:true,
    items:10,
    autoplay:true,
    smartSpeed:2000,
    autoplayTimeout:3000,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:false,
        },
        600:{
            items:2,
        },
        1000:{
            items:4,
        }
    }
  });
  
  // SLIDER //
  $('.team-widget-slider ').owlCarousel({
    loop:true,
    margin:30,
    nav:true,
    dots:false,
    items:10,
    navText:["<i class='fa-solid fa-angle-left'></i>" , "<i class='fa-solid fa-angle-right'></i>"],
    autoplay:true,
    smartSpeed:2000,
    autoplayTimeout:3000,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
        },
        600:{
            items:2,
        },
        1000:{
            items:4,
        }
    }
  });
  
  // SLIDER //
  $('.works-slider-area').owlCarousel({
    loop:true,
    margin:30,
    nav:true,
    dots:false,
    items:10,
    navText:["<i class='fa-solid fa-angle-left'></i>" , "<i class='fa-solid fa-angle-right'></i>"],
    autoplay:true,
    smartSpeed:2000,
    autoplayTimeout:3000,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
        },
        600:{
            items:2,
        },
        1000:{
            items:3,
        }
    }
  });
  
  // testimonial //
  $(".hero5-slider-area").slick({
    autoplay:true,
    autoplaySpeed:2500,
    speed:1500,
    slidesToShow:1,
    slidesToScroll:1,
    pauseOnHover:false,
    dots:false,
    arrows:true,
    pauseOnDotsHover:true,
    cssEase:'linear',
    fade:true,
    draggable:true,
    prevArrow: $(".testimonial-prev-arrow"),
    nextArrow: $(".testimonial-next-arrow"), 
  }); 
  
  //========== PRELOADER ============= //
  $(window).on("load", function (event) {
    setTimeout(function () {
      $(".preloader").fadeToggle();
    }, 200);
  
  });
  
  })(jQuery);
  
  //========== GSAP AREA ============= //
  
  if ($('.text-anime-style-1').length) {
    let staggerAmount 	= 0.05,
    translateXValue = 0,
    delayValue 		= 0.5,
     animatedTextElements = document.querySelectorAll('.text-anime-style-1');
  
    animatedTextElements.forEach((element) => {
    let animationSplitText = new SplitText(element, { type: "chars, words" });
      gsap.from(animationSplitText.words, {
      duration: 1,
      delay: delayValue,
      x: 20,
      autoAlpha: 0,
      stagger: staggerAmount,
      scrollTrigger: { trigger: element, start: "top 85%" },
      });
    });
    }
  
    if ($('.text-anime-style-2').length) {
    let	 staggerAmount 		= 0.05,
     translateXValue	= 20,
     delayValue 		= 0.5,
     easeType 			= "power2.out",
     animatedTextElements = document.querySelectorAll('.text-anime-style-2');
  
    animatedTextElements.forEach((element) => {
    let animationSplitText = new SplitText(element, { type: "chars, words" });
      gsap.from(animationSplitText.chars, {
        duration: 1,
        delay: delayValue,
        x: translateXValue,
        autoAlpha: 0,
        stagger: staggerAmount,
        ease: easeType,
        scrollTrigger: { trigger: element, start: "top 85%"},
      });
    });
    }
  
    if ($('.text-anime-style-3').length) {
    let	animatedTextElements = document.querySelectorAll('.text-anime-style-3');
  
    animatedTextElements.forEach((element) => {
    //Reset if needed
    if (element.animation) {
      element.animation.progress(1).kill();
      element.split.revert();
    }
  
    element.split = new SplitText(element, {
      type: "lines,words,chars",
      linesClass: "split-line",
    });
    gsap.set(element, { perspective: 400 });
  
    gsap.set(element.split.chars, {
      opacity: 0,
      x: "50",
    });
  
    element.animation = gsap.to(element.split.chars, {
      scrollTrigger: { trigger: element,	start: "top 90%" },
      x: "0",
      y: "0",
      rotateX: "0",
      opacity: 1,
      duration: 1,
      ease: Back.easeOut,
      stagger: 0.02,
    });
    });
    }
  
  //========== Images AREA ============= //
  if($('.reveal').length)
  {gsap.registerPlugin(ScrollTrigger);
  let revealContainers=document.querySelectorAll(".reveal");
  revealContainers.forEach((container)=>{let image=container.querySelector("img");
  let tl=gsap.timeline({scrollTrigger:{trigger:container,toggleActions:"play none none none"}});
  tl.set(container,{autoAlpha:1});tl.from(container,1.5,{xPercent:-100,ease:Power2.out});
  tl.from(image,1.5,{xPercent:100,scale:1.3,delay:-1.5,ease:Power2.out});})
  ;}
      
  //========== TIMER ============= //
  
   // TIMER //
   function startCountdown(targetDate, daysId, hoursId, minutesId, secondsId) {
    var countdownFunction = setInterval(function () {
        var now = new Date().getTime();
        var distance = targetDate - now;
  
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
        document.getElementById(daysId).innerHTML = days + " <span>Month</span>";
        document.getElementById(hoursId).innerHTML = hours + " <span>Days</span>";
        document.getElementById(minutesId).innerHTML = minutes + " <span>Minutes</span>";
        document.getElementById(secondsId).innerHTML = seconds + " <span>Seconds</span>";
  
        if (distance < 0) {
            clearInterval(countdownFunction);
            document.getElementById(daysId).innerHTML = "00";
            document.getElementById(hoursId).innerHTML = "00";
            document.getElementById(minutesId).innerHTML = "00";
            document.getElementById(secondsId).innerHTML = "00";
            alert("Countdown Ended");
        }
    }, 1000);
  }
  
  var targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 10);
  targetDate.setHours(targetDate.getHours() + 15);
  targetDate.setMinutes(targetDate.getMinutes() + 24);
  targetDate.setSeconds(targetDate.getSeconds() + 56);
  
  startCountdown(targetDate, "days", "hours", "minutes", "seconds");
  startCountdown(targetDate, "days1", "hours1", "minutes1", "seconds1");
  
  
  function toggleDetails() {
    const bottomSection = document.getElementById('bottomSection');
    bottomSection.classList.toggle('active');
  }
  
  function toggleDetails1() {
    const bottomSection1 = document.getElementById('bottomSection1');
    bottomSection1.classList.toggle('active');
  }
  
  
  function toggleDetails2() {
    const bottomSection2 = document.getElementById('bottomSection2');
    bottomSection2.classList.toggle('active');
  }
  
  // SHOW ANIMATED IMAGES //
      const listItems = document.querySelectorAll('.list-container li');
      const images = document.querySelectorAll('.image-container .image');
      listItems.forEach(item => {
          item.addEventListener('mouseover', () => {
              const targetImageId = item.getAttribute('data-image');
              images.forEach(div => {
                  div.classList.remove('active');
                  if (div.id === targetImageId) {
                      div.classList.add('active');
                  }
              });
          });
      });
  
  
  // TICKETT COUNT //
  let ticketCount = 1;
  
  document.getElementById("increase").addEventListener("click", () => {
    ticketCount++;
    updateTicketCount();
  });
  
  document.getElementById("decrease").addEventListener("click", () => {
    if (ticketCount > 1) {
      ticketCount--;
      updateTicketCount();
    }
  });
  
  function updateTicketCount() {
    document.getElementById("ticket-count").textContent = ticketCount;
    document.getElementById("decrease").disabled = ticketCount === 1;
  }
  
  
  //========== PRELOADER BAR AREA ============= //
  document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        const popup = document.getElementById('popup');
        popup.style.display = 'flex'; 
    }, 100); 
    const closeBtn = document.getElementById('close-popup');
    closeBtn.addEventListener('click', function() {
        const popup = document.getElementById('popup');
        popup.style.display = 'none'; 
    });
  
  });