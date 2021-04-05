chrome.storage.local.get(["email", "password"], function (result) {
  const email = result["email"];
  const password = result["password"];
  const token = result["token"];

  console.log(`email`, email);
  console.log(`password`, password);
  console.log(`token`, token);

  if (email == undefined && password == undefined) {
    $(".login-page").append(`<h1 class="page-title">LMS Login</h1>
    <div class="form">
      <form class="login-form" id="login-form">
        <input type="text" id="username" placeholder="username" />
        <input type="password" id="password" placeholder="password" />
        <button id="login-submit">login</button>
      </form>
    </div>`);

    const formLogin = document.getElementById("login-form");
    const formLoginSubmit = document.getElementById("login-submit");

    if (formLogin && formLoginSubmit) {
      formLogin.addEventListener("submit", handleLogin);
    }
  } else {
    postLogin(email, password);
  }
});

function saveLoginData(email, password, token) {
  chrome.storage.local.set({ email, password, token }, () => {});
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("username");
  const password = document.getElementById("password");

  if (email && password) {
    await postLogin(email.value, password.value);
  }
}

async function postLogin(email, password) {
  let formdata = new FormData();
  formdata.append("username", email);
  formdata.append("password", password);
  formdata.append("service", "moodle_mobile_app");

  let requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow",
  };

  fetch("https://lms.ittelkom-pwt.ac.id/login/token.php", requestOptions)
    .then((response) => response.text())
    .then((result) => {
      const data = JSON.parse(result);
      saveLoginData(email, password, data.token);
      getListTask(email, password, data.token);
    })
    .catch((error) => console.log("error", error));
}

async function getListTask(email, password, token) {
  if (token) {
    let formdata = new FormData();

    let requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    fetch(
      `https://lms.ittelkom-pwt.ac.id/webservice/rest/server.php?wstoken=${token}&wsfunction=core_calendar_get_action_events_by_timesort&moodlewsrestformat=json`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const data = JSON.parse(result);
        data.events.map((item) => {
          $(".list-page").append(`<div class="timeline">
        <h3>${item.name}</h2>
        <p>${item.course.fullname}</p>
        <span class="cd-date">${formatTanggalCantik(
          new Date(item.timestart * 1000)
        )}</span> <br>
        <a href="${
          item.action.url
        }" class="add-submission" target="_blank">Add Submission</a>
      </div>`);
        });
      })
      .catch((error) => console.log("error", error));

    $(".login-page").remove()
  }
}

function formatTanggalCantik(date) {
  return moment(date).format("MMMM Do YYYY, h:mm:ss a");
}
