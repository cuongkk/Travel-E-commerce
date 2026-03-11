const initTinyMCE = (selector) => {
  tinymce.init({
    selector: selector,
    plugins: ["anchor", "link"],
    toolbar: "undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | outdent indent link anchor",
  });
};

initTinyMCE("[textarea-mce]");
// Menu Mobile

const buttonMenuMobile = document.querySelector(".header .inner-menu");

if (buttonMenuMobile) {
  const sider = document.querySelector(".sider");
  const overlay = document.querySelector(".inner-overlay");

  buttonMenuMobile.addEventListener("click", function () {
    sider.classList.add("active");
    overlay.classList.add("active");
  });

  overlay.addEventListener("click", function () {
    sider.classList.remove("active");
    overlay.classList.remove("active");
  });
}
// End Menu Mobile

// Schedule Section-8

const scheduleSection8 = document.querySelector(".section-8 .inner-schedule");

if (scheduleSection8) {
  const buttonCreate = scheduleSection8.querySelector(".inner-schedule-create");
  const elementList = scheduleSection8.querySelector(".inner-schedule-list");

  // Thêm Item
  buttonCreate.addEventListener("click", () => {
    const firstItem = elementList.querySelector(".inner-schedule-item");
    const newItem = firstItem.cloneNode(true);
    newItem.querySelector(".inner-input").value = "";
    const id = `mce_${Date.now()}`;
    newItem.querySelector(".inner-schedule-body").innerHTML = `<textarea id="${id}"></textarea>`;
    elementList.appendChild(newItem);
    initTinyMCE(`#${id}`);
  });

  // Đóng mở
  elementList.addEventListener("click", (event) => {
    if (event.target.closest(".inner-more")) {
      const scheduleItem = event.target.closest(".inner-schedule-item");
      const scheduleBody = scheduleItem.querySelector(".inner-schedule-body");
      scheduleBody.classList.toggle("hidden");
    }
  });

  // Xóa Item
  elementList.addEventListener("click", (event) => {
    if (event.target.closest(".inner-remove")) {
      const scheduleItem = event.target.closest(".inner-schedule-item");
      if (elementList.children.length > 1) {
        elementList.removeChild(scheduleItem);
      }
    }
  });
  //Sắp xếp Item
  new Sortable(elementList, {
    handle: ".inner-move",
    animation: 150,
    onStart: (event) => {
      const textareaa = event.item.querySelector("textarea");
      const id = textareaa.id;
      tinymce.get(id).remove();
    },
    onEnd: (event) => {
      const textareaa = event.item.querySelector("textarea");
      const id = textareaa.id;
      initTinyMCE(`#${id}`);
    },
  });
}
//End Schedule Section-8

//Filepond Image

const listFilepondImage = document.querySelectorAll("[filepond-image]");
let filepond = {};
if (listFilepondImage.length > 0) {
  FilePond.registerPlugin(FilePondPluginImagePreview);
  FilePond.registerPlugin(FilePondPluginFileValidateType);

  listFilepondImage.forEach((inputElement) => {
    const imageDefault = inputElement.getAttribute("image-default");
    let files = null;
    if (imageDefault) {
      files = [
        {
          source: imageDefault,
        },
      ];
    }

    filepond[inputElement.name] = FilePond.create(inputElement, {
      labelIdle: "+",
      acceptedFileTypes: ["image/*"],
      files: files,
    });
  });
}
//End Filepond Image

// Chart
const revenueChartElement = document.querySelector("#revenue-chart");
if (revenueChartElement) {
  new Chart(revenueChartElement, {
    type: "line",
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
          borderColor: "#4e73df",
        },
        {
          label: "# of Votes",
          data: [13, 15, 2, 8, 1, 2],
          borderWidth: 1,
          borderColor: "#1cc88a",
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      maintainAspectRatio: false,
    },
  });
}
// End Chart

// Category Create Form
const categoryCreateForm = document.querySelector("#category-create-form");
if (categoryCreateForm) {
  const validation = new JustValidate("#category-create-form");
  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên danh mục",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatar = filepond.avatar.getFile()?.file;
      const description = tinymce.get("description").getContent();

      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent", parent);
      formData.append("position", position);
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("description", description);

      fetch(`/${pathAdmin}/category/create`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          const status = data.code || data.result;

          if (status === "error") {
            notify.error(data.message);
          }

          if (status === "success") {
            Notify(status, data.message);
            window.location.reload();
          }
        });
    });
}

