// Menu Mobile
const buttonMenuMobile = document.querySelector(".header .inner-button-menu");

if (buttonMenuMobile) {
  menu = document.querySelector(" .header .inner-menu");
  overlay = document.querySelector(".header .inner-overlay");

  buttonMenuMobile.addEventListener("click", function () {
    menu.classList.add("active");
  });

  overlay.addEventListener("click", function () {
    menu.classList.remove("active");
  });

  const listButtonMenu = menu.querySelectorAll("ul > li > i");

  listButtonMenu.forEach((button) => {
    button.addEventListener("click", function () {
      button.closest("li").classList.toggle("active");
    });
  });
}

//End Menu Mobile

// Box Section-1

// Location Box
const BoxLocationSection1 = document.querySelector(".section-1 .inner-form .inner-location");

if (BoxLocationSection1) {
  const input = BoxLocationSection1.querySelector(".inner-input-group .inner-input");

  input.addEventListener("focus", function () {
    BoxLocationSection1.classList.add("active");
  });

  input.addEventListener("blur", function () {
    BoxLocationSection1.classList.remove("active");
  });

  // Bắt sự kiện cho từng item

  const listItem = BoxLocationSection1.querySelectorAll(".inner-suggest .inner-suggest-list .inner-item");

  listItem.forEach((item) => {
    item.addEventListener("mousedown", () => {
      const title = item.querySelector(".inner-item-content .inner-item-title").innerText;
      input.value = title;
    });
  });
}
// End Location Box

// Quantity Box
const BoxQuantitySection1 = document.querySelector(".section-1 .inner-form .inner-quantity");

if (BoxQuantitySection1) {
  const input = BoxQuantitySection1.querySelector(".inner-input-group .inner-input");
  input.addEventListener("focus", () => {
    BoxQuantitySection1.classList.add("active");
  });

  // Ẩn box
  document.addEventListener("click", (event) => {
    if (!BoxQuantitySection1.contains(event.target)) {
      BoxQuantitySection1.classList.remove("active");
    }
  });

  // Thay đổi ô input
  const UpdateInputQuantity = () => {
    const listBoxNumber = BoxQuantitySection1.querySelectorAll(".inner-quantity .inner-item .inner-count .inner-number");
    const listNumber = [];
    listBoxNumber.forEach((item) => {
      listNumber.push(parseInt(item.innerHTML));
    });

    const valueInput = `NL: ${listNumber[0]}, TE: ${listNumber[1]}, EB: ${listNumber[2]}`;
    input.value = valueInput;
  };

  // Nút up
  const listButtonUp = BoxQuantitySection1.querySelectorAll(".inner-quantity .inner-item .inner-count .inner-up");

  listButtonUp.forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.closest(".inner-count");
      const number = parent.querySelector(".inner-number");
      number.innerHTML = parseInt(number.innerHTML) + 1;
      UpdateInputQuantity();
    });
  });

  // Nút down
  const listButtonDown = BoxQuantitySection1.querySelectorAll(".inner-quantity .inner-item .inner-count .inner-down");

  listButtonDown.forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.closest(".inner-count");
      const number = parent.querySelector(".inner-number");
      if (parseInt(number.innerHTML) > 0) {
        number.innerHTML = parseInt(number.innerHTML) - 1;
        UpdateInputQuantity();
      }
    });
  });
}
// End Box Section-1

//Clock Expire

const clockExpire = document.querySelector("[clock-Expire]");

if (clockExpire) {
  const expireDateTimeString = clockExpire.getAttribute("clock-Expire");
  const expireDateTime = new Date(expireDateTimeString);

  const updateClock = () => {
    const now = new Date();
    const remainingTime = expireDateTime - now;

    if (remainingTime > 0) {
      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);

      const listBoxNumber = clockExpire.querySelectorAll(".inner-time .inner-item .inner-number");
      listBoxNumber[0].innerHTML = days < 10 ? `0${days}` : days;
      listBoxNumber[1].innerHTML = hours < 10 ? `0${hours}` : hours;
      listBoxNumber[2].innerHTML = minutes < 10 ? `0${minutes}` : minutes;
      listBoxNumber[3].innerHTML = seconds < 10 ? `0${seconds}` : seconds;
    } else {
      clearInterval(intervalClock);
    }
  };

  const intervalClock = setInterval(updateClock, 1000);
}
//End Clock Expire

