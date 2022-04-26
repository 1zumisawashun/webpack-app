import loginIcon from "./assets/login.svg";
import { formData } from "./forms";

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
