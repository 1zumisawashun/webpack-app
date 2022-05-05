import { Component } from "./base-component";
import { autobind as Autobind } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import * as Validation from "../utilities/validation";
// NOTE:エイリアスを使ってオブジェクトのように扱うこともできる
// NOTE:こうすることでグループ化することによってインポートされた要素であることを暗に示すことができる

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement; // NOTE:インスタンス変数
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.mandayInputElement = this.element.querySelector(
      "#manday"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    // NOTE:this.element.addEventListener("submit", this.submitHandler.bind(this));
    // NOTE:デコレータを使って解決することもできる。以下デコレータを使った場合の例。
    this.element.addEventListener("submit", this.submitHandler);
  }
  renderContent() {}

  // NOTE:タプル型で定義すると下記になる
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredManday = this.mandayInputElement.value;

    const titleValidatable: Validation.Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validation.Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const mandayValidatable: Validation.Validatable = {
      value: +enteredManday,
      required: true,
      min: 1,
      max: 1000,
    };

    if (
      !Validation.validate(titleValidatable) ||
      !Validation.validate(descriptionValidatable) ||
      !Validation.validate(mandayValidatable)
    ) {
      alert("入力値が正しくありません。再度お試しください。");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredManday];
    }
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.mandayInputElement.value = "";
  }

  // NOTE:呼び出し元で.bind(this)することで呼び出し元と同じオブジェクトを参照する
  // NOTE:このままだと呼び出し元（configure）がthisになる
  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    // NOTE:ランタイム上ではタプルかどうか確認できないのでArrayかで判断する
    if (Array.isArray(userInput)) {
      const [title, desc, manday] = userInput;
      projectState.addProject(title, desc, manday);
      this.clearInput();
    }
  }
}