//Box Filter
const boxFilterMobile = document.querySelector(".section-9 .inner-list-filter");

if (boxFilterMobile) {
  const boxLeft = document.querySelector(".section-9 .inner-left");

  boxFilterMobile.addEventListener("click", function () {
    boxLeft.classList.add("active");
  });

  boxFilterMobile.addEventListener("blur", function () {
    boxLeft.classList.remove("active");
  });
}
//End Box Filter

// Show More Info Tour

const boxInfoTour = document.querySelector(".section-10 .inner-left .inner-info-tour");

if (boxInfoTour) {
  const moreButton = boxInfoTour.querySelector(".section-10 .inner-left .inner-info-tour .inner-button");
  moreButton.addEventListener("click", function () {
    if (boxInfoTour.classList.contains("active")) {
      boxInfoTour.classList.remove("active");
      moreButton.innerHTML = "Xem tất cả";
    } else {
      boxInfoTour.classList.add("active");
      moreButton.innerHTML = "Thu gọn";
    }
  });

  new Viewer(boxInfoTour);
}

// End Show More Info Tour

// Swiper Section 2

const swiperSection2 = document.querySelector(".section-2 .swiperSection2");

if (swiperSection2) {
  new Swiper(".swiperSection2", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
  });
}

// End Swiper Section 2

// Swiper Section 3

const swiperSection3 = document.querySelector(".section-3 .swiperSection3");

if (swiperSection3) {
  new Swiper(".swiperSection3", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
  });
}

//Box Image

const boxImageSection10 = document.querySelector(".section-10 .box-image");

if (boxImageSection10) {
  const swiperImageThumbs = new Swiper(".swiperImageThumbs", {
    loop: true,
    spaceBetween: 5,
    slidesPerView: 4,
    freeMode: true,
    breakpoints: {
      576: {
        spaceBetween: 10,
      },
    },
  });
  const swiperImageList = new Swiper(".swiperImageList", {
    loop: true,
    spaceBetween: 10,
    thumbs: {
      swiper: swiperImageThumbs,
    },
  });

  // Khởi tạo zoom ảnh
  const innerImageMain = boxImageSection10.querySelector(".inner-image-main");
  new Viewer(innerImageMain);
}

//Box Tour Schedule

const boxTourSchedule = document.querySelector(".section-10 .inner-left .inner-tour-schedule");
if (boxTourSchedule) {
  new Viewer(boxTourSchedule);
}

// End Box Tour Schedule

// Email Form

const emailForm = document.querySelector("#email-form");
if (emailForm) {
  const validator = new JustValidate("#email-form");
  validator
    .addField("#email-input", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email của bạn",
      },
      {
        rule: "email",
        errorMessage: "Vui lòng nhập đúng định dạng email",
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const dataFinal = {
        email: email,
      };

      fetch(`/contact/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            notify.success(data.message);
            event.target.email.value = "";
          }
        });
    });
}
// End Email Form

// Code Form

const codeForm = document.querySelector("#code-form");
if (codeForm) {
  const validator = new JustValidate("#code-form");
  validator
    .addField("#code-input", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập mã giảm giá của bạn",
      },
    ])
    .onSuccess((event) => {
      const email = event.target.code.value;
    });
}

// End Code Form

// Payment Form

const paymentForm = document.querySelector("#payment-form");
if (paymentForm) {
  const validator = new JustValidate("#payment-form");
  validator
    .addField("#fullname-input", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ và tên",
      },
      {
        rule: "minLength",
        value: 5,
        errorMessage: "Họ và tên phải có ít nhất 5 ký tự",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Họ và tên không được vượt quá 50 ký tự",
      },
    ])
    .addField("#phone-input", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại",
      },
      {
        rule: "customRegexp",
        value: /^(?:\+?84|0)(?:\s|-)?[1-9]\d{8}$/,
        errorMessage: "Vui lòng nhập đúng định dạng số điện thoại",
      },
    ])
    .onSuccess((event) => {
      const fullname = event.target.fullname.value;
      const phone = event.target.phone.value;
      const note = event.target.note.value;
      const paymentMethod = event.target.method.value;

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart = cart.filter((item) => item.checked && item.quantityAdult + item.quantityChildren + item.quantityBaby > 0);

      if (cart.length == 0) {
        notify.error("Vui lòng chọn sản phẩm trong giỏ hàng!");
        return;
      }

      const dataFinal = {
        fullName: fullName,
        phone: phone,
        note: note,
        paymentMethod: paymentMethod,
        items: cart,
      };

      fetch(`/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            notify.success(data.message);

            // Cập nhật lại giỏ hàng
            let newCart = JSON.parse(localStorage.getItem("cart")) || [];
            newCart = newCart.filter((item) => {
              return !(item.checked && item.quantityAdult + item.quantityChildren + item.quantityBaby > 0);
            });
            localStorage.setItem("cart", JSON.stringify(newCart));

            window.location.href = `/order/success?orderCode=${data.orderCode}&phone=${phone}`;
          }
        });
    });

  listInputMethod = paymentForm.querySelectorAll("input[name='method']");
  const bankInfo = paymentForm.querySelector(".inner-bank");

  listInputMethod.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value === "bank") {
        bankInfo.classList.add("active");
      } else {
        bankInfo.classList.remove("active");
      }
    });
  });
}