// End Category Create Form

// Category Edit Form
const categoryEditForm = document.querySelector("#category-edit-form");
if (categoryEditForm) {
  const validator = new JustValidate("#category-edit-form");

  validator
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên danh mục!",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatar = filepond.avatar.getFile()?.file;
      const description = tinymce.get("description").getContent();

      // Tạo FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent", parent);
      formData.append("position", position);
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("description", description);

      fetch(`/${pathAdmin}/category/edit/${id}`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            notify.success(data.message);
          }
        });
    });
}
// End Category Edit Form

//Tour Create Form
const tourCreateForm = document.querySelector("#tour-create-form");
if (tourCreateForm) {
  const validation = new JustValidate("#tour-create-form");
  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên tour",
      },
    ])
    .onSuccess((event) => {
      const form = event.target;

      const name = form.name.value;
      const category = form.category.value;
      const position = form.position.value;
      const status = form.status.value;
      const avatar = filepond.avatar?.getFile()?.file || null;

      const priceAdult = form.priceAdult.value;
      const priceChildren = form.priceChildren.value;
      const priceBaby = form.priceBaby.value;

      const priceNewAdult = form.priceNewAdult.value;
      const priceNewChildren = form.priceNewChildren.value;
      const priceNewBaby = form.priceNewBaby.value;

      const stockAdult = form.stockAdult.value;
      const stockChildren = form.stockChildren.value;
      const stockBaby = form.stockBaby.value;

      const locations = [];
      const departureDate = form.departureDate.value;
      const endDate = form.endDate.value;

      const informationEditor = tinymce.get("information");
      const information = informationEditor ? informationEditor.getContent() : form.information.value;

      const schedules = [];

      // locations
      const listLocation = document.querySelectorAll('[name="locations"]:checked');
      listLocation.forEach((item) => {
        locations.push(item.value);
      });

      // schedules
      const listScheduleItem = document.querySelectorAll(".inner-schedule .inner-schedule-item");
      listScheduleItem.forEach((item) => {
        const inputTitle = item.querySelector(".inner-input");
        const title = inputTitle.value;
        const textareaDescription = item.querySelector("textarea");
        const id = textareaDescription.id;
        const description = tinymce.get(id).getContent();

        schedules.push({
          title,
          description,
        });
      });

      // Tạo FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("position", position);
      formData.append("status", status);
      if (avatar) {
        formData.append("avatar", avatar);
      }
      formData.append("priceAdult", priceAdult);
      formData.append("priceChildren", priceChildren);
      formData.append("priceBaby", priceBaby);
      formData.append("priceNewAdult", priceNewAdult);
      formData.append("priceNewChildren", priceNewChildren);
      formData.append("priceNewBaby", priceNewBaby);
      formData.append("stockAdult", stockAdult);
      formData.append("stockChildren", stockChildren);
      formData.append("stockBaby", stockBaby);
      formData.append("locations", JSON.stringify(locations));
      formData.append("departureDate", departureDate);
      formData.append("endDate", endDate);
      formData.append("information", information);
      formData.append("schedules", JSON.stringify(schedules));

      fetch(`/${pathAdmin}/tour/create`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            Notify(data.code, data.message);
            window.location.reload(); // Load lại trang
          }
        });
    });
}

// End Tour Create Form

