import loginIcon from "../assets/icon/login.svg";

export class Login {
  form: HTMLFormElement;
  loginImage: HTMLElement;

  constructor() {
    this.form = document.querySelector("form")!;
    this.loginImage = document.getElementById("loginImg")!;
    this.configure();
    this.renderImage();
  }

  configure() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = this.formData(this.form);
      console.log(data, "data");
    });
  }

  renderImage() {
    (this.loginImage as HTMLInputElement).src = loginIcon;
  }

  formData = (form: HTMLFormElement) => {
    const inputs = form.querySelectorAll("input");
    let values: { [prop: string]: string } = {};
    inputs.forEach((input) => {
      values[input.id] = input.value;
    });
    return values;
  };
}