// Box Filter
const boxFilter = document.querySelector(".box-filter");
if (boxFilter) {
  const url = new URL(`${window.location.origin}/search`);

  const buttonApply = boxFilter.querySelector(".inner-button");

  buttonApply.addEventListener("click", () => {
    const filterList = ["locationFrom", "locationTo", "departureDate", "stockAdult", "stockChildren", "stockBaby", "price"];

    filterList.forEach((item) => {
      const value = boxFilter.querySelector(`[name="${item}"]`).value;
      if (value) {
        url.searchParams.set(item, value);
      } else {
        url.searchParams.delete(item);
      }
    });

    window.location.href = url.href;
  });
}
// End Box Filter

// form-search
const formSearch = document.querySelector("[form-search]");
if (formSearch) {
  const url = new URL(`${window.location.origin}/search`);

  formSearch.addEventListener("submit", (event) => {
    event.preventDefault();

    // Điểm đến
    const locationTo = formSearch.locationTo.value;
    if (locationTo) {
      url.searchParams.set("locationTo", locationTo);
    } else {
      url.searchParams.delete("locationTo");
    }

    // Số lượng
    const stockAdult = formSearch.querySelector("[stock-adult]").innerHTML.trim();
    if (stockAdult) {
      url.searchParams.set("stockAdult", stockAdult);
    } else {
      url.searchParams.delete("stockAdult");
    }

    const stockChildren = formSearch.querySelector("[stock-children]").innerHTML.trim();
    if (stockChildren) {
      url.searchParams.set("stockChildren", stockChildren);
    } else {
      url.searchParams.delete("stockChildren");
    }

    const stockBaby = formSearch.querySelector("[stock-baby]").innerHTML.trim();
    if (stockBaby) {
      url.searchParams.set("stockBaby", stockBaby);
    } else {
      url.searchParams.delete("stockBaby");
    }

    // Ngày khởi hành
    const departureDate = formSearch.departureDate.value;
    if (departureDate) {
      url.searchParams.set("departureDate", departureDate);
    } else {
      url.searchParams.delete("departureDate");
    }

    window.location.href = url.href;
  });
}
// End form-search

// Tạo giỏ hàng trống
const cart = localStorage.getItem("cart");
if (!cart) {
  localStorage.setItem("cart", JSON.stringify([]));
}
// Hết Tạo giỏ hàng trống

// Hiển thị số lượng vào mini-cart
const drawMiniCart = () => {
  const miniCart = document.querySelector("[mini-cart]");
  if (miniCart) {
    const cart = JSON.parse(localStorage.getItem("cart"));
    miniCart.innerHTML = cart.length;
  }
};
drawMiniCart();
// Hết Hiển thị số lượng vào mini-cart