// Tour Edit Form
const tourEditForm = document.querySelector("#tour-edit-form");
if (tourEditForm) {
  const validator = new JustValidate("#tour-edit-form");

  validator
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên tour!",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatar = filepond.avatar?.getFile()?.file || null;
      const priceAdult = event.target.priceAdult.value;
      const priceChildren = event.target.priceChildren.value;
      const priceBaby = event.target.priceBaby.value;
      const priceNewAdult = event.target.priceNewAdult.value;
      const priceNewChildren = event.target.priceNewChildren.value;
      const priceNewBaby = event.target.priceNewBaby.value;
      const stockAdult = event.target.stockAdult.value;
      const stockChildren = event.target.stockChildren.value;
      const stockBaby = event.target.stockBaby.value;
      const locations = [];
      const departureDate = event.target.departureDate.value;
      const information = tinymce.get("information").getContent();
      const schedules = [];

      // locations
      const listLocationChecked = document.querySelectorAll(`[name="locations"]:checked`);
      listLocationChecked.forEach((input) => {
        locations.push(input.value);
      });
      // End locations

      // schedules
      const listScheduleItem = document.querySelectorAll(".inner-schedule .inner-schedule-item");
      listScheduleItem.forEach((item) => {
        const inputTitle = item.querySelector("input");
        const title = inputTitle.value;

        const textareaDescription = item.querySelector("textarea");
        const idDescription = textareaDescription.id;
        const description = tinymce.get(idDescription).getContent();

        schedules.push({
          title: title,
          description: description,
        });
      });
      // End schedules

      // Tạo FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("position", position);
      formData.append("status", status);
      if (avatar) {
        formData.append("avatar", avatar);
      }
      formData.append("priceAdult", priceAdult);
      formData.append("priceChildren", priceChildren);
      formData.append("priceBaby", priceBaby);
      formData.append("priceNewAdult", priceNewAdult);
      formData.append("priceNewChildren", priceNewChildren);
      formData.append("priceNewBaby", priceNewBaby);
      formData.append("stockAdult", stockAdult);
      formData.append("stockChildren", stockChildren);
      formData.append("stockBaby", stockBaby);
      formData.append("locations", JSON.stringify(locations));
      formData.append("departureDate", departureDate);
      formData.append("information", information);
      formData.append("schedules", JSON.stringify(schedules));

      fetch(`/${pathAdmin}/tour/edit/${id}`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            notify.success(data.message);
          }
        });
    });
}
// End Tour Edit Form

// Order Edit Form

const orderEditForm = document.querySelector("#order-edit-form");
if (orderEditForm) {
  const validator = new JustValidate("#order-edit-form");
  validator
    .addField("#fullName", [
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
    .addField("#phone", [
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
      const fullname = event.target.fullName.value;
      const phone = event.target.phone.value;
      const note = event.target.note.value;
      const paymentMethod = event.target.paymentMethod.value;
      const paymentStatus = event.target.paymentStatus.value;
      const status = event.target.status.value;
    });
}
//End Order Edit Form

// Info Web Form
const infoWebForm = document.querySelector("#info-web-form");
if (infoWebForm) {
  const validation = new JustValidate("#info-web-form");
  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên website",
      },
    ])
    .addField("#email", [
      {
        rule: "email",
        errorMessage: "Vui lòng nhập đúng định dạng email",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const phone = event.target.phone.value;
      const email = event.target.email.value;
      const address = event.target.address.value;
      const logo = filepond.logo.getFile()?.file;
      const favicon = filepond.favicon.getFile()?.file;
    });
}
// End Info Web Form

// Account Admin Create Form
const accountAdminCreateForm = document.querySelector("#account-admin-create-form");
if (accountAdminCreateForm) {
  const validation = new JustValidate("#account-admin-create-form");
  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên",
      },
    ])
    .addField("#email", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email",
      },
      {
        rule: "email",
        errorMessage: "Vui lòng nhập đúng định dạng email",
      },
    ])
    .addField("#phone", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại",
      },
    ])
    .addField("#position", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập chức vụ",
      },
    ])
    .addField("#password", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập mật khẩu",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const role = event.target.role.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatar = filepond.avatar.getFile()?.file;
    });
}
// End Account Admin Create Form

// Role Create Form
const roleCreateForm = document.querySelector("#role-create-form");
if (roleCreateForm) {
  const validation = new JustValidate("#role-create-form");
  validation
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên nhóm quyền",
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const description = event.target.description.value;
      const permissions = [];

      const listPermissions = document.querySelectorAll('[name="permissions"]:checked');
      listPermissions.forEach((item) => {
        permissions.push(item.value);
      });
      console.log(permissions);
    });
}
// End Role Create Form

