import loginIcon from "./assets/login.svg";

const formData = (form: HTMLFormElement) => {
  const inputs = form.querySelectorAll("input");
  let values: { [prop: string]: string } = {};

  inputs.forEach((input) => {
    values[input.id] = input.value;
  });
  return values;
};

// NOTE:エクスクラメーション（!）でnullを回避する
const loginImg = document.getElementById("loginImg")!;
(loginImg as HTMLInputElement).src = loginIcon;

// NOTE:index.jsの出力なら問題ないがjsファイルは読み込むことができない
const form = document.querySelector("form")!;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = formData(form);
  console.log(data, "data");
});