// box-tour-detail
const boxTourDetail = document.querySelector(".box-tour-detail");
if (boxTourDetail) {
  const inputStockAdult = boxTourDetail.querySelector("[input-stock-adult]");
  const inputStockChildren = boxTourDetail.querySelector("[input-stock-children]");
  const inputStockBaby = boxTourDetail.querySelector("[input-stock-baby]");

  const drawBoxDetail = () => {
    const quantityAdult = parseInt(inputStockAdult.value) || 0;
    const quantityChildren = parseInt(inputStockChildren.value) || 0;
    const quantityBaby = parseInt(inputStockBaby.value) || 0;

    const spanStockAdult = boxTourDetail.querySelector("span[stock-adult]");
    const spanStockChildren = boxTourDetail.querySelector("span[stock-children]");
    const spanStockBaby = boxTourDetail.querySelector("span[stock-baby]");

    if (spanStockAdult) {
      spanStockAdult.innerHTML = quantityAdult;
    }

    if (spanStockChildren) {
      spanStockChildren.innerHTML = quantityChildren;
    }

    if (spanStockBaby) {
      spanStockBaby.innerHTML = quantityBaby;
    }

    const priceAdult = parseInt(inputStockAdult.getAttribute("price")) || 0;
    const priceChildren = parseInt(inputStockChildren.getAttribute("price")) || 0;
    const priceBaby = parseInt(inputStockBaby.getAttribute("price")) || 0;

    const totalPrice = quantityAdult * priceAdult + quantityChildren * priceChildren + quantityBaby * priceBaby;
    const spanTotalPrice = boxTourDetail.querySelector("span[total-price]");
    if (spanTotalPrice) {
      spanTotalPrice.innerHTML = totalPrice.toLocaleString("vi-VN");
    }
  };

  inputStockAdult.addEventListener("change", drawBoxDetail);
  inputStockChildren.addEventListener("change", drawBoxDetail);
  inputStockBaby.addEventListener("change", drawBoxDetail);

  // Nút thêm vào giỏ hàng
  const buttonAddCart = boxTourDetail.querySelector(".inner-button-add-cart");
  buttonAddCart.addEventListener("click", () => {
    const tourId = buttonAddCart.getAttribute("tour-id");
    const quantityAdult = parseInt(inputStockAdult.value) || 0;
    const quantityChildren = parseInt(inputStockChildren.value) || 0;
    const quantityBaby = parseInt(inputStockBaby.value) || 0;
    const locationFrom = boxTourDetail.querySelector("[location-from]").value;

    if (quantityAdult + quantityChildren + quantityBaby == 0) {
      notify.error("Vui lòng chọn số lượng khách!");
      return;
    }

    const cartItem = {
      tourId: tourId,
      locationFrom: locationFrom,
      quantityAdult: quantityAdult,
      quantityChildren: quantityChildren,
      quantityBaby: quantityBaby,
      checked: true,
    };

    const cart = JSON.parse(localStorage.getItem("cart"));
    const indexExistingItem = cart.findIndex((item) => item.tourId == tourId && item.locationFrom == locationFrom);
    if (indexExistingItem != -1) {
      cart[indexExistingItem].quantityAdult += quantityAdult;
      cart[indexExistingItem].quantityChildren += quantityChildren;
      cart[indexExistingItem].quantityBaby += quantityBaby;
    } else {
      cart.unshift(cartItem);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    notify.success("Thêm vào giỏ hàng thành công!");
    drawMiniCart();
  });
}
// End box-tour-detail

// Page Cart
const drawCart = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  fetch(`/cart/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cart }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.code == "success") {
        const cartDetails = data.cart;
        // Hiển thị item ra giao diện
        const htmlCartItems = cartDetails.map((item) => {
          return `
          <div class="inner-tour-item">
            <div class="inner-actions">
              <button class="inner-delete" button-delete tour-info="${item.tourId}-${item.locationFrom}">
                <i class="fa-solid fa-xmark"></i>
              </button>
              <input type="checkbox" class="inner-check" ${item.checked ? "checked" : ""} input-check tour-info="${item.tourId}-${item.locationFrom}">
            </div>
            <div class="inner-product">
              <div class="inner-image">
                <a href="/tour/detail/${item.slug}">
                  <img src="${item.avatar}" alt="">
                </a>
              </div>
              <div class="inner-content">
                <div class="inner-title">
                  <a href="/tour/detail/${item.slug}">
                    ${item.name}
                  </a>
                </div>
                <div class="inner-meta">
                  <div>Ngày Khởi Hành: <b>${item.departureDate}</b></div>
                  <div>Khởi Hành Tại: <b>${item.locationFromName}</b></div>
                </div>
              </div>
            </div>
            <div class="inner-quantity">
              <div class="inner-label">
                Số Lượng Hành Khách
              </div>
              <div class="inner-list">
                <div class="inner-item">
                  <div class="inner-item-label">
                    Người lớn:
                  </div>
                  <input type="number" class="inner-item-input" value="${item.quantityAdult}" min="0" max="${item.stockAdult}" name="quantityAdult" input-quantity tour-info="${item.tourId}-${item.locationFrom}"
                  <div class="inner-item-price">
                    <span>${item.quantityAdult}</span>
                    <span>x</span>
                    <span class="inner-highlight">${item.priceNewAdult.toLocaleString("vi-VN")}</span>
                  </div>
                </div>
                <div class="inner-item">
                  <div class="inner-item-label">
                    Trẻ em:
                  </div>
                  <input type="number" class="inner-item-input" value="${item.quantityChildren}" min="0" max="${item.stockChildren}" name="quantityChildren" input-quantity tour-info="${item.tourId}-${item.locationFrom}">
                  <div class="inner-item-price">
                    <span>${item.quantityChildren}</span>
                    <span>x</span>
                    <span class="inner-highlight">${item.priceNewChildren.toLocaleString("vi-VN")}</span>
                  </div>
                </div>
                <div class="inner-item">
                  <div class="inner-item-label">
                    Em bé:
                  </div>
                   <input type="number" class="inner-item-input" value="${item.quantityBaby}" min="0" max="${item.stockBaby}" name="quantityBaby" input-quantity tour-info="${item.tourId}-${item.locationFrom}">
                  <div class="inner-item-price">
                    <span>${item.quantityBaby}</span>
                    <span>x</span>
                    <span class="inner-highlight">${item.priceNewBaby.toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        });

        const elementCartList = pageCart.querySelector("[cart-list]");
        elementCartList.innerHTML = htmlCartItems.join("");

        // Tính tiền
        const subTotal = cartDetails.reduce((total, item) => {
          return total + item.quantityAdult * item.priceNewAdult + item.quantityChildren * item.priceNewChildren + item.quantityBaby * item.priceNewBaby;
        }, 0);
        const discount = 0;
        const total = subTotal - discount;

        const elementSubTotal = pageCart.querySelector("[cart-sub-total]");
        const elementDiscount = pageCart.querySelector("[cart-discount]");
        const elementTotal = pageCart.querySelector("[cart-total]");
        elementSubTotal.innerHTML = subTotal.toLocaleString("vi-VN");
        elementDiscount.innerHTML = discount.toLocaleString("vi-VN");
        elementTotal.innerHTML = total.toLocaleString("vi-VN");

        // Bắt sự kiện thay đổi số lượng
        const listInputQuantity = pageCart.querySelectorAll("input[input-quantity]");
        listInputQuantity.forEach((input) => {
          input.addEventListener("change", () => {
            const tourInfo = input.getAttribute("tour-info");
            const [tourId, locationFrom] = tourInfo.split("-");
            const name = input.getAttribute("name");
            let value = parseInt(input.value) || 0;
            const max = parseInt(input.getAttribute("max")) || 0;
            if (value < 0) value = 0;
            if (value > max) value = max;
            input.value = value;
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const indexItem = cart.findIndex((item) => item.tourId == tourId && item.locationFrom == locationFrom);
            if (indexItem != -1) {
              cart[indexItem][name] = value;
              localStorage.setItem("cart", JSON.stringify(cart));
              drawCart();
            }
          });
        });
        // Bắt sự kiện check/uncheck
        const listInputCheck = pageCart.querySelectorAll("input[input-check]");
        listInputCheck.forEach((input) => {
          input.addEventListener("change", () => {
            const tourInfo = input.getAttribute("tour-info");
            const [tourId, locationFrom] = tourInfo.split("-");
            const checked = input.checked;
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const indexItem = cart.findIndex((item) => item.tourId == tourId && item.locationFrom == locationFrom);
            if (indexItem != -1) {
              cart[indexItem].checked = checked;
              localStorage.setItem("cart", JSON.stringify(cart));
              drawCart();
            }
          });
        });

        // Xóa item khỏi giỏ hàng
        const listButtonDelete = pageCart.querySelectorAll("button[button-delete]");
        listButtonDelete.forEach((button) => {
          button.addEventListener("click", () => {
            const tourInfo = button.getAttribute("tour-info");
            const [tourId, locationFrom] = tourInfo.split("-");
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart = cart.filter((item) => !(item.tourId == tourId && item.locationFrom == locationFrom));
            localStorage.setItem("cart", JSON.stringify(cart));
            notify.success("Xóa khỏi giỏ hàng thành công!");
            drawMiniCart();
            drawCart();
          });
        });
      }
    });
};

const pageCart = document.querySelector("[page-cart]");
if (pageCart) {
  drawCart();
}
// End Page Cart