// Profile Edit Form
const profileEditForm = document.querySelector("#profile-edit-form");
if (profileEditForm) {
  const validation = new JustValidate("#profile-edit-form");
  validation
    .addField("#fullName", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên",
      },
      {
        rule: "minLength",
        value: 3,
        errorMessage: "Họ tên phải có ít nhất 3 ký tự",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Họ tên không được vượt quá 50 ký tự",
      },
    ])
    .addField("#email", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email",
      },
      {
        rule: "email",
        errorMessage: "Vui lòng nhập đúng định dạng email",
      },
    ])
    .addField("#phone", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập số điện thoại",
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const avatar = filepond.avatar.getFile()?.file;
    });
}

// End Profile Edit Form

// Change Password Form
const changePasswordForm = document.querySelector("#change-password-form");
if (changePasswordForm) {
  const validation = new JustValidate("#change-password-form");
  validation
    .addField("#password", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập mật khẩu",
      },
      {
        rule: "minLength",
        value: 6,
        errorMessage: "Mật khẩu phải có ít nhất 6 ký tự",
      },
      {
        rule: "maxLength",
        value: 30,
        errorMessage: "Mật khẩu không được vượt quá 30 ký tự",
      },
      {
        rule: "customRegexp",
        value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
        errorMessage: "Mật khẩu phải chứa ít nhất một chữ cái và một số",
      },
    ])
    .addField("#confirmPassword", [
      {
        rule: "required",
        errorMessage: "Vui lòng xác nhận mật khẩu",
      },
      {
        validator: (value, fields) => {
          return value === fields["#password"].elem.value;
        },
        errorMessage: "Mật khẩu xác nhận không khớp",
      },
    ])
    .onSuccess((event) => {
      const password = event.target.password.value;
    });
}

// Sider
const sider = document.querySelector(".sider");
if (sider) {
  const pathNameCurrent = window.location.pathname;
  const pathNameCurrentSplit = pathNameCurrent.split("/");
  const menuList = sider.querySelectorAll("ul.inner-menu li a");
  menuList.forEach((item) => {
    const pathName = item.getAttribute("href");
    const pathNameSplit = pathName.split("/");
    if (pathNameCurrentSplit[1] == pathNameSplit[1] && pathNameCurrentSplit[2] === pathNameSplit[2]) {
      item.classList.add("active");
    }
  });
}
//End sider

// button-delete
const listButtonDelete = document.querySelectorAll("[button-delete]");
if (listButtonDelete.length > 0) {
  listButtonDelete.forEach((button) => {
    button.addEventListener("click", () => {
      const dataApi = button.getAttribute("data-api");
      fetch(dataApi, {
        method: "PATCH",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            Notify(data.code, data.message);
            window.location.reload();
          }
        });
    });
  });
}
// End button-delete

// button-undo
const listButtonUndo = document.querySelectorAll("[button-undo]");
if (listButtonUndo.length > 0) {
  listButtonUndo.forEach((button) => {
    button.addEventListener("click", () => {
      const dataApi = button.getAttribute("data-api");
      fetch(dataApi, {
        method: "PATCH",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            Notify(data.code, data.message);
            window.location.reload();
          }
        });
    });
  });
}
// End button-undo

