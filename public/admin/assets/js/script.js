const initTinyMCE = (selector) => {
  tinymce.init({
    selector: selector,
    plugins: ["anchor", "link"],
    toolbar: "undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link anchor charmap image numlist bullist media",
    images_upload_url: `/${pathAdmin}/upload/image`,
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

// Filepond Image Multi
const listFilepondImageMulti = document.querySelectorAll("[filepond-image-multi]");
const filePondMulti = {};
if (listFilepondImageMulti.length > 0) {
  FilePond.registerPlugin(FilePondPluginImagePreview);
  FilePond.registerPlugin(FilePondPluginFileValidateType);

  listFilepondImageMulti.forEach((filepondImage) => {
    let listImageDefault = filepondImage.getAttribute("list-image-default");
    let files = null;
    if (listImageDefault) {
      listImageDefault = JSON.parse(listImageDefault);
      if (listImageDefault.length > 0) {
        files = [];
        listImageDefault.forEach((image) => {
          files.push({
            source: image,
          });
        });
      }
    }

    filePondMulti[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: "+",
      acceptedFileTypes: ["image/*"],
      files: files,
    });
  });
}
// End Filepond Image Multi

// Chart
const revenueChartElement = document.querySelector("#revenue-chart");
if (revenueChartElement) {
  // Lấy ngày hiện tại
  const now = new Date();

  // Lấy tháng và năm hiện tại
  const currentMonth = now.getMonth() + 1; // getMonth() trả về giá trị từ 0 đến 11, nên cần +1
  const currentYear = now.getFullYear();

  // Tạo một đối tượng Date mới cho tháng trước
  // Nếu hiện tại là tháng 1 thì new Date(currentYear, 0 - 1, 1) sẽ tự động chuyển thành tháng 12 của năm trước.
  const previousMonthDate = new Date(currentYear, now.getMonth() - 1, 1);

  // Lấy tháng và năm từ đối tượng previousMonthDate
  const previousMonth = previousMonthDate.getMonth() + 1;
  const previousYear = previousMonthDate.getFullYear();

  // Lấy ra tổng số ngày
  const daysInMonthCurrent = new Date(currentYear, currentMonth, 0).getDate();
  const daysInMonthPrevious = new Date(previousYear, previousMonth, 0).getDate();
  const days = daysInMonthCurrent > daysInMonthPrevious ? daysInMonthCurrent : daysInMonthPrevious;
  const arrayDay = [];
  for (let i = 1; i <= days; i++) {
    arrayDay.push(i);
  }

  const dataFinal = {
    currentMonth: currentMonth,
    currentYear: currentYear,
    previousMonth: previousMonth,
    previousYear: previousYear,
    arrayDay: arrayDay,
  };

  fetch(`/${pathAdmin}/dashboard/revenue-chart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataFinal),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.code == "success") {
        new Chart(revenueChart, {
          type: "line",
          data: {
            labels: ["01", "02", "03", "04", "05", "06"],
            labels: arrayDay,
            datasets: [
              {
                label: "Tháng 10/2025",
                data: [1200000, 1900000, 3000000, 1500000, 2000000, 2600000],
                label: `Tháng ${currentMonth}/${currentYear}`,
                data: data.dataMonthCurrent,
                borderWidth: 2,
                borderColor: "#36A1EA",
              },
              {
                label: "Tháng 09/2025",
                data: [1000000, 1600000, 2800000, 1800000, 2300000, 2400000],
                label: `Tháng ${previousMonth}/${previousYear}`,
                data: data.dataMonthPrevious,
                borderWidth: 2,
                borderColor: "#FE6383",
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

      // images
      if (filePondMulti.images.getFiles().length > 0) {
        filePondMulti.images.getFiles().forEach((item) => {
          formData.append("images", item.file);
        });
      }
      // End images

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

      // images
      if (filePondMulti.images.getFiles().length > 0) {
        filePondMulti.images.getFiles().forEach((item) => {
          formData.append("images", item.file);
        });
      }
      // End images

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
      const id = event.target.id.value;
      const fullname = event.target.fullName.value;
      const phone = event.target.phone.value;
      const note = event.target.note.value;
      const paymentMethod = event.target.paymentMethod.value;
      const paymentStatus = event.target.paymentStatus.value;
      const status = event.target.status.value;

      const dataFinal = {
        fullName: fullName,
        phone: phone,
        note: note,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        status: status,
      };

      fetch(`/${pathAdmin}/order/edit/${id}`, {
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
            notify.success(data.message);
          }
        });
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
      const form = event.target;

      const name = form.name.value;
      const phone = form.phone.value;
      const email = form.email.value;
      const address = form.address.value;
      const logo = filepond.logo?.getFile()?.file || null;
      const favicon = filepond.favicon?.getFile()?.file || null;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("address", address);
      if (logo) {
        formData.append("logo", logo);
      }
      if (favicon) {
        formData.append("favicon", favicon);
      }

      fetch(`/${pathAdmin}/setting/website-info`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "error") {
            notify.error(data.message);
          }

          if (data.code === "success") {
            notify.success(data.message);
            window.location.reload();
          }
        });
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
      const fullName = event.target.name.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const role = event.target.role.value;
      const positionCompany = event.target.position.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatar = filepond.avatar?.getFile()?.file || null;

      // Tạo FormData
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("role", role);
      formData.append("positionCompany", positionCompany);
      formData.append("status", status);
      formData.append("password", password);
      if (avatar) {
        formData.append("avatar", avatar);
      }

      fetch(`/${pathAdmin}/setting/account-admin/create`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            notify.success(data.message);
            window.location.reload(); // Load lại trang
          }
        });
    });
}
// End Account Admin Create Form

// Setting Account Admin Edit Form
const settingAccountAdminEditForm = document.querySelector("#setting-account-admin-edit-form");
if (settingAccountAdminEditForm) {
  const validator = new JustValidate("#setting-account-admin-edit-form");

  validator
    .addField("#fullName", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập họ tên!",
      },
      {
        rule: "minLength",
        value: 5,
        errorMessage: "Vui lòng nhập ít nhất 5 ký tự!",
      },
      {
        rule: "maxLength",
        value: 50,
        errorMessage: "Vui lòng nhập tối đa 50 ký tự!",
      },
    ])
    .addField("#email", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email!",
      },
      {
        rule: "email",
        errorMessage: "Email không đúng định dạng!",
      },
    ])
    .addField("#positionCompany", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập chức vụ!",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const role = event.target.role.value;
      const positionCompany = event.target.positionCompany.value;
      const status = event.target.status.value;
      const avatar = filePond.avatar.getFile()?.file;

      // Tạo FormData
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("role", role);
      formData.append("positionCompany", positionCompany);
      formData.append("status", status);
      formData.append("avatar", avatar);

      fetch(`/${pathAdmin}/setting/account-admin/edit/${id}`, {
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
// End Setting Account Admin Edit Form

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

      const listPermissionChecked = document.querySelectorAll('input[name="permissions"]:checked');
      listPermissionChecked.forEach((input) => {
        permissions.push(input.value);
      });

      const dataFinal = {
        name: name,
        description: description,
        permissions: permissions,
      };

      fetch(`/${pathAdmin}/setting/role/create`, {
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
            window.location.reload();
          }
        });
    });
}
// End Role Create Form

// Setting Role Edit Form
const settingRoleEditForm = document.querySelector("#setting-role-edit-form");
if (settingRoleEditForm) {
  const validator = new JustValidate("#setting-role-edit-form");

  validator
    .addField("#name", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập tên nhóm quyền!",
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const description = event.target.description.value;
      const permissions = [];

      // permissions
      const listPermissionChecked = document.querySelectorAll(`[name="permissions"]:checked`);
      listPermissionChecked.forEach((input) => {
        permissions.push(input.value);
      });
      // End permissions

      const dataFinal = {
        name: name,
        description: description,
        permissions: permissions,
      };

      fetch(`/${pathAdmin}/setting/role/edit/${id}`, {
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
            notify.success(data.message);
          }
        });
    });
}
// End Setting Role Edit Form

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
      const favicon = filepond.favicon.getFile()?.file;

      // Tạo FormData
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("avatar", avatar);

      fetch(`/${pathAdmin}/profile/edit`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            drawNotify(data.code, data.message);
            window.location.reload();
          }
        });
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

      // Tạo FormData
      const formData = new FormData();
      formData.append("password", password);

      fetch(`/${pathAdmin}/profile/change-password`, {
        method: "PATCH",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == "error") {
            notify.error(data.message);
          }

          if (data.code == "success") {
            drawNotify(data.code, data.message);
            window.location.reload();
          }
        });
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