// button-destroy
const listButtonDestroy = document.querySelectorAll("[button-destroy]");
if (listButtonDestroy.length > 0) {
  listButtonDestroy.forEach((button) => {
    button.addEventListener("click", () => {
      const dataApi = button.getAttribute("data-api");
      fetch(dataApi, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            Notify(data.code, data.message);
            window.location.reload();
          }
        });
    });
  });
}
// End button-destroy
// filter-status
const filterStatus = document.querySelector("[filter-status]");
if (filterStatus) {
  const url = new URL(window.location.href);

  filterStatus.addEventListener("change", () => {
    const value = filterStatus.value;
    if (value) {
      url.searchParams.set("status", value);
    } else {
      url.searchParams.delete("status");
    }
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("status");
  if (valueCurrent) {
    filterStatus.value = valueCurrent;
  }
}
// End filter-status

// filter-created-by
const filterCreatedBy = document.querySelector("[filter-created-by]");
if (filterCreatedBy) {
  const url = new URL(window.location.href);

  filterCreatedBy.addEventListener("change", () => {
    const value = filterCreatedBy.value;
    if (value) {
      url.searchParams.set("createdBy", value);
    } else {
      url.searchParams.delete("createdBy");
    }
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("createdBy");
  if (valueCurrent) {
    filterCreatedBy.value = valueCurrent;
  }
}
// End filter-created-by

// filter-start-date
const filterStartDate = document.querySelector("[filter-start-date]");
if (filterStartDate) {
  const url = new URL(window.location.href);

  filterStartDate.addEventListener("change", () => {
    const value = filterStartDate.value;
    if (value) {
      url.searchParams.set("startDate", value);
    } else {
      url.searchParams.delete("startDate");
    }
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("startDate");
  if (valueCurrent) {
    filterStartDate.value = valueCurrent;
  }
}
// End filter-start-date

// filter-end-date
const filterEndDate = document.querySelector("[filter-end-date]");
if (filterEndDate) {
  const url = new URL(window.location.href);

  filterEndDate.addEventListener("change", () => {
    const value = filterEndDate.value;
    if (value) {
      url.searchParams.set("endDate", value);
    } else {
      url.searchParams.delete("endDate");
    }
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("endDate");
  if (valueCurrent) {
    filterEndDate.value = valueCurrent;
  }
}
// End filter-end-date

// filter-reset
const filterReset = document.querySelector("[filter-reset]");
if (filterReset) {
  const url = new URL(window.location.href);

  filterReset.addEventListener("click", () => {
    url.searchParams.delete("status");
    url.searchParams.delete("createdBy");
    url.searchParams.delete("startDate");
    url.searchParams.delete("endDate");
    window.location.href = url.href;
  });
}
// End filter-reset

// checkAll
const inputCheckAll = document.querySelector(`input[name="checkAll"]`);
if (inputCheckAll) {
  inputCheckAll.addEventListener("click", () => {
    const listInputCheckItem = document.querySelectorAll(`input[name="checkItem"]`);
    listInputCheckItem.forEach((input) => {
      input.checked = inputCheckAll.checked;
    });
  });
}
// End checkAll

// change-multi
const changeMulti = document.querySelector("[change-multi]");
if (changeMulti) {
  const button = changeMulti.querySelector("button");
  const select = changeMulti.querySelector("select");
  const dataApi = changeMulti.getAttribute("data-api");

  button.addEventListener("click", () => {
    const listInputChecked = document.querySelectorAll(`input[name="checkItem"]:checked`);
    const listId = [];
    listInputChecked.forEach((input) => {
      listId.push(input.value);
    });
    const option = select.value;

    if (listId.length == 0) {
      notify.error("Vui lòng chọn ít nhất 1 bản ghi!");
      return;
    }

    if (!option) {
      notify.error("Vui lòng chọn hành động để áp dụng!");
      return;
    }

    const dataFinal = {
      listId: listId,
      option: option,
    };

    fetch(dataApi, {
      method: "PATCH",
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
          Notify(data.code, data.message);
          window.location.reload();
        }
      });
  });
}
// End change-multi

// search
const inputSearch = document.querySelector("[search]");
if (inputSearch) {
  const url = new URL(window.location.href);

  inputSearch.addEventListener("keyup", (event) => {
    if (event.code == "Enter") {
      const value = inputSearch.value.trim();
      if (value) {
        url.searchParams.set("keyword", value);
      } else {
        url.searchParams.delete("keyword");
      }
      window.location.href = url.href;
    }
  });

  // Hiển thị giá trị mặc định
  const valueCurrent = url.searchParams.get("keyword");
  if (valueCurrent) {
    inputSearch.value = valueCurrent;
  }
}
// End search

// box-pagination
const boxPagination = document.querySelector("[box-pagination]");
if (boxPagination) {
  const url = new URL(window.location.href);

  boxPagination.addEventListener("change", () => {
    const value = boxPagination.value;
    if (value) {
      url.searchParams.set("page", value);
    } else {
      url.searchParams.delete("page");
    }
    window.location.href = url.href;
  });

  // Hiển thị lựa chọn mặc định
  const valueCurrent = url.searchParams.get("page");
  if (valueCurrent) {
    boxPagination.value = valueCurrent;
  }
}
// End box-pagination
